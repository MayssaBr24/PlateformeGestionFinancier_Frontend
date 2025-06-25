import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgetPassword";
import Dashboard from "./components/dashboard";
import HistoriquePaiements from './components/HistoriquePaiements';
import PaiementEtudiant from "./components/PaiementEtudiants";
import PaiementEnseignant from "./components/PaiementEnseignant";
import { ToastContainer, toast } from 'react-toastify';
import { useIdleTimer } from 'react-idle-timer';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
    const navigate = useNavigate();

    const handleOnIdle = () => {
        toast.warn("Déconnexion pour inactivité.");
        localStorage.removeItem("jwt"); // ou sessionStorage si tu utilises ça
        navigate("/login");
    };

    useIdleTimer({
        timeout: 15 * 60 * 1000, // 15 minutes
        onIdle: handleOnIdle,
        debounce: 500
    });

    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/paiement-etudiant" element={<PaiementEtudiant />} />
                <Route path="/paiement-enseignant" element={<PaiementEnseignant />} />
                <Route path="/paiements/:etudiantId" element={<HistoriquePaiements />} />
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
