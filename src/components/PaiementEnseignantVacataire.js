import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify'; // pour les notifications


const PaiementEnseignantVacataire = ({ vacataire, onRetour, onPaiementSuccess }) => {
    const [typePaiement, setTypePaiement] = useState('salaire');
    const [nombreHeures, setNombreHeures] = useState(vacataire?.nombreHeures || 0);
    const [tauxHoraire, setTauxHoraire] = useState(vacataire?.tauxHoraire || 0);
    const [montantAvance, setMontantAvance] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [retenueSource, setRetenueSource] = useState(() => {
        const savedValue = localStorage.getItem('retenueSource');
        return savedValue ? parseFloat(savedValue) : 15;

    });



    // Sauvegarde automatique dans localStorage
    useEffect(() => {
        localStorage.setItem('retenueSource', retenueSource.toString());
    }, [retenueSource]);

    // Mise à jour de editForm lorsque retenueSource change
    useEffect(() => {
        setEditForm(prev => ({
            ...prev,
            retenueSource: retenueSource
        }));
    }, [retenueSource]);


    const [editForm, setEditForm] = useState({
        nom: vacataire?.nom || '',
        prenom: vacataire?.prenom || '',
        email: vacataire?.email || '',
        tauxHoraire: vacataire?.tauxHoraire || 0,
        compteBancaire: vacataire?.compteBancaire || '',
        banque: vacataire?.banque || '',
        type: vacataire?.type || 'virement bancaire',
        cin: vacataire?.cin || '',
        retenueSource: retenueSource
    });

    const calculerSalaireBrut = () => {
        return nombreHeures * tauxHoraire;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (typePaiement === 'salaire') {
                await axios.post(
                    `https://localhost/api/enseignants-vacataires/${vacataire.id}/paiement`,
                    {
                        type: typePaiement,
                        nombreHeures: nombreHeures,
                        tauxHoraire: tauxHoraire
                    }
                );
            } else if (typePaiement === 'avance') {
                await axios.post(
                    `https://localhost/api/enseignants-vacataires/${vacataire.id}/paiement`,
                    {
                        type: typePaiement,
                        montant: parseFloat(montantAvance)
                    }
                );
            }

            if (onPaiementSuccess) {
                await onPaiementSuccess();
            }

            setIsSubmitted(true);
        } catch (error) {
            console.error('Erreur lors du paiement:', error);
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
            await axios.put(`https://localhost/api/enseignants-vacataires/${vacataire.id}`, editForm);
            setIsEditModalOpen(false);
            if (onPaiementSuccess) {
                await onPaiementSuccess();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    if (!vacataire) {
        return <div className="p-4 text-red-500">Aucune information sur l'enseignant vacataire sélectionné.</div>;
    }


    const handleGenerateReceipt = async () => {
        try {
            // Calcul direct plutôt que fonction
            const salaireNet = calculerSalaireBrut() * (1 - retenueSource/100) - (vacataire.totalAvances || 0);

            const { data: pdfData } = await axios.post(
                `https://localhost/api/enseignants-vacataires/${vacataire.id}/recu`,
                {
                    nom: vacataire.nom,
                    prenom: vacataire.prenom,
                    cin: vacataire.cin,
                    nombreHeures: nombreHeures,
                    tauxHoraire: tauxHoraire,
                    montantAvance: vacataire.totalAvances || 0,
                    retenueSource: retenueSource, // Envoi de la valeur actuelle
                    salaireNet: salaireNet // Envoi de la valeur calculée
                },
                { responseType: 'blob' }
            );

            // 3. Télécharger immédiatement le PDF
            const pdfUrl = window.URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.setAttribute('download', `recu_${vacataire.nom}_${vacataire.prenom}.pdf`);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();

            // 4. Après succès du reçu => Reset avance
            await axios.put(`https://localhost/api/enseignants-vacataires/${vacataire.id}/reset-avance`);

            // 5. Récupérer les nouvelles infos du vacataire
            const { data: updatedVacataire } = await axios.get(`https://localhost/api/enseignants-vacataires/${vacataire.id}`);

            // 6. Mettre à jour l'affichage / appeler onPaiementSuccess
            if (onPaiementSuccess) {
                await onPaiementSuccess(updatedVacataire);
            }

            // 7. Afficher une notification de succès 🎉
            toast.success(`Reçu généré et avance remise à zéro pour ${vacataire.nom} ${vacataire.prenom} !`);

            setIsSubmitted(true);

        } catch (error) {
            console.error('Erreur lors de la génération du reçu:', error.response ? error.response.data : error.message);            toast.error('Erreur lors de la génération du reçu. Veuillez réessayer.');
        }
    };

    const handleSubmitAndGenerate = async (e) => {
        e.preventDefault();

        try {
            // 1. Enregistrer le paiement
            await handleSubmit(e); // On utilise le même e.preventDefault()

            // 2. Générer le reçu seulement si l'enregistrement a réussi
            await handleGenerateReceipt();

        } catch (error) {
            console.error('Erreur lors du processus complet:', error);
            toast.error('Une erreur est survenue lors du processus');
        }
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
                    Paiement pour {vacataire.prenom} {vacataire.nom}
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="ml-3 text-blue-500 hover:text-blue-400"
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
                                <h3 className="text-xl font-semibold mb-6 text-center">Modifier l'enseignant</h3>
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

                                    <div>
                                        <label className="text-gray-700 font-medium">Cin:</label>
                                        <input
                                            type="text"
                                            name="cin"
                                            value={editForm.cin}
                                            onChange={handleEditChange}
                                            className="mt-1 w-full border p-2 rounded-md"
                                            required
                                        />
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type de paiement</label>
                            <select
                                value={typePaiement}
                                onChange={(e) => setTypePaiement(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="salaire">Paiement du salaire</option>
                                <option value="avance">Avance</option>
                            </select>
                        </div>

                        {typePaiement === 'salaire' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre d'heures</label>
                                    <input
                                        type="number"
                                        value={nombreHeures}
                                        onChange={(e) => setNombreHeures(parseInt(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Taux horaire (DT)</label>
                                    <input
                                        type="number"
                                        value={tauxHoraire}
                                        onChange={(e) => setTauxHoraire(parseFloat(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <label className="block text-sm font-medium text-gray-700">Retenue à la source</label>

                                <input
                                    type="number"
                                    value={retenueSource}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) ;
                                        setRetenueSource(newValue);
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                    <p className="font-medium">Détails du paiement :</p>
                                    <p>Nombre d'heures: {nombreHeures}</p>
                                    <p>Taux horaire: {tauxHoraire?.toFixed(3)} DT</p>
                                    <p>Retenue à la source: {retenueSource?.toFixed(3)} %</p>
                                    <p>Salaire brut: {calculerSalaireBrut().toFixed(3)} DT</p>
                                    <p>Total des avances: {(vacataire.totalAvances || 0).toFixed(3)} DT</p>
                                    <p className="text-blue-600 font-bold text-xl flex items-center">
                                        Salaire net versé: {(calculerSalaireBrut() * (1 - retenueSource/100) - (vacataire.totalAvances || 0)).toFixed(3)} DT
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    onClick={handleSubmitAndGenerate}
                                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
                                >
                                     Générer le Reçu
                                </button>


                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Montant de l'avance (DT)</label>
                                <input
                                    type="number"
                                    value={montantAvance}
                                    onChange={(e) => setMontantAvance(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                    min="0"
                                    step="0.01"
                                />

                                <button
                                    type="submit"

                                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        )}






                    </form>
                )}
            </div>
        </>
    );
};

export default PaiementEnseignantVacataire;