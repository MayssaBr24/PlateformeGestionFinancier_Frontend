import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, PlusCircle, ArrowLeft } from 'lucide-react';

export default function ServicesDivers() {
    const [reçus, setReçus] = useState([]);
    const [formulaire, setFormulaire] = useState({
        type: '',
        responsable: '',
        montant: '',
        sujet: '',
        date: '',
        modePaiement: 'Espèces',
        remarques: '',
        signature: ''
    });

    const [formVisible, setFormVisible] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchReçus();
    }, []);

    const fetchReçus = async () => {
        const res = await axios.get('https://localhost/api/recus');
        setReçus(res.data);
    };

    const handleChange = (e) => {
        setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (isGenerating) return; // Empêcher le double-clic

        setIsGenerating(true);
        try {
            const res = await axios.post('https://localhost/api/recus', formulaire, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `recu_${formulaire.type}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Fermer le PDF après téléchargement
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);

            fetchReçus();
            setFormVisible(false);
            resetForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const resetForm = () => {
        setFormulaire({
            type: '',
            responsable: '',
            montant: '',
            sujet: '',
            date: '',
            modePaiement: 'Espèces',
            remarques: '',
            signature: ''
        });
    };

    const openForm = (type) => {
        resetForm();
        setFormulaire(prev => ({ ...prev, type }));
        setFormVisible(true);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">

            <div className="flex gap-4 mb-8">
                <button
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg transition-all"
                    onClick={() => openForm('entrant')}
                >
                    <PlusCircle size={20} />
                    Nouvelle Entrée Financière
                </button>
                <button
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg transition-all"
                    onClick={() => openForm('sortant')}
                >
                    <PlusCircle size={20} />
                    Nouvelle Dépense
                </button>
            </div>

            {formVisible && (
                <div className="border border-gray-200 p-6 rounded-xl shadow-md mb-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Responsable</label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="text"
                                name="responsable"
                                value={formulaire.responsable}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Montant (DT)</label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="number"
                                name="montant"
                                value={formulaire.montant}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Sujet</label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="text"
                                name="sujet"
                                value={formulaire.sujet}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Mode de Paiement</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                name="modePaiement"
                                value={formulaire.modePaiement}
                                onChange={handleChange}
                            >
                                <option value="Espèces">Espèces</option>
                                <option value="Chèque">Chèque</option>
                                <option value="Virement bancaire">Virement bancaire</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block mb-2 font-medium text-gray-700">Remarques</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                name="remarques"
                                value={formulaire.remarques}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        {formulaire.type === 'sortant' && (
                            <div className="md:col-span-2">
                                <label className="block mb-2 font-medium text-gray-700">Signature</label>
                                <input
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    type="text"
                                    name="signature"
                                    value={formulaire.signature}
                                    onChange={handleChange}
                                    placeholder="Nom du signataire"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={() => setFormVisible(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white ${isGenerating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                        >
                            {isGenerating ? 'Génération...' : (
                                <>
                                    <Download size={18} />
                                    Générer le Reçu
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Historique des Transactions</h2>
            <div className="space-y-4">
                {reçus.length === 0 ? (
                    <p className="text-gray-500 italic">Aucun reçu enregistré</p>
                ) : (
                    reçus.map((recu, index) => (
                        <div key={index} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-lg">
                                        {recu.type === 'entrant' ? (
                                            <span className="text-blue-500">Entrée</span>
                                        ) : (
                                            <span className="text-blue-700">Sortie</span>
                                        )}
                                    </h3>
                                    <p className="text-gray-600">{recu.responsable}</p>
                                </div>
                                <p className="font-bold text-xl">
                                    {recu.montant} DT
                                </p>
                            </div>
                            <p className="mt-2 text-gray-700"><span className="font-medium">Sujet:</span> {recu.sujet}</p>
                            <div className="flex justify-between mt-3 text-sm text-gray-500">
                                <p>{recu.date}</p>
                                <p>{recu.modePaiement}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}