import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';

const CreateLesson = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    order_no: '',
    is_published: false,
    course_pdf: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { teacherId, user } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      course_pdf: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teacherId) {
      setError('Erreur: Impossible de récupérer votre identifiant. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Création du course d'abord SANS le PDF
      const courseData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        order_no: formData.order_no ? parseInt(formData.order_no) : null,
        is_published: formData.is_published,
      };
      const courseResponse = await axios.post(
        `${API_URL}/courses`,
        courseData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          }
        }
      );
      const createdCourseId = courseResponse.data.data?.id || courseResponse.data.id;
      // Upload PDF si présent
      if (formData.course_pdf) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', formData.course_pdf);
        await axios.post(
          `${API_URL}/courses/${createdCourseId}/files`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...getAuthHeaders(),
            }
          }
        );
      }
      setSuccess('Cours créé avec succès!');
      setTimeout(() => {
        navigate('/dashboard-teacher');
      }, 1500);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Erreur inconnue';
        setError(`Erreur ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        setError("Impossible de contacter le serveur.");
      } else {
        setError('Erreur: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/dashboard-teacher');

  if (!teacherId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl text-center border">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur d'authentification</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={handleCancel}
            className="bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 mr-2"
          >← Retour</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Créer un Nouveau Cours</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Enseignant: {user?.first_name} {user?.last_name} | ID: {teacherId}
            </p>
          </div>
        </div>
        {/* Formulaire */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Titre du cours *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Ex: Introduction aux vecteurs"
                required
              />
            </div>
            {/* Description */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Décrivez le contenu de ce cours..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 font-semibold mb-2">URL de la vidéo</label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-gray-800 font-semibold mb-2">Numéro d'ordre</label>
                <input
                  type="number"
                  name="order_no"
                  value={formData.order_no}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="1, 2, 3..."
                  min="1"
                />
              </div>
            </div>
            {/* Fichier PDF */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Fichier PDF du cours</label>
              <div className="border border-dashed border-gray-400 rounded-lg p-5 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer block text-gray-500 hover:text-blue-600">
                  <div className="mb-2">
                    {formData.course_pdf ? (
                      <span className="font-medium">{formData.course_pdf.name}</span>
                    ) : (
                      <span className="font-medium">Cliquez ici pour sélectionner un PDF</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">Formats acceptés: .pdf (Max 10MB)</span>
                </label>
              </div>
              {formData.course_pdf && (
                <p className="text-green-600 mt-2">✅ Fichier sélectionné: {formData.course_pdf.name}</p>
              )}
            </div>
            {/* Publication */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                id="publish-checkbox"
              />
              <label htmlFor="publish-checkbox" className="text-gray-800 font-semibold cursor-pointer">
                Publier immédiatement ce cours
              </label>
            </div>
            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 border border-gray-200 font-medium py-4 px-6 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Création...
                  </div>
                ) : (
                  'Créer le cours'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;