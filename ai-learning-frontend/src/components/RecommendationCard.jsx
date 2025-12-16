import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { getAuthHeaders } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaStar, FaFire, FaBookOpen, FaCheckCircle, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const RecommendationsCard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupère l'ID utilisateur de différentes sources
      let userId = null;
      
      // Essayer différentes sources
      if (user?.id) {
        userId = user.id;
      } else if (localStorage.getItem('userId')) {
        userId = localStorage.getItem('userId');
      } else if (sessionStorage.getItem('userId')) {
        userId = sessionStorage.getItem('userId');
      }
      
      // Si toujours null, vérifier le token JWT
      if (!userId) {
        const token = localStorage.getItem('token');
        if (token) {
          // Décoder le token JWT pour obtenir l'ID
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.sub || payload.user_id || payload.id;
          } catch (e) {
            console.log('Impossible de décoder le token');
          }
        }
      }
      
      console.log('🔍 User ID trouvé:', userId);
      console.log('🔍 User object:', user);
      
      if (!userId) {
        setError('Veuillez vous reconnecter pour obtenir des recommandations');
        setLoading(false);
        return;
      }
      
      // Construire l'URL avec l'ID utilisateur
      const url = `${API_URL}/recommandation/student/${userId}?limit=6&min_score=0.6`;
      console.log('🔗 URL de la requête:', url);
      
      // Récupérer les headers d'authentification
      const headers = getAuthHeaders();
      console.log('🔑 Headers:', headers);
      
      // Faire la requête avec timeout
      const response = await axios.get(url, { 
        headers,
        timeout: 30000
      });
      
      console.log('✅ Réponse reçue:', response.data);
      
      setRecommendations(response.data.recommendations || []);
      setStudentInfo(response.data.student_info);
      
    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      } else if (err.response?.status === 404) {
        setError('Service de recommandations non disponible (404)');
      } else if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur lors du calcul des recommandations');
      } else if (err.message?.includes('timeout')) {
        setError('La requête a pris trop de temps. Réessayez.');
      } else {
        setError(`Erreur: ${err.message || 'Erreur inconnue'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return 'text-green-500';
    if (score >= 0.7) return 'text-blue-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.9) return 'bg-green-100';
    if (score >= 0.7) return 'bg-blue-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  const getRecommendationIcon = (score) => {
    if (score >= 0.9) return <FaFire className="text-orange-500" />;
    if (score >= 0.7) return <FaStar className="text-yellow-500" />;
    return <FaBookOpen className="text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-700 rounded-xl h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBrain className="text-orange-500" /> Recommandations IA
        </h2>
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 border border-slate-700">
      {/* Header with student info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <FaBrain className="text-orange-500" /> Recommandations IA Personnalisées
          </h2>
          {studentInfo && (
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="bg-slate-700 px-3 py-1 rounded-full">
                📚 {studentInfo.courses_viewed || 0} cours consultés
              </span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">
                ✅ {studentInfo.courses_completed || 0} complétés
              </span>
              <span className="bg-slate-700 px-3 py-1 rounded-full">
                🎯 Filière: {studentInfo.branch || 'Non spécifiée'}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={fetchRecommendations}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <FaBrain /> Actualiser
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FaBrain className="text-4xl mx-auto mb-3 text-slate-600" />
          <p className="text-lg">Aucune recommandation disponible pour le moment</p>
          <p className="text-sm mt-2">Continuez à explorer des cours pour recevoir des suggestions personnalisées</p>
        </div>
      ) : (
        <>
          {/* Recommendations grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.course_id}
                className="bg-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-blue-500/50 overflow-hidden group"
              >
                {/* Score badge */}
                <div className="absolute top-3 right-3 z-10">
                  <div className={`${getScoreBgColor(rec.score_confiance)} ${getScoreColor(rec.score_confiance)} px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                    {getRecommendationIcon(rec.score_confiance)}
                    <span>{(rec.score_confiance * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Course info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                        {rec.subject}
                      </span>
                    </div>
                    {rec.is_completed && (
                      <FaCheckCircle className="text-green-500 text-lg" title="Cours complété" />
                    )}
                    {rec.is_viewed && !rec.is_completed && (
                      <FaEye className="text-blue-500 text-lg" title="Déjà consulté" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {rec.course_title}
                  </h3>
                  
                  {rec.course_description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {rec.course_description}
                    </p>
                  )}

                  {/* Teacher info */}
                  {rec.teacher && (
                    <div className="text-sm text-slate-300 mb-4 p-3 bg-slate-800/50 rounded-lg">
                      <p className="font-medium">👨‍🏫 {rec.teacher.name}</p>
                    </div>
                  )}

                  {/* AI Message */}
                  <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                    <div className="flex items-start gap-2">
                      <FaBrain className="text-orange-500 mt-1 flex-shrink-0" />
                      <p className="text-sm text-slate-300">
                        {rec.message || "Recommandé par notre IA"}
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleViewCourse(rec.course_id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 group"
                  >
                    <span>Voir le cours</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats footer */}
          <div className="mt-6 pt-4 border-t border-slate-700 text-center text-slate-400 text-sm">
            <p>
              {recommendations.filter(r => r.recommandation).length} sur {recommendations.length} cours fortement recommandés • 
              Basé sur votre filière, historique et préférences
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendationsCard;