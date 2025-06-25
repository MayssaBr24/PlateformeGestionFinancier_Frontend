import React, { useState } from 'react';
import axios from 'axios';
import {ArrowLeft} from "lucide-react";

const AjouterCadre = ({ onCadreAjoute, onRetour }) => {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [salaireBrut, setSalaireBrut] = useState('');
    const [compteBancaire, setCompteBancaire] = useState('');
    const [banque, setBanque] = useState('');
    const [typePaiement, setTypePaiement] = useState('virement bancaire');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const newCadre = {
                nom,
                prenom,
                email,
                salaireBrut: parseFloat(salaireBrut),
                avance: 0,
                type: typePaiement,
                compteBancaire: typePaiement === 'virement bancaire' ? compteBancaire : null,
                banque: typePaiement === 'virement bancaire' ? banque : null
            };

            const response = await axios.post(
                'https://localhost/api/cadres-administratifs/ajouter',
                newCadre
            );

            onCadreAjoute(response.data); // <-- Très important

            // Réinitialiser les champs
            setNom('');
            setPrenom('');
            setEmail('');
            setSalaireBrut('');
            setCompteBancaire('');
            setBanque('');
            setTypePaiement('virement bancaire');

            onRetour(); // Retour après ajout réussi
        } catch (err) {
            setError(err.response?.data || 'Erreur lors de l\'ajout du cadre');
            console.error("Erreur d'ajout:", err.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-start p-4 mt-8">
                <button
                    onClick={onRetour}
                    className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
                >
                    <ArrowLeft className="mr-2" size={16} />
                    Retour à la liste
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                <h2 className="text-2xl font-bold mb-6">Ajouter un cadre administratif</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nom" className="block mb-1">Nom</label>
                            <input
                                id="nom"
                                type="text"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="prenom" className="block mb-1">Prénom</label>
                            <input
                                id="prenom"
                                type="text"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="salaireBrut" className="block mb-1">Salaire brut (DT)</label>
                            <input
                                id="salaireBrut"
                                type="number"
                                step="0.01"
                                value={salaireBrut ?? ''}
                                onChange={(e) => setSalaireBrut(e.target.value === '' ? null : parseFloat(e.target.value))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="typePaiement" className="block mb-1">Type de paiement</label>
                            <select
                                id="typePaiement"
                                value={typePaiement}
                                onChange={(e) => setTypePaiement(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="virement bancaire">Virement bancaire</option>
                                <option value="espèce">Espèce</option>
                                <option value="chèque">Chèque</option>
                            </select>
                        </div>

                        {typePaiement === 'virement bancaire' && (
                            <>
                                <div>
                                    <label htmlFor="compteBancaire" className="block mb-1">Compte Bancaire</label>
                                    <input
                                        id="compteBancaire"
                                        type="text"
                                        value={compteBancaire}
                                        onChange={(e) => setCompteBancaire(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required={typePaiement === 'virement bancaire'}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="banque" className="block mb-1">Banque</label>
                                    <input
                                        id="banque"
                                        type="text"
                                        value={banque}
                                        onChange={(e) => setBanque(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required={typePaiement === 'virement bancaire'}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterCadre;