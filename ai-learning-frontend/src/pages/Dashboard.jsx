import React, { useState } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('accueil');

  // Données simulées
  const userProgress = {
    completed: 15,
    total: 20,
    percentage: 75
  };

  const recentCourses = [
    { id: 1, title: 'Introduction à Python', progress: 75, category: 'Programmation' },
    { id: 2, title: 'Algèbre Linéaire', progress: 50, category: 'Mathématiques' },
    { id: 3, title: 'Histoire Moderne', progress: 30, category: 'Histoire' }
  ];

  const categories = [
    { name: 'Programmation', icon: '💻', count: 8 },
    { name: 'Mathématiques', icon: '📊', count: 5 },
    { name: 'Sciences', icon: '🔬', count: 4 },
    { name: 'Histoire', icon: '📚', count: 3 }
  ];

  const quickActions = [
    { title: 'Continuer à lire', icon: '📖', course: 'Introduction à Python' },
    { title: 'Réviser', icon: '🔄', course: 'Algèbre Linéaire' },
    { title: 'Nouveau cours', icon: '➕', action: 'explorer' }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-white">LearnAI</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {['accueil', 'cours', 'progression', 'profil'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Bienvenue */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Bonjour, Mohamed! 👋
          </h2>
          <p className="text-gray-300">
            Continuez votre apprentissage avec l'IA
          </p>
        </div>

        {/* Cartes de Progrès */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Carte Progrès Général */}
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Progrès Général</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Progression</span>
                <span>{userProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userProgress.percentage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {userProgress.completed}/{userProgress.total} cours complétés
            </p>
          </div>

          {/* Carte Actions Rapides */}
          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions Rapides</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <span className="text-xl">{action.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900">{action.title}</div>
                    {action.course && (
                      <div className="text-xs text-slate-600">{action.course}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Carte Badges */}
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Badges</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="flex space-x-3">
              {['🥇', '🥈', '⭐', '🚀'].map((badge, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-xl"
                >
                  {badge}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-3">
              4 badges débloqués
            </p>
          </div>
        </div>

        {/* Section Cours Récents */}
        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Cours Récents</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Voir tout →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">
                    {course.category === 'Programmation' && '💻'}
                    {course.category === 'Mathématiques' && '📊'}
                    {course.category === 'Histoire' && '📚'}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{course.title}</h4>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Progression</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Continuer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section Catégories */}
        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Catégories</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="font-semibold text-slate-900 mb-1">{category.name}</h4>
                <p className="text-sm text-slate-600">{category.count} cours</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-around items-center h-16">
          {['accueil', 'cours', 'progression', 'profil'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center w-16 h-16 ${
                activeTab === tab ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">
                {tab === 'accueil' && '🏠'}
                {tab === 'cours' && '📚'}
                {tab === 'progression' && '📈'}
                {tab === 'profil' && '👤'}
              </span>
              <span className="text-xs mt-1 capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;