import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [lessons, setLessons] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Récupérer tous les cours publiés depuis Flask
        const response = await axios.get(`${API_URL}/courses?is_published=true&include_files=true`);
        setLessons(response.data.data || []); 
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement cours:", error);
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const features = [
    { icon: "🤖", title: "Assistant IA", description: "Explications personnalisées et simplifiées" },
    { icon: "🎧", title: "Audio & Texte", description: "Apprenez comme vous préférez" },
    { icon: "📱", title: "Accessible", description: "Disponible sur tous vos appareils" },
    { icon: "🚀", title: "Progressif", description: "Adapté à votre rythme d'apprentissage" }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) console.log("Recherche:", searchQuery);
  };

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = lessons.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(lessons.length / coursesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* --- HEADER --- */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <h1 className="text-2xl font-bold text-white">LearnAI</h1>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200">Fonctionnalités</a>
              <a href="#courses" className="text-gray-400 hover:text-white transition-colors duration-200">Cours</a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors duration-200">À propos</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/loginn'}
                className="text-gray-400 hover:text-white hidden md:block transition-colors duration-200"
              >
                Se connecter
              </button>
              <button 
                onClick={() => window.location.href = '/loginn'}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- HERO --- */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto text-center px-4 relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <span className="text-orange-400 text-sm font-medium">✨ Plateforme d'apprentissage intelligent</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Apprenez avec l'
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Intelligence Artificielle
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            Découvrez une nouvelle façon d'apprendre, personnalisée et adaptée à votre rythme
          </p>

          <div className="max-w-3xl mx-auto mb-12 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="pl-6 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Rechercher un cours, un sujet..."
                className="w-full px-4 py-5 text-lg bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
              <button 
                onClick={handleSearch}
                className="m-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-300"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Pourquoi LearnAI ?</h2>
            <p className="text-gray-400 text-lg">Des fonctionnalités pensées pour votre réussite</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500/50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-gray-400">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COURS STRAPI --- */}
      <section id="courses" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cours Disponibles</h2>
            <p className="text-gray-400 text-lg">Explorez notre catalogue de cours enrichi par l'IA</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-lg">Chargement des cours...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentCourses.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-blue-500"></div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                            {lesson.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {lesson.description?.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {lesson.files && lesson.files.length > 0 && (
                        <div className="mb-4">
                          <a 
                            href={`${API_URL.replace('/api', '')}/uploads/courses/${lesson.files[0].file_name}`} 
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Voir le support PDF
                          </a>
                        </div>
                      )}

                      <button
                        onClick={() => window.location.href = `/course/${lesson.id}`}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium shadow-lg transition-all duration-300 group-hover:shadow-blue-500/50"
                      >
                        Commencer le cours
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === index + 1
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">© 2025 LearnAI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;