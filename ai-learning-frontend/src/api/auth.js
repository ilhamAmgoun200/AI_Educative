import httpClient from "./httpClient";
import axios from "axios";
import { CONFIG } from "../config";
import { saveUser, clearAuthData} from "../utils/localStorage";

/**
 * 🔐 Connexion utilisateur
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{jwt: string, user: object}>}
 */
export const login = async (email, password) => {
  try {
    // Utiliser axios directement pour éviter que httpClient ajoute le token
    // La route /auth/local doit être accessible sans authentification
    const { data } = await axios.post(
      `${CONFIG.API_URL}/auth/local`,
      {
        identifier: email.trim().toLowerCase(),
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    // Ne pas sauvegarder ici, laisser loginUser dans le contexte le faire
    // Cela évite la double sauvegarde et assure la cohérence
    
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error.response?.data || error.message);
    
    // Gestion spécifique des erreurs 403
    if (error.response?.status === 403) {
      const errorMessage = 
        error.response?.data?.error?.message || 
        "Accès refusé. Vérifiez vos permissions dans Strapi pour la route /auth/local";
      
      throw new Error(errorMessage);
    }
    
    // Gestion des autres erreurs
    if (error.response?.data?.error) {
      const errorMessage = error.response.data.error.message || "Erreur lors de la connexion";
      throw new Error(errorMessage);
    }
    
    throw error;
  }
};

/**
 * 👤 Récupérer les informations de l'utilisateur connecté
 * @returns {Promise<object>}
 */
export const getMe = async () => {
  try {
    const { data } = await httpClient.get("/users/me?populate=role");
    saveUser(data);
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du profil :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📝 Inscription utilisateur avec attribution du rôle
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} roleName - Nom du rôle (student ou teacher)
 * @returns {Promise<{jwt: string, user: object}>}
 */
export const register = async (username, email, password, roleName) => {
  try {
    // Validation des paramètres
    if (!username || !email || !password) {
      throw new Error("Tous les champs sont requis");
    }

    // Étape 1: Créer l'utilisateur (Strapi n'accepte pas le paramètre role dans /auth/local/register)
    let registerRes;
    try {
      const response = await httpClient.post("/auth/local/register", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      registerRes = response.data;
    } catch (registerError) {
      // Gérer les erreurs de validation Strapi
      const errorData = registerError.response?.data;
      if (errorData?.error) {
        const errorMessage = errorData.error.message || "Erreur lors de l'inscription";
        
        // Extraire les détails d'erreur si disponibles
        if (errorData.error.details?.errors) {
          const errors = errorData.error.details.errors;
          const firstError = Object.values(errors)[0];
          if (firstError && firstError[0]) {
            throw new Error(firstError[0].message || errorMessage);
          }
        }
        
        throw new Error(errorMessage);
      }
      throw registerError;
    }

    if (!registerRes || !registerRes.jwt || !registerRes.user) {
      throw new Error("Réponse invalide du serveur lors de l'inscription");
    }

    const token = registerRes.jwt;
    const userId = registerRes.user.id;

    // Étape 2: Récupérer tous les rôles disponibles (sans token car route publique)
    let rolesRes;
    try {
      const response = await httpClient.get("/users-permissions/roles");
      rolesRes = response.data;
    } catch (rolesError) {
      console.warn("⚠️ Impossible de récupérer les rôles:", rolesError);
      // Si on ne peut pas récupérer les rôles, retourner les données de base
      return {
        jwt: token,
        user: registerRes.user,
      };
    }
    
    // Étape 3: Trouver le rôle sélectionné
    const selectedRole = rolesRes?.roles?.find(
      (r) => r.name.toLowerCase() === roleName.toLowerCase()
    );

    if (!selectedRole) {
      console.warn(`⚠️ Rôle "${roleName}" introuvable, utilisation du rôle par défaut`);
      // Retourner les données de base si le rôle n'est pas trouvé
      return {
        jwt: token,
        user: registerRes.user,
      };
    }

    // Étape 4: Mettre à jour le rôle de l'utilisateur avec le token JWT obtenu
    // On utilise axios directement car httpClient utilise le token du localStorage qui n'existe pas encore
    try {
      await axios.put(
        `${CONFIG.API_URL}/users/${userId}`,
        {
          role: selectedRole.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Étape 5: Récupérer les données utilisateur mises à jour avec le rôle
      const { data: updatedUser } = await axios.get(
        `${CONFIG.API_URL}/users/${userId}?populate=role`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Retourner les données avec le rôle mis à jour
      return {
        jwt: token,
        user: updatedUser,
      };
    } catch (updateError) {
      // Si la mise à jour du rôle échoue, retourner quand même les données de base
      console.warn(
        "⚠️ Impossible de mettre à jour le rôle, l'utilisateur a été créé avec le rôle par défaut:",
        updateError.response?.data || updateError.message
      );
      
      // Retourner les données de base même si la mise à jour du rôle échoue
      return {
        jwt: token,
        user: registerRes.user,
      };
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🚪 Déconnexion utilisateur
 */
export const logout = () => {
  clearAuthData();
};
