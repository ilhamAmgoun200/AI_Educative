import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [courseData, setCourseData] = useState({
    title: '',
    category: '',
    description: '',
    level: 'débutant',
    duration: '',
    price: '0'
  });

  const categories = [
    'Mathématiques',
    'Physique',
    'SVT',
    'Programmation',
    'Histoire',
    'Géographie',
    'Chimie',
    'Philosophie',
    'Anglais',
    'Français'
  ];

  const levels = [
    { value: 'débutant', label: 'Débutant' },
    { value: 'intermédiaire', label: 'Intermédiaire' },
    { value: 'avancé', label: 'Avancé' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Veuillez sélectionner un fichier PDF');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici tu ajouteras la logique pour envoyer les données au backend
    console.log('Cours à créer:', { ...courseData, file: selectedFile });
    alert('Cours créé avec succès!');
    navigate('/teacher/dashboard');
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour au tableau de bord</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Créer un Nouveau Cours
          </h1>
          <p className="text-gray-300">
            Remplissez les informations de votre cours étape par étape
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm text-slate-600">
            <span>Informations de base</span>
            <span>Contenu du cours</span>
            <span>Finalisation</span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-100 rounded-xl p-6">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Informations de base</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Titre du cours *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Introduction à la programmation Python"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Niveau *
                  </label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez votre cours en détail..."
                    required
                  ></textarea>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Contenu du cours</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Durée estimée *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 15 heures, 8 semaines..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    Fichier du cours (PDF) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {selectedFile ? (
                      <div className="text-green-600">
                        <span className="text-2xl">✅</span>
                        <p className="font-medium mt-2">{selectedFile.name}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 text-sm mt-2"
                        >
                          Changer de fichier
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl">📄</span>
                        <p className="text-slate-600 mt-2">
                          Glissez-déposez votre fichier PDF ou
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg mt-3 cursor-pointer hover:bg-blue-700"
                        >
                          Parcourir les fichiers
                        </label>
                        <p className="text-sm text-slate-500 mt-2">
                          Formats acceptés: PDF (max. 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Récapitulatif</h2>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Détails du cours</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Titre:</span>
                      <span className="font-medium">{courseData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Catégorie:</span>
                      <span className="font-medium">{courseData.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Niveau:</span>
                      <span className="font-medium capitalize">{courseData.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Durée:</span>
                      <span className="font-medium">{courseData.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Fichier:</span>
                      <span className="font-medium">{selectedFile?.name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" required className="rounded border-gray-300" />
                    <span className="text-sm text-slate-700">
                      Je certifie que ce cours respecte les conditions d'utilisation de la plateforme
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-400 text-slate-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Précédent
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continuer
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Publier le cours
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;