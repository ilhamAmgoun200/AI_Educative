import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/courses/${id}?include_files=true`);
        setLesson(response.data.data);
        setError('');
      } catch (error) {
        console.error("Erreur lors du chargement du cours :", error);
        setError('Impossible de charger le cours');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300 mt-4">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Cours introuvable'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Bouton Retour */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
        >
          ← Retour
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4">{lesson.title}</h1>
          <p className="text-blue-50 text-xl max-w-3xl">{lesson.description}</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vidéo */}
          {lesson.video_url && (
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-3">🎥 Vidéo du cours</h2>
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Voir la vidéo
              </a>
            </div>
          )}

          {/* PDF */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">📄 Supports de cours</h2>
            {lesson.files && lesson.files.length > 0 ? (
              <div className="space-y-3">
                {lesson.files.map((pdf, index) => (
                  <a
                    key={pdf.id}
                    href={`${API_URL.replace('/api', '')}/uploads/courses/${pdf.file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={pdf.file_name}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{pdf.file_name}</p>
                      <p className="text-gray-500 text-sm">Document {index + 1}</p>
                    </div>
                    <span className="text-blue-600 font-medium">Télécharger</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun fichier disponible</p>
            )}
          </div>
        </div>

        {/* Sidebar Informations */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-8">
            <h3 className="text-xl font-bold text-blue-700 mb-4">Informations du cours</h3>
            <div className="space-y-3">
              <p><span className="font-semibold text-gray-700">Date de création:</span> {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
              <p><span className="font-semibold text-gray-700">Dernière mise à jour:</span> {lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
              <p><span className="font-semibold text-gray-700">Ressources disponibles:</span> {lesson.files?.length || 0}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LessonDetails;
