import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';

const FavoritesPage = () => {
  const [likedCourses, setLikedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLikedCourses();
  }, []);

  const fetchLikedCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/likes/students/me/likes`,
        { headers: getAuthHeaders() }
      );
      setLikedCourses(response.data.liked_courses || []);
    } catch (err) {
      console.error("Erreur chargement favoris:", err);
      setError('Impossible de charger vos favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des favoris...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">❤️ Mes Cours Favoris</h1>
              <p className="text-orange-100">
                {likedCourses.length} cours sauvegardés
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-lg transition-all"
            >
              ← Retour
            </button>
          </div>
        </div>

        {/* Liste des cours */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-6">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : likedCourses.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🤍</span>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Aucun favoris</h3>
              <p className="text-slate-600">
                Likez des cours pour les retrouver ici !
              </p>
              <button
                onClick={() => navigate('/dashboard-student')}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Explorer les cours
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 p-6"
                >
                  {/* Header avec date et bouton like */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-500">
                      Ajouté le {new Date(course.liked_at).toLocaleDateString('fr-FR')}
                    </span>
                    <button className="text-orange-500 text-xl">❤️</button>
                  </div>

                  {/* Titre et description */}
                  <h3 className="text-xl font-bold text-blue-700 mb-3">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Professeur */}
                  {course.teacher && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Professeur:</span> {course.teacher.first_name} {course.teacher.last_name}
                      </p>
                    </div>
                  )}

                  {/* Bouton */}
                  <button
                    onClick={() => handleViewCourse(course.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    👁️ Voir le cours
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;