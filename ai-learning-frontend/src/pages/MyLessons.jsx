import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyLessons = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchLessons();
  }, []);

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
      
      console.log('✅ Réponse complète:', response.data);
      console.log('✅ Lessons data:', response.data.data);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        setLessons(response.data.data);
        console.log('✅ Nombre de cours:', response.data.data.length);
      } else {
        setLessons([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement lessons:', error);
      setError('Erreur lors du chargement des cours');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

const handleViewLesson = (documentId) => {
  navigate(`/lesson/${documentId}`);
};

const handleEditLesson = async (documentId) => {
  const title = prompt("Nouveau titre ?");
  if (!title) return;
  
  const description = prompt("Nouvelle description ?");
  if (!description) return;

  try {
    const token = localStorage.getItem('authToken');

    await axios.put(
      `http://localhost:1337/api/lessons/${documentId}`,
      { data: { title, description } },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Cours mis à jour !");
    fetchLessons();
  } catch (error) {
    console.error(error.response || error);
    alert("Erreur lors de la modification");
  }
};


const handleDeleteLesson = async (documentId, lessonTitle) => {
  if (!window.confirm(`Voulez-vous vraiment supprimer "${lessonTitle}" ?`)) return;

  try {
    const token = localStorage.getItem('authToken');

    await axios.delete(`http://localhost:1337/api/lessons/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Cours supprimé !");
    fetchLessons();
  } catch (error) {
    console.error(error.response || error);
    alert("Erreur lors de la suppression");
  }
};



  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard-teacher')}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                ← Retour
              </button>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Mes Cours</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">
                  {userData.first_name} {userData.last_name}
                </p>
                <p className="text-slate-400 text-sm">{userData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Liste de mes cours</h2>
              <p className="text-slate-600 mt-1">{lessons.length} cours au total</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchLessons}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                🔄 Actualiser
              </button>
              <button
                onClick={() => navigate('/create-lesson')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                ➕ Nouveau cours
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {lessons.map((lesson) => {
                console.log('🔍 Rendering lesson:', lesson);
                
                // ✅ CORRECTION: Les données sont directement dans lesson, pas dans lesson.attributes
                const lessonData = lesson?.attributes || lesson;
                
                if (!lessonData || !lessonData.title) {
                  console.warn('⚠️ Lesson sans titre:', lesson);
                  return null;
                }

                return (
                  <div
                    key={lesson.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 overflow-hidden cursor-pointer"
                    onClick={() => handleViewLesson(lesson.id)}
                  >
                    {/* En-tête de la carte */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">
                          {lessonData.title || 'Sans titre'}
                        </h3>
                        {lessonData.is_published ? (
                          <span className="bg-green-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                            ✓ Publié
                          </span>
                        ) : (
                          <span className="bg-yellow-400 text-slate-900 px-2 py-1 rounded-full text-xs font-bold">
                            Brouillon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-4">
                      <p className="text-slate-600 mb-4 min-h-[60px] line-clamp-3">
                        {lessonData.description || 'Aucune description disponible'}
                      </p>

                      {/* Informations supplémentaires */}
                      <div className="space-y-2 mb-4">
                        {lessonData.order_no && (
                          <div className="flex items-center text-sm text-slate-600">
                            <span className="mr-2">📊</span>
                            <span>Ordre: {lessonData.order_no}</span>
                          </div>
                        )}
                        
                        {lessonData.video_url && (
                          <div className="flex items-center text-sm text-slate-600">
                            <span className="mr-2">🎥</span>
                            <span>Vidéo disponible</span>
                          </div>
                        )}
                        
                        {lessonData.course_pdf && lessonData.course_pdf.length > 0 && (
                          <div className="flex items-center text-sm text-slate-600">
                            <span className="mr-2">📄</span>
                            <span>PDF disponible</span>
                          </div>
                        )}
                      </div>

                      {/* Date de création */}
                      <p className="text-xs text-slate-400 mb-4">
                        Créé le {new Date(lessonData.createdAt).toLocaleDateString('fr-FR')}
                      </p>

                      {/* Boutons d'action */}
                      <div className="flex gap-2">
                        <button
                           onClick={(e) => { e.stopPropagation(); handleViewLesson(lesson.documentId); }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all font-semibold"
                        >
                          👁️ Voir
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson.documentId); }}

                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all font-semibold"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                           onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.documentId, lesson.title); }}
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
      </main>
    </div>
  );
};

export default MyLessons;