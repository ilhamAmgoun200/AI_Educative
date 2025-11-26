import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';
import './style/CreateLesson.css';

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
      setError('❌ Erreur: Impossible de récupérer votre identifiant. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ÉTAPE 1: Créer le course d'abord SANS le PDF
      const courseData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        order_no: formData.order_no ? parseInt(formData.order_no) : null,
        is_published: formData.is_published,
      };

      console.log('📤 Étape 1: Création du course:', courseData);

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

      console.log('✅ Course créé:', courseResponse.data);
      // Flask retourne { message: '...', data: {...} }
      const createdCourseId = courseResponse.data.data?.id || courseResponse.data.id;

      // ÉTAPE 2: Upload du PDF si présent
      if (formData.course_pdf) {
        console.log('📎 Étape 2: Upload du PDF...');
        
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

        console.log('✅ PDF uploadé');
      }

    setSuccess('✅ Cours créé avec succès!');
    
    setTimeout(() => {
      navigate('/dashboard-teacher');
    }, 2000);

  } catch (error) {
    console.error('❌ Erreur complète:', error);
    
    if (error.response) {
      console.log('📋 Status:', error.response.status);
      console.log('📋 Data:', error.response.data);
      
      const errorMessage = error.response.data?.error || error.response.data?.message || 'Erreur inconnue';
      setError(`❌ Erreur ${error.response.status}: ${errorMessage}`);
    } else if (error.request) {
      setError('❌ Impossible de contacter le serveur Flask. Vérifiez qu\'il est démarré sur http://localhost:5000');
    } else {
      setError('❌ Erreur: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate('/dashboard-teacher');
  };

  if (!teacherId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-gray-100 p-8 rounded-2xl text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Erreur d'authentification</h2>
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
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition-all"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Créer un Nouveau Cours</h1>
                <p className="text-slate-400 mt-2">
                  Enseignant: {user?.first_name} {user?.last_name} | 
                  ID: {teacherId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-100 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-slate-800 font-semibold mb-3 text-lg">
                Titre du cours *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
                placeholder="Ex: Introduction aux vecteurs"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-800 font-semibold mb-3 text-lg">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 resize-vertical"
                placeholder="Décrivez le contenu de ce cours..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* URL Vidéo */}
              <div>
                <label className="block text-slate-800 font-semibold mb-3">
                  URL de la vidéo
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
                  placeholder="https://..."
                />
              </div>

              {/* Ordre */}
              <div>
                <label className="block text-slate-800 font-semibold mb-3">
                  Numéro d'ordre
                </label>
                <input
                  type="number"
                  name="order_no"
                  value={formData.order_no}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
                  placeholder="1, 2, 3..."
                  min="1"
                />
              </div>
            </div>

            {/* Fichier PDF */}
            <div>
              <label className="block text-slate-800 font-semibold mb-3 text-lg">
                Fichier PDF du cours
              </label>
              <div className="border-2 border-dashed border-slate-400 rounded-xl p-6 text-center transition-all hover:border-blue-500">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className="text-slate-600 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium">
                      {formData.course_pdf ? formData.course_pdf.name : 'Cliquez pour uploader un PDF'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Formats acceptés: .pdf (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>
              {formData.course_pdf && (
                <p className="text-green-600 mt-2">✅ Fichier sélectionné: {formData.course_pdf.name}</p>
              )}
            </div>

            {/* Publication */}
            <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border-2 border-slate-300">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                id="publish-checkbox"
              />
              <label htmlFor="publish-checkbox" className="text-slate-800 font-semibold text-lg cursor-pointer">
                Publier immédiatement ce cours
              </label>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                {success}
              </div>
            )}

            {/* Boutons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Création...
                  </div>
                ) : (
                  'Créer le Cours'
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