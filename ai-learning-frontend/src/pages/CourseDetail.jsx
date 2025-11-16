import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/lessons/${id}?populate=*`
        );
        const data = await response.json();
        setLesson(data.data);
      } catch (error) {
        console.error("Erreur lors du chargement du cours :", error);
      }
    };

    fetchLesson();
  }, [id]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300 text-lg">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  const BASE_URL = "http://localhost:1337";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

       {/* Bouton Retour */}
    <div className="max-w-6xl mx-auto px-8 py-6">
      <button
        onClick={() => navigate(-1)} // Retour à la page précédente
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        ← Retour
      </button>
    </div> 
      {/* Header avec dégradé */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-blue-100 text-sm font-medium uppercase tracking-wide">
              Cours en ligne
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            {lesson.title}
          </h1>
          <p className="text-blue-50 text-xl max-w-3xl leading-relaxed">
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section Enseignant */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                    Votre Enseignant
                  </h2>
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-blue-400">
                      {lesson.teacher.first_name} {lesson.teacher.last_name}
                    </p>
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a 
                        href={`mailto:${lesson.teacher.email}`}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {lesson.teacher.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section PDF */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Supports de Cours</h2>
              </div>

              {lesson.course_pdf?.length > 0 ? (
                <div className="space-y-3">
                  {lesson.course_pdf.map((pdf, index) => (
                    <a
                      key={pdf.id}
                      href={`${BASE_URL}${pdf.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={pdf.name}              // force le téléchargement
                      className="group flex items-center justify-between p-5 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-700/30 hover:border-blue-500/50 rounded-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-red-500/10 p-3 rounded-lg group-hover:bg-red-500/20 transition-colors">
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {pdf.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Document {index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="text-sm font-medium">Télécharger</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-slate-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">Aucun fichier PDF disponible pour le moment</p>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Card Informations */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-8">
              <h3 className="text-lg font-bold text-white mb-6">Informations</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Date de création</p>
                    <p className="text-white text-sm font-medium">
                      {new Date(lesson.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Dernière mise à jour</p>
                    <p className="text-white text-sm font-medium">
                      {new Date(lesson.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">Ressources disponibles</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {lesson.course_pdf?.length || 0}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetails;