import React, { useState, useEffect } from 'react';
import { Printer, Plus, ArrowLeft, ChevronDown, ChevronUp, Search } from 'lucide-react';
import axios from 'axios';

const HistoriquePaiements = ({ etudiantId, onRetour }) => {
    const [paiements, setPaiements] = useState([]);
    const [etudiant, setEtudiant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messageSucces, setMessageSucces] = useState('');
    const [error, setError] = useState(null);
    const [totalPaye, setTotalPaye] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const formatDateForInput = (date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };
    const [showRemboursementSection, setShowRemboursementSection] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const [remboursement, setRemboursement] = useState({
        montant: '',
        date: formatDateForInput(new Date())
    });


    const [nouveauPaiement, setNouveauPaiement] = useState({
        montant: '',
        date: formatDateForInput(new Date())
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [etudiantRes, paiementsRes, totalRes] = await Promise.all([
                    axios.get(`https://localhost/api/Etudiant/Etudiant/${etudiantId}`),
                    axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}`),
                    axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}/total`)
                ]);

                setEtudiant(etudiantRes.data);
                setPaiements(paiementsRes.data || []);
                setTotalPaye(totalRes.data || 0);

            } catch (error) {
                setError(error.response?.data?.message || "Erreur de chargement des données");
                console.log("Fetching Data... problem");

            } finally {
                setIsLoading(false);
            }
        };

        if (etudiantId) fetchData();
    }, [etudiantId]);
    const handleAddPaiement = async () => {
        if (!etudiantId) {
            setError("ID étudiant manquant");
            return;
        }

        const montant = parseFloat(nouveauPaiement.montant);
        if (isNaN(montant) || montant <= 0) {
            setError("Montant invalide (doit être > 0)");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post('https://localhost/api/paiements', {
                montant,
                date: nouveauPaiement.date,
                etudiantId: Number(etudiantId)
            });

            // Affichez les données de débogage
            console.log("Réponse du serveur:", response.data);

            // Forcez le rechargement complet des données
            const [updatedEtudiant, updatedPaiements, updatedTotal] = await Promise.all([
                axios.get(`https://localhost/api/Etudiant/Etudiant/${etudiantId}`),
                axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}`),
                axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}/total`)
            ]);

            setEtudiant(updatedEtudiant.data);
            setPaiements(updatedPaiements.data || []);
            setTotalPaye(updatedTotal.data || 0);

            setMessageSucces(`Paiement enregistré. État financier: ${updatedEtudiant.data.etatFinancier?.toFixed(2)}%`);

        } catch (error) {
            console.error("Erreur détaillée:", error.response?.data);
            setError("Erreur lors du paiement");
        } finally {
            setIsLoading(false);
        }

    };
    const handlePrintRecu = (paiementId) => {
        window.open(`https://localhost/api/paiements/${paiementId}/recus`, '_blank');
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // Tri des paiements
    const sortedPaiements = [...paiements].sort((a, b) => {
        if (!sortConfig.key) return 0;

        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Gestion du tri
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Style pour les en-têtes de tri
    const getHeaderClass = (key) => {
        if (sortConfig.key !== key) return 'cursor-pointer hover:bg-gray-100';
        return sortConfig.direction === 'asc'
            ? 'bg-gray-100 cursor-pointer'
            : 'bg-gray-100 cursor-pointer';
    };

    // Filtrage des paiements
    const filteredPaiements = sortedPaiements.filter(paiement => {
        const searchLower = searchTerm.toLowerCase();
        return (
            formatDisplayDate(paiement.date).includes(searchLower) ||
            String(paiement.montant).includes(searchLower)
        );
    });

    const handlePrintRecuRemboursement = async () => {
        if (!etudiant || !remboursement.montant) {
            setError("Veuillez saisir un montant");
            return;
        }

        const montant = parseFloat(nouveauPaiement.montant);
        if (isNaN(montant) || montant <= 0) {
            setError("Montant invalide (doit être > 0)");
            return;
        }

        try {
            setIsLoading(true);

            // 1. Enregistrer le remboursement
            await axios.post('https://localhost/api/paiements/remboursement', {
                montant: -montant,
                date: nouveauPaiement.date,
                etudiantId: Number(etudiantId),
                resetEtatFinancier: true
            });

            // 2. Mettre à jour les données
            const [updatedEtudiant, updatedPaiements, updatedTotal] = await Promise.all([
                axios.get(`https://localhost/api/Etudiant/Etudiant/${etudiantId}`),
                axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}`),
                axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}/total`)
            ]);

            setEtudiant(updatedEtudiant.data);
            setPaiements(updatedPaiements.data || []);
            setTotalPaye(updatedTotal.data || 0);
            setNouveauPaiement({ ...nouveauPaiement, montant: '' });

            // 3. Générer le reçu
            const url = `https://localhost/api/paiements/remboursements/${etudiant.id}/recu?montant=${montant}`;
            const newWindow = window.open(url, '_blank');

            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                setMessageSucces("Remboursement enregistré - Activez les popups pour le reçu");
            } else {
                setMessageSucces("Remboursement enregistré et reçu généré");
            }

        } catch (error) {
            console.error("Erreur:", error.response?.data);
            setError(error.response?.data?.message || "Erreur lors du remboursement");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemboursementClick = () => {
        if (!remboursement.montant) {
            setError("Veuillez saisir un montant");
            return;
        }
        setShowConfirmationModal(true);
    };

    const confirmRemboursement = async () => {
        setShowConfirmationModal(false);

        const montant = parseFloat(remboursement.montant);        if (isNaN(montant) || montant <= 0) {
            setError("Montant invalide (doit être > 0)");
            return;
        }

        try {
            setIsLoading(true);

            // 1. Enregistrer le remboursement
            await axios.post('https://localhost/api/paiements/remboursement', {
                montant: -montant,
                date: nouveauPaiement.date,
                etudiantId: Number(etudiantId),
                resetEtatFinancier: true
            });

            // 2. Mettre à jour les données
            const [updatedEtudiant, updatedPaiements, updatedTotal] = await Promise.all([
                axios.get(`https://localhost/api/Etudiant/Etudiant/${etudiantId}`),
                axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}`),
                axios.get(`https://localhost/api/paiements/Etudiant/${etudiantId}/total`)
            ]);

            setEtudiant(updatedEtudiant.data);
            setPaiements(updatedPaiements.data || []);
            setTotalPaye(updatedTotal.data || 0);
            setNouveauPaiement({ ...nouveauPaiement, montant: '' });
            setShowRemboursementSection(false);

            // 3. Afficher notification de succès
            setMessageSucces(`Remboursement de ${montant} DT effectué pour ${updatedEtudiant.data.prenom} ${updatedEtudiant.data.nom}`);

            // 4. Générer le reçu (optionnel)
            const url = `https://localhost/api/paiements/remboursements/${etudiantId}/recu?montant=${montant}`;
            window.open(url, '_blank');

        } catch (error) {
            console.error("Erreur:", error.response?.data);
            setError(error.response?.data?.message || "Erreur lors du remboursement");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Espacement réduit pour l'image d'en-tête */}
            <div className="h-14"></div>

            {/* Contenu principal avec ajustement précis */}
            <div className="pl-1 pr-1 pb-1 -mt-1">
                {/* Bouton Retour avec espacement optimal */}
                <div className="mb-1">
                    <button
                        onClick={onRetour}
                        className="mb-3 flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Retour à la liste
                    </button>
                </div>
            </div>
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

            {etudiant && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {etudiant.prenom} {etudiant.nom}
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                <p className="text-sm text-gray-600">Classe</p>
                                <p className="font-medium">{etudiant.classe}</p>
                            </div>
                            <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                <p className="text-sm text-gray-600">N° Inscription</p>
                                <p className="font-medium">{etudiant.numInscription}</p>
                            </div>
                            <div className="bg-green-50 px-4 py-2 rounded-lg">
                                <p className="text-sm text-gray-600">Total payé</p>
                                <p className="font-medium text-green-600">{totalPaye.toFixed(2)} DT</p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg ${
                                etudiant.etatFinancier >= 100 ? 'bg-green-50' :
                                    etudiant.etatFinancier >= 50 ? 'bg-yellow-50' : 'bg-red-50'
                            }`}>
                                <p className="text-sm text-gray-600">État financier</p>
                                <p className={`font-medium ${
                                    etudiant.etatFinancier >= 100 ? 'text-green-600' :
                                        etudiant.etatFinancier >= 50 ? 'text-blue-500' : 'text-red-600'
                                }`}>
                                    {etudiant.etatFinancier?.toFixed(2) ?? '0.00'}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tableau des paiements avec scroll */}
            <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Historique des paiements</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un paiement..."
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[calc(100vh-400px)]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                onClick={() => requestSort('date')}
                            >
                                <div className={`flex items-center ${getHeaderClass('date')} p-2 rounded`}>
                                    Date
                                    {sortConfig.key === 'date' && (
                                        sortConfig.direction === 'asc' ?
                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                onClick={() => requestSort('montant')}
                            >
                                <div className={`flex items-center ${getHeaderClass('montant')} p-2 rounded`}>
                                    Montant
                                    {sortConfig.key === 'montant' && (
                                        sortConfig.direction === 'asc' ?
                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPaiements.length > 0 ? (
                            filteredPaiements.map((paiement) => (
                                <tr key={paiement.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-900">{formatDisplayDate(paiement.date)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-900 font-medium">{paiement.montant} DT</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handlePrintRecu(paiement.id)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1 rounded-lg text-sm"
                                        >
                                            <Printer className="mr-2" size={16} />
                                            Reçu
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                    {searchTerm ? "Aucun paiement correspondant" : "Aucun paiement enregistré"}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Formulaire d'ajout de paiement */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouveau paiement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Montant ()
                        </label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={nouveauPaiement.montant}
                            onChange={(e) => setNouveauPaiement({
                                ...nouveauPaiement,
                                montant: e.target.value
                            })}
                            min="0"
                            step="100"
                            placeholder="50000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={nouveauPaiement.date}
                            onChange={(e) => {
                                const selectedDate = e.target.value;
                                const today = formatDateForInput(new Date());

                                if (selectedDate > today) {
                                    setError("La date ne peut pas être dans le futur");
                                    return;
                                }

                                setNouveauPaiement({
                                    ...nouveauPaiement,
                                    date: selectedDate
                                });
                                setError(null);
                            }}
                            max={formatDateForInput(new Date())}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleAddPaiement}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center justify-center transition-colors disabled:bg-blue-300"
                        >
                            <Plus className="mr-2" size={18} />
                            {isLoading ? 'Enregistrement...' : 'Ajouter Paiement'}
                        </button>
                    </div>
                </div>
            </div>
            {/* Nouvelle section remboursement en bas de page */}
            <div className="w-fit mx-auto mt-4 bg-transparent">
                <button
                    onClick={() => setShowRemboursementSection(!showRemboursementSection)}
                    className="w-fit text-sm p-2 text-red-700 font-medium flex items-center justify-center gap-1"
                >
                    {showRemboursementSection ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronUp className="w-4 h-4" />
                    )}
                    <span>Remboursement</span>
                </button>








                {showRemboursementSection && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">
                                Montant à rembourser (DT)
                            </label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white"
                                value={remboursement.montant}
                                onChange={(e) => setRemboursement({
                                    ...remboursement,
                                    montant: e.target.value
                                })}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white"
                                value={remboursement.date}
                                onChange={(e) => setRemboursement({
                                    ...remboursement,
                                    date: e.target.value
                                })}
                                max={formatDateForInput(new Date())}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleRemboursementClick}
                                disabled={isLoading || !remboursement.montant}  // Changé de nouveauPaiement à remboursement
                                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center justify-center transition-colors disabled:bg-red-300"
                            >
                                <Printer className="mr-2" size={18} />
                                {isLoading ? 'Traitement...' : 'Effectuer Remboursement'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmation */}
            {showConfirmationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmer le remboursement</h3>
                        <p className="mb-4">
                            Êtes-vous sûr de vouloir émettre un remboursement de {nouveauPaiement.montant} DT à {etudiant?.prenom} {etudiant?.nom} ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmationModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmRemboursement}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoriquePaiements;

