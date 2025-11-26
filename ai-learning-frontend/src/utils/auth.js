import { API_URL } from '../config/api';

// Récupérer le token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Créer les headers avec token
export const getAuthHeaders = () => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// Récupérer l'utilisateur
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};
