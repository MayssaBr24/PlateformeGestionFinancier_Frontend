 import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaiementCadreAdministratif = ({ cadre, onRetour, onPaiementSuccess }) => {
    const [montant, setMontant] = useState('');
    const [typePaiement, setTypePaiement] = useState('salaire');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [avanceARembourser, setAvanceARembourser] = useState('');
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [localCadre, setLocalCadre] = useState(cadre); // Initialisez avec vos données

    const [editForm, setEditForm] = useState({
        nom: cadre?.nom || '',
        prenom: cadre?.prenom || '',
        email: cadre?.email || '',
        salaireBrut: cadre?.salaireBrut || 0,
        compteBancaire: cadre?.compteBancaire || '',
        banque: cadre?.banque || '',
        type: cadre?.type || 'Espèce'
    });
    useEffect(() => {
        setLocalCadre(cadre);
    }, [cadre]);

    useEffect(() => {
        if (typePaiement === 'salaire') {
            setMontant(cadre?.salaireBrut?.toString() || '0');
        } else {
            setMontant('');
        }
    }, [typePaiement, cadre?.salaireBrut]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const paiementData = {
                type: typePaiement,
                montant: parseFloat(montant)
            };

            if (typePaiement === 'salaire') {
                paiementData.avanceARembourser = parseFloat(avanceARembourser) || 0;
            }

            const response = await axios.post(
                `https://localhost/api/cadres-administratifs/${cadre.id}/paiement`,
                paiementData
            );

            // Mise à jour IMMÉDIATE du state local
            setLocalCadre(prev => ({
                ...prev,
                totalAvances: response.data.totalAvances,
                salaireNet: response.data.salaireNet
            }));

            if (typePaiement === 'salaire') {
                setReceiptData({
                    nom: cadre.nom,
                    prenom: cadre.prenom,
                    salaireBrut: cadre.salaireBrut,
                    avanceRemboursee: parseFloat(avanceARembourser) || 0,
                    salaireNet: response.data.salaireNet,
                    resteAvance: response.data.totalAvances
                });
                setShowReceiptModal(true);
            }

            setIsSubmitted(true);
            toast.success("Paiement enregistré avec succès");

        } catch (error) {
            console.error('Erreur lors du paiement:', error);
            toast.error('Erreur lors du paiement. Veuillez réessayer.');
        }
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
            const response = await axios.put(
                `https://localhost/api/cadres-administratifs/${cadre.id}`,
                editForm
            );

            // Mise à jour IMMÉDIATE du state local
            setLocalCadre(prev => ({
                ...prev,
                ...response.data
            }));

            setIsEditModalOpen(false);
            if (onPaiementSuccess) {
                await onPaiementSuccess();
            }
            toast.success("Modifications enregistrées avec succès");
        } catch (error) {
            console.error('Erreur lors de la mise à jour du cadre:', error);
            toast.error('Erreur lors de la mise à jour. Veuillez réessayer.');
        }
    };

    const handleGenerateAndDownloadReceipt = async () => {
        try {
            const { data: pdfData } = await axios.post(
                `https://localhost/api/cadres-administratifs/${cadre.id}/recu`,
                receiptData,
                { responseType: 'blob' }
            );

            const pdfUrl = window.URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.setAttribute('download', `Recu_${cadre.nom}_${cadre.prenom}.pdf`);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();

            toast.success(`Reçu généré avec succès pour ${cadre.nom} ${cadre.prenom} !`);
            setShowReceiptModal(false);
        } catch (error) {
            console.error('Erreur lors de la génération du reçu:', error);
            toast.error('Erreur lors de la génération du reçu. Veuillez réessayer.');
        }
    };

    if (!cadre) {
        return <div className="p-4 text-red-500">Aucune information sur le cadre administratif sélectionné.</div>;
    }

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setEditForm((prev) => ({ ...prev, type: newType }));
    };

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
                    Paiement pour {localCadre.prenom} {localCadre.nom}
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="ml-3 text-blue-600 hover:text-gray-700"
                    >
                        <Pencil size={22} />
                    </button>
                </h2>

                {/* Modal d'édition avec animation */}
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
                                <h3 className="text-xl font-semibold mb-6 text-center">Modifier les informations</h3>
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
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-700 font-medium">Salaire Brut :</label>
                                        <input
                                            type="number"
                                            name="salaireBrut"
                                            value={editForm.salaireBrut}
                                            onChange={handleEditChange}
                                            className="mt-1 w-full border p-2 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-700 font-medium">Compte Bancaire :</label>
                                        <input
                                            type="text"
                                            name="compteBancaire"
                                            value={editForm.compteBancaire}
                                            onChange={handleEditChange}
                                            className="mt-1 w-full border p-2 rounded-md"
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
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-700 font-medium">Type de paiement :</label>
                                        <select
                                            value={editForm.type}
                                            onChange={handleTypeChange}
                                            className="w-full border p-2 rounded-md"
                                        >
                                            <option value="Espèce">Espèce</option>
                                            <option value="Virement bancaire">Virement bancaire</option>
                                            <option value="Chèque">Chèque</option>
                                        </select>
                                    </div>

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
                    {showReceiptModal && (
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
                                        <span className="font-medium">Salaire brut : </span>
                                        <span className="font-bold">{receiptData.salaireBrut.toFixed(2)} DT</span>
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium">Avance remboursée : </span>
                                        <span className="font-bold">{receiptData.avanceRemboursee.toFixed(2)} DT</span>
                                    </p>
                                    <p className="text-blue-600 font-semibold">
                                        Salaire net versé : {(localCadre.salaireBrut - (parseFloat(avanceARembourser) || 0)).toFixed(2)} DT
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium">Reste d'avance : </span>
                                        <span className="font-bold">{receiptData.resteAvance.toFixed(2)} DT</span>
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
                                <option value="salaire">Paiement espèces</option>
                                <option value="avance">Avance</option>
                            </select>
                        </div>

                        {typePaiement === 'salaire' && (
                            <>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="font-medium mb-2">Total d'avance : <span className="font-bold">{(localCadre.totalAvances || 0).toFixed(2)} DT</span></p>
                                    <div className="mt-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Avance à rembourser (DT) :</label>
                                        <input
                                            type="number"
                                            value={avanceARembourser}
                                            onChange={(e) => setAvanceARembourser(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm p-2"
                                            min="0"
                                            max={localCadre.totalAvances || 0}
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="font-medium">Détails du paiement :</p>
                                    <p>Salaire brut : {localCadre.salaireBrut?.toFixed(2) || '0.00'} DT</p>
                                    <p>Avance remboursée : {(parseFloat(avanceARembourser) || 0).toFixed(2)} DT</p>
                                    <p>Reste d'avance : {((localCadre.totalAvances || 0) - (parseFloat(avanceARembourser) || 0)).toFixed(2)} DT</p>
                                    <p className="text-blue-600 font-semibold">
                                        Salaire net versé : {(localCadre.salaireBrut - (parseFloat(avanceARembourser) || 0)).toFixed(2)} DT
                                    </p>
                                </div>
                            </>
                        )}

                        {typePaiement === 'avance' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Montant de l'avance (DT) :</label>
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
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg"
                            onClick={(e) => {
                                if (typePaiement === 'avance') {
                                    // Pour les avances, on enregistre seulement
                                    handleSubmit(e);
                                    return;
                                }
                                // Pour les salaires, le modal sera géré dans handleSubmit
                            }}
                        >
                            {typePaiement === 'avance' ? 'Enregistrer' : 'Enregistrer et générer le reçu'}
                        </button>
                    </form>
                )}
            </div>
        </>
    );
};

export default PaiementCadreAdministratif;