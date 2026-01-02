import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LessonDetailsprof = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://ai-educative-12.onrender.com/api/lessons/${documentId}`);
      setLesson(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${lesson.title}" ?`)) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://ai-educative-12.onrender.com/api/lessons/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Cours supprimé');
      navigate('/my-lessons');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!lesson) return <p>Cours introuvable</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      <p className="mb-2"><strong>Description:</strong> {lesson.description}</p>
      <p className="mb-2"><strong>Ordre:</strong> {lesson.order_no || '—'}</p>
      <p className="mb-2"><strong>Publié:</strong> {lesson.is_published ? 'Oui' : 'Non'}</p>
      {lesson.video_url && (
        <p className="mb-2"><strong>Vidéo:</strong> <a href={lesson.video_url} target="_blank" rel="noreferrer">Voir la vidéo</a></p>
      )}
      <p className="mb-4"><strong>Créé le:</strong> {new Date(lesson.createdAt).toLocaleDateString()}</p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/edit-lesson/${lesson.documentId}`)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
};

export default LessonDetailsprof;
