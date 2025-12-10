import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';

const LikeButton = ({ courseId, showCount = false, size = "medium" }) => {
  const [isLiked, setIsLiked] = useState(null); // null = état inconnu
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 DEBUG: Log du composant
  console.log(`🔍 LikeButton render - courseId: ${courseId}, isLiked: ${isLiked}`);

  // Charger l'état du like AU DÉMARRAGE
  useEffect(() => {
    const loadLikeStatus = async () => {
      console.log(`🔄 Chargement état like pour cours ${courseId}...`);
      
      try {
        setInitialLoading(true);
        
        // 1. Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem('token');
        console.log('🔑 Token présent?', !!token);
        
        if (!token) {
          console.log('⚠️ Pas de token, like désactivé');
          setIsLiked(false);
          setInitialLoading(false);
          return;
        }

        // 2. Faire la requête avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await axios.get(
          `${API_URL}/likes/courses/${courseId}/like`,
          { 
            headers: getAuthHeaders(),
            signal: controller.signal 
          }
        );
        
        clearTimeout(timeoutId);
        
        console.log(`✅ Réponse API like:`, response.data);
        setIsLiked(response.data.liked);
        
        // 3. Charger le nombre total de likes
        const countResponse = await axios.get(
          `${API_URL}/likes/courses/${courseId}/likes/count`
        );
        setTotalLikes(countResponse.data.total_likes);
        
      } catch (err) {
        console.error(`❌ Erreur chargement like cours ${courseId}:`, {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        
        // Si 401 (non authentifié), considérer comme non liké
        if (err.response?.status === 401) {
          console.log('🔒 Non authentifié, like désactivé');
          setIsLiked(false);
        } else {
          // Autre erreur, garder null (afficher état neutre)
          setIsLiked(false);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadLikeStatus();
  }, [courseId]); // Recharge quand courseId change

  // Gérer le clic sur le bouton
  const handleToggleLike = async () => {
    console.log(`🖱️ Toggle like pour cours ${courseId}, actuellement: ${isLiked}`);
    
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Connectez-vous pour liker");
        window.location.href = '/loginn';
        return;
      }

      // Faire la requête POST
      const response = await axios.post(
        `${API_URL}/likes/courses/${courseId}/like`,
        {},
        { 
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );

      console.log(`✅ Toggle réussi:`, response.data);
      
      // Mettre à jour l'état IMMÉDIATEMENT
      setIsLiked(response.data.liked);
      setTotalLikes(response.data.total_likes);

      // Forcer un re-render après 100ms
      setTimeout(() => {
        setIsLiked(response.data.liked);
      }, 100);

    } catch (err) {
      console.error(`❌ Erreur toggle like:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 401) {
        setError("Session expirée");
        localStorage.removeItem('token');
        window.location.href = '/loginn';
      } else {
        setError(err.response?.data?.error || "Erreur réseau");
      }
    } finally {
      setLoading(false);
    }
  };

  // Si encore en chargement initial
  if (initialLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className={`text-gray-300 ${size === 'small' ? 'text-lg' : 'text-2xl'}`}>
          🤍
        </div>
        {showCount && <span className="text-sm text-slate-400">...</span>}
      </div>
    );
  }

  // Si état inconnu (null) ou erreur
  if (isLiked === null) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleLike}
          disabled={true}
          className="text-gray-300 text-2xl opacity-50"
          title="Chargement..."
        >
          🤍
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleLike}
        disabled={loading}
        className={`
          transition-all duration-200 
          hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${size === 'small' ? 'text-lg' : 'text-2xl'}
        `}
        title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isLiked ? (
          <span className="text-orange-500 hover:text-orange-600">❤️</span>
        ) : (
          <span className="text-gray-400 hover:text-orange-400">🤍</span>
        )}
      </button>

      {showCount && totalLikes > 0 && (
        <span className="text-sm text-slate-600 font-medium">
          {totalLikes}
        </span>
      )}

      {error && (
        <div className="text-xs text-red-500 max-w-[120px]">
          {error}
        </div>
      )}
    </div>
  );
};

export default LikeButton;