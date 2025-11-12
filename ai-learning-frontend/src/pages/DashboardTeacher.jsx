import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardTeacher = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLessons, setShowLessons] = useState(false);

  // Récupérer l'ID du teacher connecté
  const getTeacherId = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      const decodedToken = JSON.parse(atob(token));
      return decodedToken.id;
    } catch (error) {
      console.error('Erreur décodage token:', error);
      return null;
    }
  };

  const teacherId = getTeacherId();

  // Charger les lessons du teacher connecté
  const fetchLessons = async () => {
    if (!teacherId) {
      setError('Impossible de récupérer votre identifiant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `http://localhost:1337/api/lessons?filters[teacher][id][$eq]=${teacherId}&populate[0]=teacher&populate[1]=course_pdf`
      );
      
      console.log('✅ Lessons chargés:', response.data.data);
      setLessons(response.data.data || []);
      setShowLessons(true);
    } catch (error) {
      console.error('❌ Erreur chargement lessons:', error);
      setError('Erreur lors du chargement des cours');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    navigate('/loginn');
  };

  const handleEditLesson = (lessonId) => {
    navigate(`/edit-lesson/${lessonId}`);
  };

  const handleDeleteLesson = async (lessonId, lessonTitle) => {
  if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le cours "${lessonTitle}" ?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    
    await axios.delete(`http://localhost:1337/api/lessons/${lessonId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    alert('✅ Cours supprimé avec succès');
    fetchLessons();
  } catch (error) {
    console.error('Erreur suppression:', error);
    alert('❌ Erreur lors de la suppression du cours');
  }
};

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
              <h1 className="text-2xl font-bold text-white">Espace Enseignant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">
                  {userData.first_name} {userData.last_name}
                </p>
                <p className="text-slate-400 text-sm">{userData.email}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div 
            className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/create-lesson')}
          >
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">📖</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Créer un Cours</h3>
            <p className="text-slate-600">Publiez de nouveaux contenus pédagogiques</p>
          </div>

          {/* Card 2 - Voir mes cours */}
          <div 
  className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
  onClick={() => navigate('/my-lessons')}  // ✅ Cette ligne
>
  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
    <span className="text-white text-xl">📚</span>
  </div>
  <h3 className="text-xl font-bold text-slate-900 mb-2">Mes Cours</h3>
  <p className="text-slate-600">Consulter et gérer mes cours</p>
</div>

          {/* Card 3 */}
          <div className="bg-gray-100 p-6 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">👨‍🏫</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mes Étudiants</h3>
            <p className="text-slate-600">Gérez votre liste d'étudiants</p>
          </div>
        </div>

        {/* Liste des Lessons */}
        {showLessons && (
          <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Mes Cours</h2>
              <div className="flex space-x-3">
                <button
                  onClick={fetchLessons}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  🔄 Actualiser
                </button>
                <button
                  onClick={() => setShowLessons(false)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  ✕ Fermer
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600 mt-4">Chargement des cours...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-slate-600 text-lg mb-4">Vous n'avez pas encore créé de cours</p>
                <button
                  onClick={() => navigate('/create-lesson')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Créer mon premier cours
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const lessonData = lesson?.attributes || {};
                  
                  if (!lessonData.title) {
                    console.warn('Lesson sans titre:', lesson);
                    return null;
                  }

                  return (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all border border-slate-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900">
                              {lessonData.title}
                            </h3>
                            {lessonData.is_published ? (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                ✓ Publié
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                                ⚠ Brouillon
                              </span>
                            )}
                          </div>

                          <p className="text-slate-600 mb-3">
                            {lessonData.description || 'Pas de description'}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            {lessonData.order_no && (
                              <span>📊 Ordre: {lessonData.order_no}</span>
                            )}
                            {lessonData.video_url && (
                              <span>🎥 Vidéo disponible</span>
                            )}
                            {lessonData.course_pdf?.data && (
                              <a
                                href={`http://localhost:1337${lessonData.course_pdf.data.attributes.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                              >
                                📄 Télécharger PDF
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 mt-2">
                            Créé le {new Date(lessonData.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditLesson(lesson.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id, lessonData.title)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Informations enseignant */}
        <div className="mt-8 bg-gray-100 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Mes Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-600"><strong>Matière:</strong> {userData.subject || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>Établissement:</strong> {userData.establishment || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-slate-600"><strong>Expérience:</strong> {userData.experience_years || '0'} ans</p>
              <p className="text-slate-600"><strong>CIN:</strong> {userData.cin || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>Téléphone:</strong> {userData.phone || 'Non renseigné'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardTeacher;