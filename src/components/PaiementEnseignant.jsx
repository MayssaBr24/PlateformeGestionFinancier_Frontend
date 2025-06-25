import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PaiementEnseignantPermanent = ({ enseignant, onRetour, onPaiementSuccess }) => {
    const [montant, setMontant] = useState('');
    const [typePaiement, setTypePaiement] = useState('salaire');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [editForm, setEditForm] = useState({
        nom: enseignant?.nom || '',
        prenom: enseignant?.prenom || '',
        email: enseignant?.email || '',
        salaireBrut: enseignant?.salaireBrut || 0,
        compteBancaire: enseignant?.compteBancaire || '',
        banque: enseignant?.banque || '',
        type: enseignant?.type || 'virement bancaire' ,



    });

    useEffect(() => {
        if (typePaiement === 'salaire') {
            setMontant(enseignant?.salaireBrut?.toString() || '0');
        } else {
            setMontant('');
        }
    }, [typePaiement, enseignant?.salaireBrut]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const paiementData = {
                type: typePaiement,
                montant: parseFloat(montant)
            };

            if (typePaiement === 'salaire') {
                paiementData.compteBancaire = editForm.compteBancaire;
                paiementData.banque = editForm.banque;
            }

            const response = await axios.post(
                `https://localhost/api/enseignants-permanents/${enseignant.id}/paiement`,
                paiementData
            );

            if (onPaiementSuccess) {
                await onPaiementSuccess();
            }

            // Nouveau: Préparer les données du reçu
            setReceiptData({
                nom: enseignant.nom,
                prenom: enseignant.prenom,
                salaireBrut: enseignant.salaireBrut,
                totalAvances: enseignant.totalAvances || 0,
                montantVerse: parseFloat(montant),
                date: new Date().toLocaleDateString(),
                typePaiement: typePaiement
            });

            setIsSubmitted(true);
            setShowReceiptModal(true); // Afficher le modal après paiement
        } catch (error) {
            console.error('Erreur lors du paiement:', error);
        }
    };
    const handleGenerateAndDownloadReceipt = () => {
        // Implémentation de la génération du PDF
        const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reçu_${receiptData.prenom}_${receiptData.nom}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://localhost/api/enseignants-permanents/${enseignant.id}`, editForm);
            setIsEditModalOpen(false);
            if (onPaiementSuccess) {
                await onPaiementSuccess();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    if (!enseignant) {
        return <div className="p-4 text-red-500">Aucune information sur l'enseignant sélectionné.</div>;
    }

    return (
        <>
            <div className="flex justify-start p-4 mt-8">
                <button
                    onClick={onRetour}
                    className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
                >
                    <ArrowLeft className="mr-2" size={16} />
                    Retour à la liste
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    Paiement pour {enseignant.prenom} {enseignant.nom}
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="ml-3 text-blue-600 hover:text-blue-700"
                    >
                        <Pencil size={22} />
                    </button>
                </h2>

                {/* Modal d'édition */}
                <AnimatePresence>
                    {isEditModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                className="bg-white p-8 rounded-2xl shadow-2xl w-[400px]"
                            >
                                <h3 className="text-xl text-blue-600 font-semibold mb-6 text-center">Modifier l'enseignant</h3>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-gray-700 font-medium">Nom :</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={editForm.nom}
                                            onChange={handleEditChange}
                                            className="mt-1 w-full border p-2 rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-700 font-medium">Prénom :</label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            value={editForm.prenom}
                                            onChange={handleEditChange}
                                            className="mt-1 w-full border p-2 rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-700 font-medium">Email :</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                            className="mt-1 w-full border p-2 rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-700 font-medium">Salaire :</label>
                                        <input
                                            type="text"
                                            name="salaireBrut"
                                            value={editForm.salaireBrut}
                                            onChange={handleEditChange}
                                            className="mt-1 w-full border p-2 rounded-md"
                                            required
                                        />
                                    </div>



                                    <div>
                                        <label className="text-gray-700 font-medium">Type de paiement :</label>
                                        <select
                                            name="type"
                                            value={editForm.type}
                                            onChange={handleEditChange}
                                            className="w-full border p-2 rounded-md"
                                        >
                                            <option value="virement bancaire">Virement bancaire</option>
                                            <option value="espèce">Espèce</option>
                                            <option value="chèque">Chèque</option>
                                        </select>
                                    </div>

                                    {editForm.type === 'virement bancaire' && (
                                        <>
                                            <div>
                                                <label className="text-gray-700 font-medium">Compte Bancaire :</label>
                                                <input
                                                    type="text"
                                                    name="compteBancaire"
                                                    value={editForm.compteBancaire}
                                                    onChange={handleEditChange}
                                                    className="mt-1 w-full border p-2 rounded-md"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-gray-700 font-medium">Banque :</label>
                                                <input
                                                    type="text"
                                                    name="banque"
                                                    value={editForm.banque}
                                                    onChange={handleEditChange}
                                                    className="mt-1 w-full border p-2 rounded-md"
                                                    required
                                                />
                                            </div>



                                        </>




                                    )}

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal de reçu */}
                <AnimatePresence>
                    {showReceiptModal && receiptData && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                className="bg-white p-8 rounded-2xl shadow-2xl w-[500px]"
                            >
                                <h3 className="text-xl font-semibold mb-6 text-center">Détails du paiement</h3>

                                <div className="space-y-4 mb-6">
                                    <p className="text-lg">
                                        <span className="font-medium">Nom et prénom : </span>
                                        <span className="font-bold">{receiptData.prenom} {receiptData.nom}</span>
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium">Type de paiement : </span>
                                        <span className="font-bold capitalize">{receiptData.typePaiement}</span>
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium">Salaire brut : </span>
                                        <span className="font-bold">{receiptData.salaireBrut.toFixed(2)} DT</span>
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium">Total des avances : </span>
                                        <span className="font-bold">{receiptData.totalAvances.toFixed(2)} DT</span>
                                    </p>
                                    <p className="text-blue-600 font-semibold text-lg">
                                        <span className="font-medium">Montant versé : </span>
                                        <span>{receiptData.montantVerse.toFixed(2)} DT</span>
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium">Date : </span>
                                        <span className="font-bold">{receiptData.date}</span>
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowReceiptModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGenerateAndDownloadReceipt}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Télécharger le reçu
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>



                {isSubmitted ? (
                    <div className="text-center py-8">
                        <CheckCircle className="mx-auto text-green-500" size={48} />
                        <p className="mt-4 text-lg">Paiement enregistré avec succès !</p>
                        <button
                            onClick={onRetour}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Retour à la liste
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Type de paiement :</label>
                            <select
                                value={typePaiement}
                                onChange={(e) => setTypePaiement(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm p-2"
                            >
                                <option value="salaire">Salaire</option>
                                <option value="avance">Avance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Montant (DT) :</label>
                            <input
                                type="number"
                                value={montant}
                                onChange={(e) => setMontant(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm p-2"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {typePaiement === 'salaire' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium">Détails du paiement :</p>
                                <p>Salaire brut : {enseignant.salaireBrut?.toFixed(2) || '0.00'} DT</p>
                                <p>Total des avances : {(enseignant.totalAvances || 0).toFixed(2)} DT</p>
                                <p className="text-green-600 font-semibold">
                                    Salaire net versé : {(enseignant.salaireBrut - (enseignant.totalAvances || 0)).toFixed(2)} DT
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg"
                        >
                            Enregistrer le paiement
                        </button>
                    </form>
                )}
            </div>
        </>
    );
};

export default PaiementEnseignantPermanent;