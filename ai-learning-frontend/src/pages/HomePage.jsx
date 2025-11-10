import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Données simulées pour les cours populaires
  const popularCourses = [
    {
      id: 1,
      title: 'Introduction à Python',
      description: 'Apprenez les bases de la programmation avec Python',
      category: 'Programmation',
      students: 1250,
      rating: 4.8,
      icon: '💻'
    },
    {
      id: 2,
      title: 'Algèbre Linéaire',
      description: 'Maîtrisez les concepts fondamentaux des matrices et vecteurs',
      category: 'Mathématiques',
      students: 890,
      rating: 4.6,
      icon: '📊'
    },
    {
      id: 3,
      title: 'Histoire Moderne',
      description: 'Découvrez les événements marquants du 20ème siècle',
      category: 'Histoire',
      students: 670,
      rating: 4.7,
      icon: '📚'
    },
    {
      id: 4,
      title: 'Physique Quantique',
      description: 'Introduction aux principes de la mécanique quantique',
      category: 'Sciences',
      students: 540,
      rating: 4.9,
      icon: '🔬'
    }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'Assistant IA',
      description: 'Explications personnalisées et simplifiées'
    },
    {
      icon: '🎧',
      title: 'Audio & Texte',
      description: 'Apprenez comme vous préférez'
    },
    {
      icon: '📱',
      title: 'Accessible',
      description: 'Disponible sur tous vos appareils'
    },
    {
      icon: '🚀',
      title: 'Progressif',
      description: 'Adapté à votre rythme d\'apprentissage'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Recherche:', searchQuery);
      // Ici tu ajouteras la logique de recherche
    }
  };

  const handleGetStarted = () => {
    navigate('/loginn');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <h1 className="text-2xl font-bold text-white">LearnAI</h1>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#courses" className="text-gray-300 hover:text-white transition-colors">Cours</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">À propos</a>
            </nav>

            {/* Boutons Connexion/Inscription */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/loginn')}
                className="text-gray-300 hover:text-white transition-colors hidden md:block"
              >
                Se connecter
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Apprenez avec l'
              <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                Intelligence Artificielle
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Découvrez une nouvelle façon d'apprendre. Des explications simplifiées, 
              des résumés intelligents et un assistant personnel pour chaque cours.
            </p>

            {/* Barre de Recherche */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un cours, un sujet..."
                  className="w-full px-6 py-4 bg-white rounded-xl shadow-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Rechercher
                </button>
              </form>
            </div>

            {/* Statistiques */}
            <div className="flex justify-center space-x-12 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-gray-400">Cours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-gray-400">Étudiants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-gray-400">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Pourquoi choisir LearnAI ?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une plateforme d'apprentissage révolutionnaire qui s'adapte à vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section id="courses" className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Cours Populaires
            </h2>
            <p className="text-lg text-gray-300">
              Découvrez les cours les plus appréciés par notre communauté
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCourses.map((course) => (
              <div key={course.id} className="bg-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{course.icon}</span>
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>👤 {course.students}</span>
                  <span>⭐ {course.rating}</span>
                </div>
                <button 
                  onClick={handleGetStarted}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Commencer
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à révolutionner votre apprentissage ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'étudiants qui apprennent plus intelligemment avec l'IA
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Commencer gratuitement
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-white font-semibold">LearnAI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 LearnAI. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;