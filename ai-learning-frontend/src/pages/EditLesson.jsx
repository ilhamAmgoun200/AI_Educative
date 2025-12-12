import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';

const EditLesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    order_no: '',
    is_published: false,
    course_pdf: null
  });
  const [existingPdf, setExistingPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  useEffect(() => { fetchLesson(); }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/courses/${lessonId}?include_files=true`,
        { headers: getAuthHeaders() }
      );
      const courseData = response.data.data;
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        video_url: courseData.video_url || '',
        order_no: courseData.order_no || '',
        is_published: courseData.is_published || false,
        course_pdf: null
      });
      if (courseData.files && courseData.files.length > 0) setExistingPdf(courseData.files[0]);
      setError('');
    } catch (error) {
      setError('Impossible de charger le cours');
    } finally {
      setLoading(false);
    }
  };

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
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // 1. Update course data
      const courseData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        order_no: formData.order_no ? parseInt(formData.order_no) : null,
        is_published: formData.is_published
      };
      await axios.put(
        `${API_URL}/courses/${lessonId}`,
        courseData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          }
        }
      );
      // 2. Upload new PDF if present
      if (formData.course_pdf) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', formData.course_pdf);
        await axios.post(
          `${API_URL}/courses/${lessonId}/files`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...getAuthHeaders(),
            }
          }
        );
      }
      setSuccess('✅ Cours modifié avec succès!');
      setTimeout(() => { navigate('/dashboard-teacher'); }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error?.message || 'Erreur inconnue';
        setError(`Erreur ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        setError('Impossible de contacter le serveur');
      } else {
        setError('Erreur: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => { navigate('/dashboard-teacher'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-4 py-2 rounded-md border border-gray-200"
              >← Retour</button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modifier le Cours</h1>
                <p className="text-gray-400 mt-1">Enseignant: {user?.first_name} {user?.last_name}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2 text-base">
                Titre du cours *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
              />
            </div>
            {/* Video + order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  URL de la vidéo
                </label>
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
                <label className="block text-gray-800 font-semibold mb-2">
                  Numéro d'ordre
                </label>
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
            {/* PDF actuel */}
            {existingPdf && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-blue-800 font-semibold mb-2">📄 PDF actuel :</p>
                <a
                  href={`${API_URL.replace('/api', '')}/uploads/courses/${existingPdf.file_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {existingPdf.file_name}
                </a>
              </div>
            )}
            {/* Nouveau PDF */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                {existingPdf ? 'Remplacer le PDF' : 'Ajouter un PDF'}
              </label>
              <div className="border border-dashed border-gray-400 rounded-lg p-4 text-center hover:border-blue-400 transition">
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
                      <span className="font-semibold">{formData.course_pdf.name}</span>
                    ) : (
                      <span className="font-semibold">
                        Cliquez ici pour sélectionner un PDF
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">Formats acceptés: .pdf (Max 10MB)</span>
                </label>
              </div>
              {formData.course_pdf && (
                <p className="text-green-600 mt-2">
                  ✅ Nouveau fichier sélectionné: {formData.course_pdf.name}
                </p>
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
                Publier ce cours
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
              >Annuler</button>
              <button
                type="submit"
                disabled={submitting || !formData.title}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Modification...
                  </div>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLesson;