import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';

const ViewLesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { isAuthenticated } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
      return;
    }
    fetchLesson();
  }, [lessonId, isAuthenticated, navigate]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/courses/${lessonId}?include_files=true`, {
        headers: getAuthHeaders(),
      });

      if (response.data?.data) {
        setLesson(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Cours introuvable (ID: ${lessonId})`);
      } else if (err.response?.status === 403) {
        setError('Vous n\'avez pas la permission d\'accéder à ce cours.');
      } else if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Impossible de charger le cours');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-gray-100 p-8 rounded-2xl text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Erreur</h2>
          <p className="text-slate-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-lessons')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  const courseData = lesson;
  const pdfData = courseData.files || [];

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gray-100 rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-slate-900">{courseData.title}</h1>
            <button
              onClick={() => navigate('/my-lessons')}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
            >
              ← Retour
            </button>
          </div>

          {courseData.is_published ? (
            <span className="inline-block bg-green-400 text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
              ✓ Publié
            </span>
          ) : (
            <span className="inline-block bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-sm font-bold mb-4">
              Brouillon
            </span>
          )}

          {courseData.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Description</h2>
              <p className="text-slate-700 whitespace-pre-line">{courseData.description}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {courseData.order_no && (
              <div className="flex items-center text-slate-700">
                <span className="mr-2">📊</span>
                <span>Ordre: {courseData.order_no}</span>
              </div>
            )}

            {courseData.video_url && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Vidéo</h3>
                <a
                  href={courseData.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {courseData.video_url}
                </a>
              </div>
            )}

            {pdfData && pdfData.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">PDF du cours</h3>
                {pdfData.map((pdf, index) => (
                  <a
                    key={index}
                    href={`${API_URL.replace('/api', '')}/uploads/courses/${pdf.file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-700 underline mb-2"
                  >
                    📄 {pdf.file_name}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate(`/edit-lesson/${lessonId}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() => navigate('/my-lessons')}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLesson;
