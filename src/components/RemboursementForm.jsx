import React, { useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const RemboursementForm = ({ onRetour }) => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        classe: '',
        montant: '',
        motif: ''
    });
    const [messageSucces, setMessageSucces] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.montant || parseFloat(formData.montant) <= 0) {
            setError("Le montant doit être supérieur à 0");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post('https://localhost/api/remboursements', formData);

            const pdfResponse = await axios.post('https://localhost/api/remboursements/generate', formData, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `remboursement_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();

            setMessageSucces("Remboursement enregistré avec succès");
            setFormData({
                nom: '',
                prenom: '',
                classe: '',
                montant: '',
                motif: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="mb-4">
                <button
                    onClick={onRetour}
                    className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
                >
                    <ArrowLeft className="mr-2" size={16} />
                    Retour
                </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Formulaire de Remboursement</h2>

                {messageSucces && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        {messageSucces}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input
                                type="text"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                            <input
                                type="text"
                                name="classe"
                                value={formData.classe}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (DT)</label>
                            <input
                                type="number"
                                name="montant"
                                value={formData.montant}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motif du remboursement</label>
                        <textarea
                            name="motif"
                            value={formData.motif}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors disabled:bg-blue-300"
                        >
                            <Printer className="mr-2" size={18} />
                            {isLoading ? 'Génération en cours...' : 'Générer le reçu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RemboursementForm;