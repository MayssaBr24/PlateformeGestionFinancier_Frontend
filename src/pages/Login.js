import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import financeimage from "../assets/financeimage.jpg";
import logo from "../assets/LOGO ESSAT.png";
import authService from '../services/auth.service.js';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await authService.login(email, password);

            if (response.token) {
                navigate('/dashboard');
            } else {
                setError(response.message || 'Échec de la connexion');
            }
        } catch (err) {
            setError(err.message || 'Échec de la connexion');
            console.error('Erreur de connexion:', err);
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${financeimage})` }}>
            <div className="login-container">
                <div className="logo-container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={logo} alt="ESSAT Logo" className="logo-image" />
                </div>

                <h1 style={{ fontWeight: 'bold', fontSize: '23px', fontFamily: 'Arial, sans-serif' }}>Connexion</h1>

                {/* Affichage des erreurs */}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-options">
                        <a href="/forgot-password" className="forgot-password">Mot de passe oublié ?</a>
                    </div>

                    <button type="submit" className="login-button">Se connecter</button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;