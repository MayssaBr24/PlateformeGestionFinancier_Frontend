import React, { useEffect, useState, useCallback } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import AjouterEnseignant from './AjouterEnseignant';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from "axios";

const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

const EnseignantPermanentList = ({ enseignants = [], onPaiementClick, onDataUpdate, onAddEnseignantClick }) => {
    const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));
    const [enseignantsSelectionnes, setEnseignantsSelectionnes] = useState({});
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [localEnseignants, setLocalEnseignants] = useState([]);
    const [ajouterMode, setAjouterMode] = useState(false);
    const [enseignantsDesactives, setEnseignantsDesactives] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [activeResponse, inactiveResponse] = await Promise.all([
                axios.get('https://localhost/api/enseignants-permanents/actifs'),
                axios.get('https://localhost/api/enseignants-permanents/inactifs')
            ]);

            setLocalEnseignants(activeResponse.data);
            setEnseignantsDesactives(inactiveResponse.data);

            const initialSelection = {};
            activeResponse.data.forEach(e => {
                initialSelection[e.id] = e.type?.trim().toLowerCase() === 'virement bancaire';
            });
            setEnseignantsSelectionnes(initialSelection);

        } catch (error) {
            console.error("Erreur lors du rafraîchissement des données", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOrdreDeVirement = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setError(null);

        try {
            const idsSelectionnes = Object.keys(enseignantsSelectionnes)
                .filter(id => enseignantsSelectionnes[id])
                .map(id => parseInt(id));

            if (idsSelectionnes.length === 0) {
                setError("Veuillez sélectionner au moins un enseignant permanent");
                return;
            }

            const response = await axios.post(
                'https://localhost/api/enseignants-permanents/virement-multiple',
                { date: selectedDate, enseignantIds: idsSelectionnes },
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ordre-de-virement-enseignants-${selectedDate}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Rafraîchir les données après la génération du virement
            await fetchData();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error("Erreur lors de la génération:", error);
            setError(error.response?.data?.message || "Erreur lors de la génération du document");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePaiement = async (enseignant) => {
        try {
            await onPaiementClick(enseignant);
            // Pas de refreshData ici, laisser le parent gérer si nécessaire
        } catch (error) {
            console.error("Erreur lors du paiement", error);
        }
    };

    const toggleSelection = (id) => {
        setEnseignantsSelectionnes(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setError(null);
    };

    const handleAddEnseignant = () => {
        setAjouterMode(true);
    };

    const handleEnseignantAjoute = () => {
        fetchData(); // Utiliser fetchData au lieu de refreshData
        setAjouterMode(false);
    };

    const handleRetour = () => {
        setAjouterMode(false);
    };

    const toggleEtat = async (id, currentEtat) => {
        try {
            const response = await axios.put(`https://localhost/api/enseignants-permanents/${id}/etat`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'état', error);
            throw error;
        }
    };

    const handleEtatClick = async (id, currentEtat) => {
        const action = currentEtat ? 'désactiver' : 'activer';
        const message = `Voulez-vous vraiment ${action} cet enseignant ?`;

        confirmAlert({
            title: 'Confirmation',
            message: message,
            buttons: [
                {
                    label: 'Oui',
                    onClick: async () => {
                        try {
                            await toggleEtat(id, currentEtat);
                            // Mise à jour optimisée sans recharger toute la liste
                            fetchData();
                        } catch (error) {
                            console.error("Erreur lors de la modification de l'état", error);
                        }
                    }
                },
                {
                    label: 'Non',
                },
            ],
        });
    };

    if (isLoading) {
        return <div className="text-center py-4">Chargement en cours...</div>;
    }

    return (
        <div className="overflow-x-auto">
            {ajouterMode ? (
                <AjouterEnseignant
                    onEnseignantAjoute={handleEnseignantAjoute}
                    onRetour={handleRetour}
                />
            ) : (
                <>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Choix</th>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Nom</th>
                            <th className="px-4 py-3 text-left">Prénom</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Salaire Brut (DT)</th>
                            <th className="px-4 py-3 text-left">Avance (DT)</th>
                            <th className="px-4 py-3 text-left">Salaire Net (DT)</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                            <th className="px-4 py-3 text-left">État</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {localEnseignants.length > 0 ? (
                            localEnseignants.map((enseignant) => (
                                <tr key={enseignant.id}>
                                    <td className="px-4 py-3">
                                        {enseignant.type?.trim().toLowerCase() === 'virement bancaire' && (
                                            <input
                                                type="checkbox"
                                                checked={!!enseignantsSelectionnes[enseignant.id]}
                                                onChange={() => toggleSelection(enseignant.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{enseignant.id}</td>
                                    <td className="px-4 py-3">{enseignant.nom}</td>
                                    <td className="px-4 py-3">{enseignant.prenom}</td>
                                    <td className="px-4 py-3">{enseignant.email}</td>
                                    <td className="px-4 py-3">{enseignant.salaireBrut?.toFixed(3) ?? '0.000'}</td>
                                    <td className="px-4 py-3">{enseignant.totalAvances?.toFixed(3) ?? '0.000'}</td>
                                    <td className="px-4 py-3">
                                        {(enseignant.salaireBrut - (enseignant.totalAvances ?? 0)).toFixed(3)}
                                    </td>
                                    <td className="px-4 py-3">{enseignant.type || '-'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handlePaiement(enseignant)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <CreditCard className="mr-1" size={16} />
                                            Paiement
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleEtatClick(enseignant.id, enseignant.etat)}
                                            className={`w-6 h-6 rounded-full ${enseignant.etat ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
                                            title={enseignant.etat ? 'Actif - Cliquez pour désactiver' : 'Désactivé - Cliquez pour activer'}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                                    Aucun enseignant actif trouvé
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <button
                            onClick={handleAddEnseignant}
                            className="flex items-center bg-white text-blue-500 border border-blue-500 px-4 py-2 rounded hover:bg-blue-50 font-semibold h-[42px]"
                        >
                            <Plus className="mr-2" size={18} />
                            Ajouter un enseignant
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="dateVirement" className="text-sm font-medium text-gray-700 mb-1">
                                    Date du virement
                                </label>
                                <input
                                    id="dateVirement"
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                />
                            </div>

                            <button
                                onClick={handleOrdreDeVirement}
                                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors h-[42px] self-end
                                    ${isGenerating || Object.values(enseignantsSelectionnes).filter(Boolean).length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isGenerating || Object.values(enseignantsSelectionnes).filter(Boolean).length === 0}
                            >
                                {isGenerating ? "Génération en cours..." : "Générer Ordre de Virement"}
                            </button>
                        </div>
                    </div>

                    {enseignantsDesactives.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Enseignants désactivés</h3>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Nom</th>
                                    <th className="px-4 py-3 text-left">Prénom</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Salaire Brut (DT)</th>
                                    <th className="px-4 py-3 text-left">Avance (DT)</th>
                                    <th className="px-4 py-3 text-left">Salaire Net (DT)</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">État</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {enseignantsDesactives.map((enseignant) => (
                                    <tr key={`desactive-${enseignant.id}`}>
                                        <td className="px-4 py-3">{enseignant.id}</td>
                                        <td className="px-4 py-3">{enseignant.nom}</td>
                                        <td className="px-4 py-3">{enseignant.prenom}</td>
                                        <td className="px-4 py-3">{enseignant.email}</td>
                                        <td className="px-4 py-3">{enseignant.salaireBrut?.toFixed(3) ?? '0.000'}</td>
                                        <td className="px-4 py-3">{enseignant.totalAvances?.toFixed(3) ?? '0.000'}</td>
                                        <td className="px-4 py-3">
                                            {(enseignant.salaireBrut - (enseignant.totalAvances ?? 0)).toFixed(3)}
                                        </td>
                                        <td className="px-4 py-3">{enseignant.type || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleEtatClick(enseignant.id, enseignant.etat)}
                                                className={`w-6 h-6 rounded-full ${enseignant.etat ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} transition-colors`}
                                                title={enseignant.etat ? 'Actif - Cliquez pour désactiver' : 'Désactivé - Cliquez pour activer'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EnseignantPermanentList;