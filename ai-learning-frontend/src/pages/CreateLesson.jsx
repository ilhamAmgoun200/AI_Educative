import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const teacherId = getTeacherId();

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

  // ✅ MÉTHODE SIMPLIFIÉE ET CORRECTE
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
      // ✅ MÉTHODE UNIQUE: Création avec FormData pour tout gérer
      const formDataToSend = new FormData();
      
      // ✅ Structure des données pour Strapi v4
      const lessonData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        order_no: formData.order_no ? parseInt(formData.order_no) : null,
        is_published: formData.is_published,
        teacher: teacherId // ✅ ID direct pour la relation
      };

      console.log('📤 Données du lesson:', lessonData);
      
      // ✅ Ajouter les données au FormData
      formDataToSend.append('data', JSON.stringify(lessonData));
      
      // ✅ Ajouter le fichier PDF si présent (format correct pour Strapi)
      if (formData.course_pdf) {
        formDataToSend.append('files.course_pdf', formData.course_pdf);
        console.log('📎 Fichier PDF ajouté:', formData.course_pdf.name);
      }

      console.log('🚀 Envoi à Strapi...');

      const response = await axios.post('http://localhost:1337/api/lessons', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Réponse Strapi:', response.data);
      
      // Vérifier si le lesson a bien été créé avec le teacher
      if (response.data.data) {
        const createdLesson = response.data.data;
        console.log('📝 Lesson créé:', createdLesson);
        
        if (createdLesson.attributes.teacher && createdLesson.attributes.teacher.data) {
          console.log('👨‍🏫 Teacher associé:', createdLesson.attributes.teacher.data.id);
        }
        
        if (createdLesson.attributes.course_pdf && createdLesson.attributes.course_pdf.data) {
          console.log('📄 PDF associé:', createdLesson.attributes.course_pdf.data);
        }
      }

      setSuccess('✅ Cours créé avec succès!');
      
      setTimeout(() => {
        navigate('/dashboard-teacher');
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur création cours:', error);
      
      if (error.response) {
        console.log('📋 Détails erreur:', error.response.data);
        
        // ✅ Analyser l'erreur spécifique
        if (error.response.data.error) {
          const strapiError = error.response.data.error;
          console.log('🔍 Erreur Strapi:', strapiError);
          
          if (strapiError.name === 'ValidationError') {
            setError(`❌ Erreur de validation: ${strapiError.message}`);
          } else if (strapiError.details) {
            setError(`❌ Erreur: ${JSON.stringify(strapiError.details)}`);
          } else {
            setError(`❌ Erreur ${error.response.status}: ${strapiError.message}`);
          }
        } else {
          setError(`❌ Erreur ${error.response.status}: Requête invalide`);
        }
      } else if (error.request) {
        setError('❌ Impossible de contacter le serveur Strapi');
      } else {
        setError('❌ Erreur inattendue: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ MÉTHODE ALTERNATIVE si la première échoue
  const tryAlternativeMethod = async () => {
    try {
      console.log('🔄 Essai méthode alternative...');
      
      // Essayer avec une structure de relation différente
      const lessonData = {
        data: {
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          order_no: formData.order_no ? parseInt(formData.order_no) : null,
          is_published: formData.is_published,
          teacher: {
            id: teacherId,
            __type: "users"
          }
        }
      };

      console.log('📤 Données alternative:', lessonData);

      let response;
      
      if (formData.course_pdf) {
        const formDataToSend = new FormData();
        formDataToSend.append('data', JSON.stringify(lessonData.data));
        formDataToSend.append('files.course_pdf', formData.course_pdf);
        
        response = await axios.post('http://localhost:1337/api/lessons', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post('http://localhost:1337/api/lessons', lessonData);
      }

      console.log('✅ Succès méthode alternative:', response.data);
      setSuccess('✅ Cours créé avec succès!');
      setTimeout(() => navigate('/dashboard-teacher'), 2000);

    } catch (error) {
      console.error('❌ Échec méthode alternative:', error);
      setError('❌ Impossible de créer le cours. Vérifiez la configuration des relations dans Strapi.');
    }
  };

  // ✅ MÉTHODE SANS FICHIER (pour debug)
  const createWithoutFile = async () => {
    try {
      console.log('🔄 Création sans fichier...');
      
      const lessonData = {
        data: {
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          order_no: formData.order_no ? parseInt(formData.order_no) : null,
          is_published: formData.is_published,
          teacher: teacherId
        }
      };

      console.log('📤 Données sans fichier:', lessonData);

      const response = await axios.post('http://localhost:1337/api/lessons', lessonData);
      console.log('✅ Succès sans fichier:', response.data);
      
      setSuccess('✅ Cours créé sans fichier!');
      setTimeout(() => navigate('/dashboard-teacher'), 2000);

    } catch (error) {
      console.error('❌ Échec sans fichier:', error);
      if (error.response) {
        setError(`❌ Erreur relation: ${JSON.stringify(error.response.data)}`);
      }
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
                  Enseignant: {userData.first_name} {userData.last_name} | 
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
                <div className="mt-2 flex space-x-2">
                  <button 
                    onClick={tryAlternativeMethod}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Essayer autre méthode
                  </button>
                  <button 
                    onClick={createWithoutFile}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Créer sans fichier
                  </button>
                </div>
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