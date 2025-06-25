import React, { useEffect, useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import AjouterCadre from './AjouterCadre'; // <-- Ajouté
import axios from "axios";

const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

const CadreAdministratifList = ({ cadres = [], onPaiementClick, onDataUpdate, onAddCadreClick }) => {
    const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));
    const [cadresSelectionnes, setCadresSelectionnes] = useState({});
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [localCadres, setLocalCadres] = useState(cadres);
    const [ajouterMode, setAjouterMode] = useState(false); // <-- Ajouté

    useEffect(() => {
        setLocalCadres(cadres);
    }, [cadres]);

    useEffect(() => {
        const initialSelection = {};
        localCadres.forEach(c => {
            initialSelection[c.id] = c.type?.trim().toLowerCase() === 'virement bancaire';
        });
        setCadresSelectionnes(initialSelection);
    }, [localCadres]);

    const handleOrdreDeVirement = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setError(null);

        try {
            const idsSelectionnes = Object.keys(cadresSelectionnes)
                .filter(id => cadresSelectionnes[id])
                .map(id => parseInt(id));

            if (idsSelectionnes.length === 0) {
                setError("Veuillez sélectionner au moins un cadre administratif");
                return;
            }

            const response = await axios.post(
                'https://localhost/api/cadres-administratifs/virement-multiple',
                { date: selectedDate, enseignantIds: idsSelectionnes },
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ordre-de-virement-cadres-${selectedDate}.pdf`);
            document.body.appendChild(link);
            link.click();

            await refreshData();

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

    const refreshData = async () => {
        try {
            const response = await axios.get('https://localhost/api/cadres-administratifs');
            setLocalCadres(response.data);
            onDataUpdate?.(response.data);
        } catch (error) {
            console.error("Erreur lors du rafraîchissement des données", error);
        }
    };

    const handlePaiement = async (cadre) => {
        try {
            await onPaiementClick(cadre);
            await refreshData();
        } catch (error) {
            console.error("Erreur lors du paiement", error);
        }
    };

    const toggleSelection = (id) => {
        setCadresSelectionnes(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setError(null);
    };

    const handleAddCadre = () => {
        setAjouterMode(true); // <-- Ajouté
    };

    const handleCadreAjoute = (nouveauCadre) => {
        setLocalCadres(prev => [...prev, nouveauCadre]);
        setAjouterMode(false);
    };

    const handleRetour = () => {
        setAjouterMode(false);
    };

    return (
        <div className="overflow-x-auto">
            {ajouterMode ? (
                <AjouterCadre
                    onCadreAjoute={handleCadreAjoute}
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
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {localCadres.length > 0 ? (
                            localCadres.map((cadre) => (
                                <tr key={cadre.id}>
                                    <td className="px-4 py-3">
                                        {cadre.type?.trim().toLowerCase() === 'virement bancaire' && (
                                            <input
                                                type="checkbox"
                                                checked={!!cadresSelectionnes[cadre.id]}
                                                onChange={() => toggleSelection(cadre.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{cadre.id}</td>
                                    <td className="px-4 py-3">{cadre.nom}</td>
                                    <td className="px-4 py-3">{cadre.prenom}</td>
                                    <td className="px-4 py-3">{cadre.email}</td>
                                    <td className="px-4 py-3">{cadre.salaireBrut?.toFixed(3) ?? '0.000'}</td>
                                    <td className="px-4 py-3">{cadre.totalAvances?.toFixed(3) ?? '0.000'}</td>
                                    <td className="px-4 py-3">
                                        {(cadre.salaireBrut - (cadre.totalAvances ?? 0)).toFixed(3)}
                                    </td>
                                    <td className="px-4 py-3">{cadre.type || '-'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handlePaiement(cadre)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <CreditCard className="mr-1" size={16} />
                                            Paiement
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                                    Aucun cadre administratif trouvé
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* Le bas : Date + Boutons */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Partie gauche - Bouton Ajouter */}
                        <button
                            onClick={handleAddCadre}
                            className="flex items-center bg-white text-blue-500 border border-blue-500 px-4 py-2 rounded hover:bg-blue-50 font-semibold h-[42px]"
                        >
                            <Plus className="mr-2" size={18} />
                            Ajouter un cadre
                        </button>

                        {/* Partie droite - Calendrier + Bouton Générer */}
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
        ${isGenerating || Object.values(cadresSelectionnes).filter(Boolean).length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isGenerating || Object.values(cadresSelectionnes).filter(Boolean).length === 0}
                            >
                                {isGenerating ? "Génération en cours..." : "Générer Ordre de Virement"}
                            </button>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default CadreAdministratifList;
