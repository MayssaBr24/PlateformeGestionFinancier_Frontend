import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { List } from 'lucide-react'; // Icônes
import logoEssat from "../assets/LOGO ESSAT.png";
import {
    DollarSign,
    Home,

    LogOut,
    BookOpen,

    Users,
    ArrowDownLeft,
    ArrowUpRight,

} from 'lucide-react';

const Sidebar = ({ setActiveView, activeView }) => {
    const navigate = useNavigate(); // <-- ici maintenant, dans le composant Sidebar

    const handleLogout = async () => {
        try {
            await axios.post('https://localhost/api/auth/logout', {}, { withCredentials: true });
            navigate("/login"); // ← vers la page login de ton frontend
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };


    return (
        <div className="w-64 h-screen bg-white shadow-lg p-4 fixed left-0 top-0">
            {/* Logo ESSAT */}
            <div className="flex items-center justify-center mb-8 pt-4">
                <div className="flex flex-col items-center">
                    <div className="mb-2">
                        <img
                            src={logoEssat}
                            alt="Logo ESSAT"
                            className="h-25 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>

            <nav>
                <ul className="space-y-1">

                    <SidebarItem
                        icon={
                            <div className="relative">
                                <DollarSign className="text-blue-500" size={24} />
                                <ArrowDownLeft size={14} className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full p-0.5" />
                            </div>
                        }
                        label="Paiement étudiants"
                        onClick={() => setActiveView('liste')}
                        isActive={activeView === 'liste' || activeView === 'paiementEtudiant'}
                    />

                    <SidebarItem
                        icon={
                            <div className="relative">
                                <BookOpen className="text-blue-500" size={24} />
                                <ArrowUpRight size={14} className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full p-0.5" />
                            </div>
                        }
                        label="Paiement enseignants permanents"
                        onClick={() => setActiveView('enseignantsPermanents')}
                        isActive={activeView === 'enseignantsPermanents'}
                    />

                    <SidebarItem
                        icon={
                            <div className="relative">
                                <BookOpen className="text-blue-500" size={24} />
                                <ArrowUpRight size={14} className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full p-0.5" />
                            </div>
                        }
                        label="Paiement des enseignants vacataires"
                        onClick={() => setActiveView('enseignantsVacataires')}
                        isActive={activeView === 'enseignantsVacataires'}
                    />

                    <SidebarItem
                        icon={
                            <div className="relative">
                                <Users className="text-blue-500" size={24} />
                                <ArrowUpRight size={14} className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full p-0.5" />
                            </div>
                        }
                        label="Paiement cadre administratif"
                        onClick={() => setActiveView('cadresAdministratifs')}
                        isActive={activeView === 'cadresAdministratifs'}
                    />

                    <SidebarItem
                        icon={
                            <div className="relative">
                                <Home className="text-blue-500" size={24} />
                                <ArrowDownLeft size={14} className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full p-0.5" />
                            </div>
                        }
                        label="Service divers"
                        onClick={() => setActiveView('ServicesDivers')}
                        isActive={activeView === 'ServicesDivers'}
                    />

                    <SidebarItem
                        icon={
                            <div className="relative">
                                <List className="text-blue-500" size={24} />
                            </div>
                        }
                        label="Historique paiement étudiant"
                        onClick={() => setActiveView('historiqueEtudiant')}
                        isActive={activeView === 'historiqueEtudiant'}
                    />

                </ul>
            </nav>

            {/* Bouton de déconnexion */}
            <div className="absolute bottom-8 left-0 right-0 px-4">
                <SidebarItem
                    icon={<LogOut className="text-blue-500" size={24} />}
                    label="Se déconnecter"
                    onClick={handleLogout}
                />
            </div>

        </div>
    );
};


const SidebarItem = ({ icon, label, onClick, isActive }) => {
    return (
        <li>
            <button
                onClick={onClick}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
            >
                <span className="flex-shrink-0">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
            </button>
        </li>
    );
};

export default Sidebar;
