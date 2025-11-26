import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';

const DashboardStudent = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
      return;
    }
    fetchCourses();
  }, [isAuthenticated, navigate]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      // Récupérer tous les cours publiés
      const response = await axios.get(
        `${API_URL}/courses?is_published=true&include_files=true`,
        { headers: getAuthHeaders() }
      );
      
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('❌ Erreur chargement courses:', error);
      setError('Erreur lors du chargement des cours');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/loginn');
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const userName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'Utilisateur';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Espace Étudiant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">{userName}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Section Cours Disponibles */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Cours Disponibles</h2>
              <p className="text-slate-600 mt-1">{courses.length} cours publiés</p>
            </div>
            <button
              onClick={fetchCourses}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              🔄 Actualiser
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 mt-4">Chargement des cours...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-slate-600 text-lg">Aucun cours disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 overflow-hidden cursor-pointer"
                  onClick={() => handleViewCourse(course.id)}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-slate-600 mb-4 min-h-[60px] line-clamp-3">
                      {course.description || 'Aucune description'}
                    </p>
                    {course.files && course.files.length > 0 && (
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <span className="mr-2">📄</span>
                        <span>PDF disponible</span>
                      </div>
                    )}
                    {course.video_url && (
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <span className="mr-2">🎥</span>
                        <span>Vidéo disponible</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCourse(course.id);
                      }}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                    >
                      👁️ Voir le cours
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations étudiant */}
        <div className="mt-8 bg-gray-100 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Mes Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-600"><strong>Filière:</strong> {user?.branch || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>Établissement:</strong> {user?.establishment || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>Date de naissance:</strong> {user?.birth_date || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-slate-600"><strong>CNE:</strong> {user?.cne || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>CIN:</strong> {user?.cin || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>Téléphone:</strong> {user?.phone || 'Non renseigné'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardStudent;