import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StudentList from './StudentList';
import HistoriquePaiements from './HistoriquePaiements';
import PaiementEnseignant from './PaiementEnseignant';
import PaiementCadreAdministratif from './PaiementCadreAdministratif';
import EnseignantPermanentList from "./EnseignantPermanentList";
import CadreAdministratifList from "./CadreAdministratifList";
import EnseignantVacataireList from "./EnseignantVacataireList";
import PaiementEnseignantVacataire from "./PaiementEnseignantVacataire";
import HistoriqueEtudiant from './HistoriqueEtudiant';
import AjouterCadre from './AjouterCadre';
import Searchbar from './Searchbar';
import backgroundImage from '../assets/fac.jpg';
import axios from 'axios';
import ServicesDivers from './ServicesDivers';

const Dashboard = () => {
    // États pour les données
    const [etudiants, setEtudiants] = useState([]);
    const [enseignants, setEnseignants] = useState([]);
    const [cadres, setCadres] = useState([]);
    const [vacataires, setVacataires] = useState([]);

    // États pour les données filtrées
    const [filteredEtudiants, setFilteredEtudiants] = useState([]);
    const [filteredEnseignants, setFilteredEnseignants] = useState([]);
    const [filteredCadres, setFilteredCadres] = useState([]);
    const [filteredVacataires, setFilteredVacataires] = useState([]);

    // États pour l'UI
    const [searchTerm, setSearchTerm] = useState('');
    const [currentYear] = useState('2024-2025');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('liste');
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
    const [enseignantSelectionne, setEnseignantSelectionne] = useState(null);
    const [cadreSelectionne, setCadreSelectionne] = useState(null);
    const [vacataireSelectionne, setVacataireSelectionne] = useState(null);
    const [etudiantSelectionne, setEtudiantSelectionne] = useState(null);
    const [previousView, setPreviousView] = useState(null);

    // Réinitialiser la recherche quand la vue change
    useEffect(() => {
        if (previousView !== activeView) {
            setSearchTerm('');
        }
        setPreviousView(activeView);
    }, [activeView, previousView]);

    const handleCadreAjoute = async (newCadre) => {
        try {
            setCadres(prev => [...prev, newCadre]);
            setFilteredCadres(prev => [...prev, newCadre]);
            await fetchData();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la liste", error);
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);

            const [etudiantsResponse, enseignantsResponse, cadresResponse, vacatairesResponse, historiqueResponse] =
                await Promise.all([
                    axios.get('https://localhost/api/Etudiant'),
                    axios.get('https://localhost/api/enseignants-permanents'),
                    axios.get('https://localhost/api/cadres-administratifs'),
                    axios.get('https://localhost/api/enseignants-vacataires'),
                    axios.get('https://localhost/api/paiements/etudiants/all'),

                ]);

            setEtudiants(etudiantsResponse.data);
            setFilteredEtudiants(etudiantsResponse.data);

            setEnseignants(enseignantsResponse.data);
            setFilteredEnseignants(enseignantsResponse.data);

            setCadres(cadresResponse.data);
            setFilteredCadres(cadresResponse.data);

            setVacataires(vacatairesResponse.data);
            setFilteredVacataires(vacatairesResponse.data);

            localStorage.setItem('historiquePaiements', JSON.stringify(historiqueResponse.data));

        } catch (err) {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || "Erreur de chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtrage des données amélioré pour inclure Service divers, responsable et montant
    useEffect(() => {
        const filterItems = (items, searchTerm, view) => {
            if (!searchTerm) return items;

            return items.filter(item => {
                // Recherche standard dans toutes les propriétés
                const standardSearch = Object.values(item).some(
                    val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (view === 'servicesDivers') {
                    return standardSearch ||
                        item.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.montant?.toString().includes(searchTerm) ||
                        item.sujet?.toLowerCase().includes(searchTerm.toLowerCase());
                }

                // Recherche spécifique pour les paiements
                if (view === 'historiqueEtudiant' || view === 'historiqueEnseignant') {
                    const historique = JSON.parse(localStorage.getItem('historiquePaiements') || '[]');
                    const paiements = historique.filter(p =>
                        p.etudiantId === item.id || p.enseignantId === item.id
                    );

                    const searchPaiements = paiements.some(p =>
                        p.serviceDivers?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.montant?.toString().includes(searchTerm)
                    );

                    return standardSearch || searchPaiements;
                }

                return standardSearch;
            });
        };

        setFilteredEtudiants(filterItems(etudiants, searchTerm, activeView));
        setFilteredEnseignants(filterItems(enseignants, searchTerm, activeView));
        setFilteredCadres(filterItems(cadres, searchTerm, activeView));
        setFilteredVacataires(filterItems(vacataires, searchTerm, activeView));
    }, [searchTerm, etudiants, enseignants, cadres, vacataires, activeView]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handlePaiementClick = (etudiant) => {
        setSelectedEtudiant(etudiant);
        setActiveView('paiementEtudiant');
    };

    const handleRetourListe = () => {
        setActiveView('liste');
    };

    const getViewTitle = () => {
        switch (activeView) {
            case 'liste': return 'Liste des étudiants';
            case 'paiementEtudiant': return 'Paiements étudiant';
            case 'enseignantsPermanents': return 'Paiements enseignants';
            case 'cadresAdministratifs': return 'Paiements cadres administratifs';
            case 'enseignantsVacataires': return 'Paiements enseignants vacataires';
            case 'ajouterCadre': return 'Ajouter un Cadre';
            case 'historiqueEtudiant': return 'Historique de paiements étudiants';
            case 'historiqueEnseignant': return 'Historique de paiements enseignants';
            case 'ServicesDivers': return 'Services Divers';
            default: return 'Tableau de bord';
        }
    };

    const getSearchPlaceholder = () => {
        switch (activeView) {
            case 'liste': return "Rechercher un étudiant...";
            case 'enseignantsPermanents': return "Rechercher un enseignant...";
            case 'cadresAdministratifs': return "Rechercher un cadre administratif...";
            case 'enseignantsVacataires': return "Rechercher un enseignant vacataire...";
            case 'historiqueEtudiant': return "Rechercher par étudiant, service, responsable ou montant...";
            case 'historiqueEnseignant': return "Rechercher par enseignant, service, responsable ou montant...";
            case 'ServicesDivers': return "Rechercher par responsable, montant ou sujet...";
            default: return "Rechercher...";
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-red-500 text-center">
            <p>Erreur: {error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Réessayer
            </button>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar setActiveView={setActiveView} activeView={activeView} />

            <div className="flex-1 ml-64">
                {/* En-tête avec image de fond */}
                <div className="relative h-96 w-full overflow-hidden">
                    <img src={backgroundImage} alt="En-tête" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-start justify-end pb-8 pl-8">
                        <h1 className="text-3xl font-bold text-white">{getViewTitle()}</h1>
                        <p className="text-white mt-2">{currentYear}</p>
                    </div>
                </div>

                {/* Contenu principal sous l'image */}
                <div className="p-8 -mt-16">
                    <div className="flex justify-end mb-8">
                        <Searchbar
                            onSearch={handleSearch}
                            placeholder={getSearchPlaceholder()}
                            isLoading={isLoading}
                            value={searchTerm}
                            key={activeView}
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            {activeView === 'liste' && (
                                <StudentList
                                    etudiants={filteredEtudiants}
                                    onPaiementClick={handlePaiementClick}
                                />
                            )}

                            {activeView === 'paiementEtudiant' && (
                                <HistoriquePaiements
                                    etudiantId={selectedEtudiant?.id}
                                    onRetour={handleRetourListe}
                                />
                            )}

                            {activeView === 'enseignantsPermanents' && (
                                !enseignantSelectionne ? (
                                    <EnseignantPermanentList
                                        enseignants={filteredEnseignants}
                                        onPaiementClick={(enseignant) => setEnseignantSelectionne(enseignant)}
                                        onDataUpdate={fetchData}
                                    />
                                ) : (
                                    <PaiementEnseignant
                                        enseignant={enseignantSelectionne}
                                        onRetour={() => setEnseignantSelectionne(null)}
                                        onPaiementSuccess={fetchData}
                                    />
                                )
                            )}

                            {activeView === 'cadresAdministratifs' && (
                                !cadreSelectionne ? (
                                    <CadreAdministratifList
                                        cadres={filteredCadres}
                                        onPaiementClick={(cadre) => setCadreSelectionne(cadre)}
                                        onAddCadreClick={() => setActiveView('ajouterCadre')}
                                        onDataUpdate={fetchData}
                                    />
                                ) : (
                                    <PaiementCadreAdministratif
                                        cadre={cadreSelectionne}
                                        onRetour={() => setCadreSelectionne(null)}
                                        onPaiementSuccess={fetchData}
                                    />
                                )
                            )}

                            {activeView === 'ajouterCadre' && (
                                <AjouterCadre
                                    onAjout={handleCadreAjoute}
                                    onRetour={() => setActiveView('cadresAdministratifs')}
                                />
                            )}

                            {activeView === 'enseignantsVacataires' && (
                                !vacataireSelectionne ? (
                                    <EnseignantVacataireList
                                        vacataires={filteredVacataires}
                                        onPaiementClick={(vacataire) => setVacataireSelectionne(vacataire)}
                                        onDataUpdate={fetchData}
                                    />
                                ) : (
                                    <PaiementEnseignantVacataire
                                        vacataire={vacataireSelectionne}
                                        onRetour={() => setVacataireSelectionne(null)}
                                        onPaiementSuccess={fetchData}
                                    />
                                )
                            )}

                            {activeView === 'historiqueEtudiant' && (
                                <HistoriqueEtudiant
                                    etudiants={filteredEtudiants}
                                    onRetour={() => setActiveView('liste')}
                                    searchTerm={searchTerm}
                                />
                            )}

                            {activeView === 'ServicesDivers' && (
                                <ServicesDivers />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;