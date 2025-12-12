import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import Fuse from "fuse.js";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  const [allLessons, setAllLessons] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fuse = new Fuse(lessons.length > 0 ? lessons : allLessons, {
  keys: ["title", "description"],
  threshold: 0.35
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get(`${API_URL}/courses?is_published=true&include_files=true`);
        setLessons(response.data.data || []); 
        setAllLessons(response.data.data || []);
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

  const handleSearch = (value) => {
     const query = value.trim().toLowerCase();
     setSearchQuery(value);
   
     // Si la recherche est vide → afficher tous les cours
     if (!query) {
       setLessons(allLessons);
       return;
     }
   
     // Fuzzy search
     const fuse = new Fuse(allLessons, {
       keys: ["title", "description"],
       threshold: 0.35
     });
   
     const results = fuse.search(query);
     setLessons(results.map(r => r.item));
  };


  

  // Fonction pour réinitialiser la recherche
  const resetSearch = () => {
    setSearchQuery('');
    setLessons(allLessons);
    setCurrentPage(1);
  };
  const highlightText = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark class='bg-orange-500/40 text-white px-1 rounded-md'>$1</mark>");
 };
 const scrollToCourses = () => {
  const element = document.getElementById("courses");
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <h1 className="text-2xl font-bold text-white">LearnAI</h1>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200 font-medium">Fonctionnalités</a>
              <a href="#courses" className="text-gray-400 hover:text-white transition-colors duration-200 font-medium">Cours</a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors duration-200 font-medium">À propos</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/loginn'}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
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
                onChange={(e) => handleSearch(e.target.value)}
                onKeyPress={(e) => {if (e.key === 'Enter') {handleSearch(searchQuery);scrollToCourses(); }}}
                placeholder="Rechercher un cours, un sujet..."
                className="w-full px-4 py-5 text-lg bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={resetSearch}
                  className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Effacer la recherche"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button 
                onClick={() => {handleSearch(searchQuery);
                  scrollToCourses();}}
                className="m-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
              >
                Rechercher
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Découvrir les cours 🚀
            </button>
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

      {/* --- COURS --- */}
      <section id="courses" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cours Disponibles</h2>
            <p className="text-gray-400 text-lg">Explorez notre catalogue de cours enrichi par l'IA</p>
            {searchQuery && (
              <div className="mt-4 inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
                <span className="text-gray-400">Recherche:</span>
                <span className="text-orange-400 font-semibold">"{searchQuery}"</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{lessons.length} résultat{lessons.length > 1 ? 's' : ''}</span>
                <button
                  onClick={resetSearch}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Effacer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-lg">Chargement des cours...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-400 text-lg">Aucun cours disponible pour le moment</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentCourses.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10"
                  >
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-blue-500"></div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors" dangerouslySetInnerHTML={{    __html: highlightText(lesson.title, searchQuery)}}></h3>
                          <p 
                            className="text-gray-400 text-sm line-clamp-3 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(lesson.description || "", searchQuery)
                            }}
                          ></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        {lesson.files && lesson.files.length > 0 && (
                          <div className="flex items-center text-blue-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {lesson.files.length} PDF
                          </div>
                        )}
                        {lesson.video_url && (
                          <div className="flex items-center text-green-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Vidéo
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => window.location.href = `/loginn`}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 group-hover:shadow-blue-500/50 transform hover:scale-105"
                      >
                        Commencer le cours →
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
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                        currentPage === index + 1
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
                          : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
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

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">À propos de LearnAI</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            LearnAI est une plateforme innovante qui combine l'intelligence artificielle et l'éducation pour offrir une expérience d'apprentissage unique. Notre mission est de rendre l'éducation accessible à tous, partout et à tout moment.
          </p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">{lessons.length}+</div>
              <div className="text-gray-400">Cours disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">24/7</div>
              <div className="text-gray-400">Support IA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
              <div className="text-gray-400">Gratuit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Professional */}
      <footer className="relative border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-20">
        {/* Top Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <h3 className="text-2xl font-bold text-white">LearnAI</h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Révolutionnez votre apprentissage avec l'intelligence artificielle. Une éducation accessible, personnalisée et efficace.
              </p>
              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                Plateforme
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></span>
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#courses" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    Catalogue de cours
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    À propos
                  </a>
                </li>
                <li>
                  <a href="/loginn" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    Commencer
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                Ressources
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></span>
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    Tutoriels
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                Contact
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></span>
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <a href="mailto:contact@learnai.com" className="text-white hover:text-orange-400 transition-colors">contact@learnai.com</a>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Support</p>
                    <a href="tel:+33123456789" className="text-white hover:text-orange-400 transition-colors">+33 1 23 45 67 89</a>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Adresse</p>
                    <p className="text-white">Paris, France</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2025 <span className="text-white font-semibold">LearnAI</span>. Tous droits réservés.
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Politique de confidentialité</a>
                <span className="text-slate-700">•</span>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Conditions d'utilisation</a>
                <span className="text-slate-700">•</span>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Mentions légales</a>
                <span className="text-slate-700">•</span>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;