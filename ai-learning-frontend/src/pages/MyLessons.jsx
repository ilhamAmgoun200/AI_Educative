import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';
import UserMenu from '../components/UserMenu';

const BADGE_STYLES = {
  published: 'bg-green-100 text-green-800 border-green-200',
  draft: 'bg-orange-100 text-orange-800 border-orange-200',
};

const MyLessons = () => {
  const navigate = useNavigate();
  const { teacherId, isAuthenticated, user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
      return;
    }
    if (teacherId) {
      fetchLessons();
    } else {
      setError('Impossible de récupérer votre identifiant TEACHER. Veuillez vous reconnecter.');
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [teacherId, isAuthenticated, navigate]);

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
        `${API_URL}/courses?teacher_id=${teacherId}&include_files=true`,
        { headers: getAuthHeaders() }
      );
      if (response.data.data && Array.isArray(response.data.data)) {
        setLessons(response.data.data);
      } else {
        setLessons([]);
      }
    } catch (error) {
      setError('Erreur lors du chargement des cours');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLesson = (courseId) => navigate(`/view-lesson/${courseId}`);
  const handleEditLesson = (courseId) => navigate(`/edit-lesson/${courseId}`);
  const handleDeleteLesson = async (courseId, courseTitle) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${courseTitle}" ?`)) return;
    try {
      await axios.delete(`${API_URL}/courses/${courseId}`, {
        headers: getAuthHeaders(),
      });
      fetchLessons();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const userName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'Utilisateur';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <button
            onClick={() => navigate('/dashboard-teacher')}
            className="rounded-lg px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            ← Tableau de bord
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block leading-tight">
              <span className="font-semibold text-gray-900">{userName}</span>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>
      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-md p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Mes Cours</h2>
              <span className="block mt-2 text-gray-500 font-medium">
                {lessons.length} cours au total
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchLessons}
                className="flex items-center rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 transition"
              >🔄 Actualiser</button>
              <button
                onClick={() => navigate('/create-lesson')}
                className="flex items-center rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow transition"
              >+ Nouveau cours</button>
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <span className="text-gray-400">Chargement des cours…</span>
            </div>
          ) : error ? (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 text-base rounded-xl py-4 px-6 font-medium text-center">
              {error}
            </div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl mb-3">📘</span>
              <p className="text-gray-400 text-lg">Vous n&apos;avez pas encore créé de cours.</p>
              <button
                onClick={() => navigate('/create-lesson')}
                className="mt-4 rounded-md bg-blue-600 text-white px-6 py-2 flex items-center gap-2 font-medium hover:bg-blue-700 transition"
              >Créer mon premier cours</button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {lessons.map((courseData) => {
                if (!courseData || !courseData.title) return null;
                const courseId = courseData.id;
                const published = courseData.is_published;
                const badge = published
                  ? BADGE_STYLES.published
                  : BADGE_STYLES.draft;

                return (
                  <div
                    key={courseId}
                    className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex flex-col justify-between hover:border-blue-300 transition group"
                    onClick={() => handleViewLesson(courseId)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{courseData.title}</h3>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${badge}`}>
                        {published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm mb-4 min-h-[48px] line-clamp-3">
                      {courseData.description || 'Aucune description disponible'}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4 text-xs">
                      {courseData.order_no && (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Ordre: {courseData.order_no}</span>
                      )}
                      {courseData.video_url && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Vidéo</span>
                      )}
                      {courseData.files && courseData.files.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">PDF</span>
                      )}
                      <span className="ml-auto text-gray-400 font-mono">
                        {new Date(courseData.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewLesson(courseId); }}
                        className="flex-1 rounded-md text-white bg-blue-500 hover:bg-blue-600 py-2 font-medium text-sm transition"
                      >👁️ Voir</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditLesson(courseId); }}
                        className="flex-1 rounded-md text-white bg-green-500 hover:bg-green-600 py-2 font-medium text-sm transition"
                      >✏️ Modifier</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteLesson(courseId, courseData.title); }}
                        className="rounded-md px-3 py-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 font-medium text-sm transition"
                        title="Supprimer"
                      >🗑️</button>
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