import axios from "axios";

const API_URL = "https://localhost/api/auth";

class AuthService {
    // Méthode pour la connexion (avec gestion améliorée des erreurs et messages)
    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: email,
                password: password
            });

            if (response.data.token) {
                // Stockage sécurisé des données d'authentification
                localStorage.setItem("auth_token", response.data.token);
                localStorage.setItem("user_data", JSON.stringify(response.data.user));

                // Optionnel : Stockage du timestamp d'expiration si disponible
                if (response.data.expiresIn) {
                    const expiresAt = new Date().getTime() + response.data.expiresIn * 1000;
                    localStorage.setItem("token_expires_at", expiresAt.toString());
                }

                console.log("Connexion réussie. Token stocké.");
                return response.data;
            } else {
                throw new Error("Aucun token reçu du serveur");
            }
        } catch (error) {
            console.error("Erreur de connexion:", error.response?.data?.message || error.message);
            throw error;
        }
    }

    // Méthode pour la déconnexion (nettoyage complet)
    logout() {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("token_expires_at");
        console.log("Déconnexion réussie. Storage nettoyé.");
    }

    // Méthode pour vérifier si l'utilisateur est connecté ET valide
    isAuthenticated() {
        const token = localStorage.getItem("auth_token");
        const expiresAt = localStorage.getItem("token_expires_at");

        // Vérifie la présence du token et sa validité temporelle
        if (!token) return false;
        if (expiresAt && new Date().getTime() > parseInt(expiresAt)) {
            this.logout(); // Token expiré => auto-déconnexion
            return false;
        }
        return true;
    }

    // Méthode pour récupérer l'utilisateur courant (sécurisée)
    getCurrentUser() {
        if (!this.isAuthenticated()) return null;

        try {
            return JSON.parse(localStorage.getItem("user_data"));
        } catch (error) {
            console.error("Erreur de parsing des données utilisateur:", error);
            return null;
        }
    }

    // Méthode pour réinitialisation du mot de passe (améliorée)
    async forgotPassword(email) {
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            return response.data; // { message: "Email sent successfully" }
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error("Aucun compte trouvé avec cet email");
            }
            throw new Error(error.response?.data?.message || "Erreur lors de l'envoi de l'email");
        }
    }

    // Méthode pour récupérer les infos utilisateur (avec cache optionnel)
    async getUserInfo(userId, forceRefresh = false) {
        const cacheKey = `user_${userId}_data`;

        if (!forceRefresh && localStorage.getItem(cacheKey)) {
            return JSON.parse(localStorage.getItem(cacheKey));
        }

        try {
            const response = await axios.get(`${API_URL}/users/${userId}`, {
                headers: this.getAuthHeader()
            });

            localStorage.setItem(cacheKey, JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error("Erreur de récupération:", error.response?.data?.message || error.message);
            throw error;
        }
    }

    // Helper pour les headers d'authentification
    getAuthHeader() {
        return {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`
        };
    }
}

// Singleton pattern
export default new AuthService();