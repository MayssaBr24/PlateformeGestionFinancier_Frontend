import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import AuthService from "../services/auth.service";
import './ForgotPassword.css';
import financeimage from "../assets/financeimage.jpg";
import logo from "../assets/LOGO ESSAT.png";

const ForgotPassword = () => {
    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm();

    const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' ou 'error'
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            setMessage({ text: "", type: "" });
            const response = await AuthService.forgotPassword(data.email);

            setMessage({
                text: response.message || "Un email a été envoyé pour réinitialiser votre mot de passe.",
                type: "success"
            });
            setIsSuccess(true);

            // Redirection automatique après 5 secondes
            setTimeout(() => {
                navigate("/login");
            }, 5000);

        } catch (error) {
            console.error("Forgot password error:", error);
            const errorMessage = error.response?.data?.message ||
                "Une erreur est survenue lors de l'envoi de l'email. Veuillez réessayer.";

            setMessage({ text: errorMessage, type: "error" });
            setIsSuccess(false);
        }
    };

    return (
        <div className="forgot-password-page" style={{ backgroundImage: `url(${financeimage})` }}>
            <div className="forgot-password-container">
                <div className="logo-container">
                    <img src={logo} alt="ESSAT Logo" className="logo-image" />
                </div>

                <h1>Mot de passe oublié</h1>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="forgot-password-form">
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <Controller
                                name="email"
                                control={control}
                                defaultValue=""
                                rules={{
                                    required: "Ce champ est requis",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Adresse e-mail invalide",
                                    },
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="email"
                                        placeholder="Entrez votre email enregistré"
                                        className={`form-input ${errors.email ? "input-error" : ""}`}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.email && (
                                <p className="error-message">{errors.email.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="spinner">Envoi en cours...</span>
                            ) : (
                                "Envoyer"
                            )}
                        </button>
                    </form>
                ) : null}

                {message.text && (
                    <div className={`message-alert ${message.type === "success" ? "success" : "error"}`}>
                        {message.text}
                        {isSuccess && (
                            <div className="redirect-message">
                                Redirection vers la page de connexion...
                            </div>
                        )}
                    </div>
                )}

                <div className="back-to-login">

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;