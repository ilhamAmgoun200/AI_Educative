import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams(); // Pour récupérer l'ID dynamique plus tard
  const [activeTab, setActiveTab] = useState('description');

  // Données statiques du cours (sera remplacé par des données dynamiques)
  const courseData = {
    id: 1,
    title: 'Introduction à Python',
    instructor: {
      name: 'Dr. Sarah Chen',
      avatar: '👩‍🏫',
      bio: 'Docteure en Informatique avec 10 ans d\'expérience en enseignement',
      rating: 4.9,
      students: 2500
    },
    category: 'Programmation',
    level: 'Débutant',
    duration: '15 heures',
    students: 1250,
    rating: 4.8,
    reviews: 340,
    progress: 0, // 0 si pas commencé, sinon pourcentage
    description: `Ce cours vous initiera aux fondamentaux de la programmation Python. Vous apprendrez les concepts de base, la syntaxe, et comment construire vos premiers programmes.`,
    objectives: [
      'Comprendre les bases de la programmation Python',
      'Maîtriser les structures de contrôle',
      'Manipuler les structures de données',
      'Créer des fonctions réutilisables',
      'Gérer les erreurs et exceptions'
    ],
    chapters: [
      {
        id: 1,
        title: 'Introduction à Python',
        duration: '45 min',
        lessons: [
          { id: 1, title: 'Qu\'est-ce que Python ?', duration: '15 min', type: 'video', completed: false },
          { id: 2, title: 'Installation et configuration', duration: '20 min', type: 'video', completed: false },
          { id: 3, title: 'Premier programme', duration: '10 min', type: 'practice', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Variables et Types de Données',
        duration: '1h 30min',
        lessons: [
          { id: 4, title: 'Variables et assignation', duration: '20 min', type: 'video', completed: false },
          { id: 5, title: 'Types de données de base', duration: '25 min', type: 'video', completed: false },
          { id: 6, title: 'Exercices pratiques', duration: '45 min', type: 'practice', completed: false }
        ]
      },
      {
        id: 3,
        title: 'Structures de Contrôle',
        duration: '2h 15min',
        lessons: [
          { id: 7, title: 'Conditions if/else', duration: '30 min', type: 'video', completed: false },
          { id: 8, title: 'Boucles for et while', duration: '35 min', type: 'video', completed: false },
          { id: 9, title: 'Exercices avancés', duration: '70 min', type: 'practice', completed: false }
        ]
      }
    ],
    resources: [
      { type: 'pdf', title: 'Guide de référence Python', size: '2.4 MB' },
      { type: 'code', title: 'Exercices supplémentaires', size: '1.1 MB' },
      { type: 'cheatsheet', title: 'Aide-mémoire syntaxe', size: '0.8 MB' }
    ]
  };

  const handleStartCourse = () => {
    // Logique pour commencer le cours
    console.log('Début du cours:', courseData.title);
    // Naviguer vers la page de lecture
    navigate(`/course/${courseData.id}/chapter/1`);
  };

  const handleAskAI = () => {
    // Logique pour l'assistant IA
    console.log('Assistant IA demandé pour:', courseData.title);
    // Naviguer vers l'interface IA
    navigate(`/course/${courseData.id}/ai-assistant`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="text-gray-300 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-white font-semibold">LearnAI</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Contenu principal */}
          <div className="lg:col-span-2">
            {/* En-tête du cours */}
            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-3">
                    {courseData.category}
                  </span>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{courseData.title}</h1>
                  <p className="text-slate-600 mb-4">{courseData.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <span>⭐ {courseData.rating}</span>
                  <span>•</span>
                  <span>👤 {courseData.students} étudiants</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <span>📊</span>
                  <span>Niveau: {courseData.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏱️</span>
                  <span>Durée: {courseData.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📝</span>
                  <span>{courseData.reviews} avis</span>
                </div>
              </div>
            </div>

            {/* Navigation des onglets */}
            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <div className="flex space-x-4 border-b border-gray-300 pb-4 mb-6">
                {['description', 'contenu', 'ressources'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`capitalize px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab === 'description' && 'Description'}
                    {tab === 'contenu' && 'Contenu du cours'}
                    {tab === 'ressources' && 'Ressources'}
                  </button>
                ))}
              </div>

              {/* Contenu des onglets */}
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Objectifs d'apprentissage</h3>
                  <ul className="space-y-2 mb-6">
                    {courseData.objectives.map((objective, index) => (
                      <li key={index} className="flex items-center space-x-3 text-slate-700">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'contenu' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Plan du cours</h3>
                  <div className="space-y-4">
                    {courseData.chapters.map((chapter) => (
                      <div key={chapter.id} className="border border-gray-300 rounded-lg">
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-slate-900">{chapter.title}</h4>
                            <span className="text-sm text-slate-600">{chapter.duration}</span>
                          </div>
                          <div className="mt-3 space-y-2">
                            {chapter.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    lesson.type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                  }`}>
                                    {lesson.type === 'video' ? '▶' : '💻'}
                                  </span>
                                  <span className="text-slate-700">{lesson.title}</span>
                                </div>
                                <span className="text-sm text-slate-500">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ressources' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Ressources téléchargeables</h3>
                  <div className="space-y-3">
                    {courseData.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-600">
                            {resource.type === 'pdf' && '📄'}
                            {resource.type === 'code' && '💻'}
                            {resource.type === 'cheatsheet' && '📝'}
                          </span>
                          <div>
                            <div className="font-medium text-slate-900">{resource.title}</div>
                            <div className="text-sm text-slate-600">{resource.size}</div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colonne de droite - Informations complémentaires */}
          <div className="space-y-6">
            {/* Carte du professeur */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Enseignant</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-2xl">
                  {courseData.instructor.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{courseData.instructor.name}</h4>
                  <div className="flex items-center space-x-1 text-sm text-slate-600">
                    <span>⭐ {courseData.instructor.rating}</span>
                    <span>•</span>
                    <span>👤 {courseData.instructor.students}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600">{courseData.instructor.bio}</p>
            </div>

            {/* Actions */}
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="space-y-4">
                <button
                  onClick={handleStartCourse}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
                >
                  {courseData.progress > 0 ? 'Continuer le cours' : 'Commencer le cours'}
                </button>
                
                <button
                  onClick={handleAskAI}
                  className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>🤖</span>
                  <span>Assistant IA</span>
                </button>

                <div className="flex space-x-2">
                  <button className="flex-1 border border-gray-400 text-slate-700 hover:bg-gray-200 py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                    ⭐ Noter
                  </button>
                  <button className="flex-1 border border-gray-400 text-slate-700 hover:bg-gray-200 py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                    📤 Partager
                  </button>
                </div>
              </div>
            </div>

            {/* Informations rapides */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Niveau:</span>
                  <span className="font-medium text-slate-900">{courseData.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Durée:</span>
                  <span className="font-medium text-slate-900">{courseData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Étudiants:</span>
                  <span className="font-medium text-slate-900">{courseData.studants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Langue:</span>
                  <span className="font-medium text-slate-900">Français</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;