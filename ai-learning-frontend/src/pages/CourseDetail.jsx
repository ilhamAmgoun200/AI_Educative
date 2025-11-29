import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { getAuthHeaders } from '../utils/auth';

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour l'assistant AI
  const [currentExplanation, setCurrentExplanation] = useState(null);
  const [explanationsHistory, setExplanationsHistory] = useState([]);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [playingExplanationId, setPlayingExplanationId] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [deletingExplanationId, setDeletingExplanationId] = useState(null);

  useEffect(() => {
    fetchLesson();
    fetchCurrentExplanation();
    fetchExplanationsHistory();
  }, [id]);

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

  const fetchCurrentExplanation = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/ai/courses/${id}/explanation`,
        { headers: getAuthHeaders() }
      );
      setCurrentExplanation(response.data.data);
    } catch (error) {
      console.log("Aucune explication actuelle trouvée");
    }
  };

  const fetchExplanationsHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/ai/courses/${id}/explanations-history`,
        { headers: getAuthHeaders() }
      );
      setExplanationsHistory(response.data.data || []);
    } catch (error) {
      console.log("Erreur lors du chargement de l'historique");
    }
  };

  const handleGenerateExplanation = async (forceNew = false) => {
    try {
      setLoadingExplanation(true);
      setError('');
      
      const response = await axios.post(
        `${API_URL}/ai/courses/${id}/generate-explanation`,
        { force_new: forceNew },
        { headers: getAuthHeaders() }
      );
      
      setCurrentExplanation(response.data.data);
      
      // Rafraîchir l'historique
      await fetchExplanationsHistory();
      
      alert(forceNew ? 'Nouvelle explication générée !' : 'Explication générée avec succès !');
    } catch (error) {
      console.error("Erreur génération:", error);
      setError(error.response?.data?.error || 'Erreur lors de la génération');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleDeleteExplanation = async (explanationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette explication ?')) {
      return;
    }

    try {
      setDeletingExplanationId(explanationId);
      
      await axios.delete(
        `${API_URL}/ai/explanations/${explanationId}`,
        { headers: getAuthHeaders() }
      );
      
      // Arrêter l'audio si c'est celui en cours de lecture
      if (playingExplanationId === explanationId && audioElement) {
        audioElement.pause();
        setIsPlaying(false);
        setPlayingExplanationId(null);
      }
      
      // Rafraîchir l'historique et l'explication actuelle
      await fetchExplanationsHistory();
      await fetchCurrentExplanation();
      
      alert('Explication supprimée avec succès !');
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setDeletingExplanationId(null);
    }
  };

  const handlePlayAudio = async (explanationId = null) => {
    try {
      // Arrêter l'audio en cours
      if (isPlaying && audioElement) {
        audioElement.pause();
        setIsPlaying(false);
        setPlayingExplanationId(null);
        return;
      }

      setLoadingExplanation(true);
      
      // Déterminer l'URL en fonction de si c'est l'explication actuelle ou une de l'historique
      const audioUrl = explanationId 
        ? `${API_URL}/ai/explanations/${explanationId}/audio`
        : `${API_URL}/ai/courses/${id}/explanation/audio`;
      
      const response = await axios.get(audioUrl, {
        headers: getAuthHeaders(),
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
      
      const audio = new Audio(url);
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
        setPlayingExplanationId(null);
      };
      
      audio.play();
      setIsPlaying(true);
      setPlayingExplanationId(explanationId);
      
    } catch (error) {
      console.error("Erreur lecture audio:", error);
      setError('Erreur lors de la lecture audio');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleStopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setPlayingExplanationId(null);
    }
  };

  const handleOpenPdfViewer = (pdf) => {
    setSelectedPdf(pdf);
    setShowPdfViewer(true);
  };

  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
    setSelectedPdf(null);
  };

  // Fonction pour obtenir l'URL correcte du PDF
  const getPdfUrl = (fileName) => {
    // Retirer /api et utiliser /uploads/courses/
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}/uploads/courses/${fileName}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Chargement du cours...</div>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-xl text-red-600 mb-4">{error || 'Cours introuvable'}</div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Bouton Retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
          >
            ← Retour
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
          <p className="text-gray-600">{lesson.description}</p>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Assistant IA */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🤖</span>
                  <h2 className="text-2xl font-bold text-gray-800">Assistant IA</h2>
                </div>
                
                {/* Bouton Historique */}
                {explanationsHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                  >
                    {showHistory ? '📋 Masquer' : '📚 Historique'} ({explanationsHistory.length})
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Explication actuelle */}
              {!currentExplanation ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Générez une explication orale détaillée de ce cours grâce à l'intelligence artificielle.
                  </p>
                  <button
                    onClick={() => handleGenerateExplanation(false)}
                    disabled={loadingExplanation}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    {loadingExplanation ? '⏳ Génération en cours...' : '✨ Générer l\'explication'}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">📝 Explication actuelle:</h3>
                      <button
                        onClick={() => handleGenerateExplanation(true)}
                        disabled={loadingExplanation}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-semibold transition-all"
                      >
                        🔄 Régénérer
                      </button>
                    </div>
                    <div className="text-gray-700 whitespace-pre-line max-h-64 overflow-y-auto">
                      {currentExplanation.explanation_text}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePlayAudio(null)}
                      disabled={loadingExplanation}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center"
                    >
                      {loadingExplanation ? '⏳' : (isPlaying && !playingExplanationId) ? '⏸️ Pause' : '▶️ Écouter'}
                    </button>

                    {isPlaying && !playingExplanationId && (
                      <button
                        onClick={handleStopAudio}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                      >
                        ⏹️ Arrêter
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    Généré le {new Date(currentExplanation.created_at).toLocaleDateString('fr-FR')} à {new Date(currentExplanation.created_at).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              )}

              {/* Historique des explications */}
              {showHistory && explanationsHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-purple-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Historique des explications</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {explanationsHistory.map((exp, index) => (
                      <div key={exp.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700">
                              Version {explanationsHistory.length - index}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(exp.created_at).toLocaleDateString('fr-FR')} à {new Date(exp.created_at).toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePlayAudio(exp.id)}
                              disabled={loadingExplanation || deletingExplanationId === exp.id}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-semibold transition-all"
                            >
                              {(isPlaying && playingExplanationId === exp.id) ? '⏸️ Pause' : '▶️ Écouter'}
                            </button>
                            <button
                              onClick={() => handleDeleteExplanation(exp.id)}
                              disabled={deletingExplanationId === exp.id}
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-semibold transition-all"
                            >
                              {deletingExplanationId === exp.id ? '⏳' : '🗑️ Supprimer'}
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-3">
                          {exp.explanation_text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vidéo */}
            {lesson.video_url && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎥 Vidéo du cours</h2>
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Voir la vidéo
                </a>
              </div>
            )}

            {/* PDF */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Supports de cours</h2>
              {lesson.files && lesson.files.length > 0 ? (
                <div className="space-y-3">
                  {lesson.files.map((pdf, index) => (
                    <div key={pdf.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{pdf.file_name}</p>
                          <p className="text-sm text-gray-500">Document {index + 1}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenPdfViewer(pdf)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
                          >
                            👁️ Voir
                          </button>
                          <a
                            href={getPdfUrl(pdf.file_name)}
                            download
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            📥 Télécharger
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun fichier disponible</p>
              )}
            </div>
          </div>

          {/* Sidebar Informations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Informations du cours</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Date de création:</p>
                  <p className="font-semibold">
                    {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Dernière mise à jour:</p>
                  <p className="font-semibold">
                    {lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Ressources disponibles:</p>
                  <p className="font-semibold">{lesson.files?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Explications générées:</p>
                  <p className="font-semibold">{explanationsHistory.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualiseur PDF Modal */}
        {showPdfViewer && selectedPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
              {/* Header du modal */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedPdf.file_name}</h3>
                  <p className="text-sm text-gray-500">Visualisation du document</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={getPdfUrl(selectedPdf.file_name)}
                    download
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    📥 Télécharger
                  </a>
                  <button
                    onClick={handleClosePdfViewer}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    ✕ Fermer
                  </button>
                </div>
              </div>

              {/* Contenu du PDF */}
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={getPdfUrl(selectedPdf.file_name)}
                  className="w-full h-full border-0"
                  title={selectedPdf.file_name}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetails;