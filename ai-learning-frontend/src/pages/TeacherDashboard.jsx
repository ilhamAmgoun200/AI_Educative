import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import { teacherService } from '../api/api';
import { getMe } from '../api/auth';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('tableau-de-bord');
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalLessons: 0,
    totalStudents: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔵 TeacherDashboard - User context:', user);
    console.log('🔵 TeacherDashboard - Auth loading:', authLoading);
    
    if (user && !authLoading) {
      console.log('🟢 User authentifié, chargement des données...');
      fetchTeacherData();
    } else if (!authLoading && !user) {
      console.log('🔴 Pas d\'utilisateur, redirection vers login');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchTeacherData = async () => {
    try {
      console.log('🟡 Début fetchTeacherData pour user:', user.id);
      setLoading(true);
      setError(null);
      
      // Vérifier qu'on a bien un user avec ID
      if (!user || !user.id) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer les subjects du professeur avec SON ID
      const subjectsResponse = await teacherService.getMySubjects(user.id);
      console.log('🟢 Réponse subjects:', subjectsResponse);

      // Formater les données
      let formattedSubjects = [];
      
      if (subjectsResponse && subjectsResponse.data) {
        formattedSubjects = subjectsResponse.data.map(subject => ({
          id: subject.id,
          subject_name: subject.attributes?.subject_name || 'Sans nom',
          description: subject.attributes?.description || 'Aucune description',
          level: subject.attributes?.level || 'Niveau non spécifié',
          lessons_count: subject.attributes?.lessons?.data?.length || 0,
          is_published: true,
          createdDate: subject.attributes?.createdAt || new Date().toISOString()
        }));
      }
      
      console.log('🟢 Subjects formatés:', formattedSubjects);
      setSubjects(formattedSubjects);

      // Calculer les statistiques
      const totalLessons = formattedSubjects.reduce((sum, subject) => sum + subject.lessons_count, 0);
      const totalSubjects = formattedSubjects.length;

      setStats({
        totalSubjects,
        totalLessons,
        totalStudents: 0,
        averageRating: 4.5
      });

    } catch (error) {
      console.error('🔴 Erreur dans fetchTeacherData:', error);
      setError('Erreur de chargement: ' + error.message);
      
      // Données de démo en cas d'erreur
      setSubjects([
        {
          id: 1,
          subject_name: 'Mathématiques Démo',
          description: 'Cours de démonstration',
          level: 'Débutant',
          lessons_count: 3,
          is_published: true,
          createdDate: new Date().toISOString()
        }
      ]);
      
      setStats({
        totalSubjects: 1,
        totalLessons: 3,
        totalStudents: 0,
        averageRating: 4.5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = () => {
    navigate('/teacher/add-subject');
  };

  const handleEditSubject = (subjectId) => {
    navigate(`/teacher/edit-subject/${subjectId}`);
  };

  const handleViewLessons = (subjectId) => {
    navigate(`/teacher/subject/${subjectId}/lessons`);
  };

  // Afficher le loading de l'auth context d'abord
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Vérification de l'authentification...</div>
      </div>
    );
  }

  // Vérifier que l'utilisateur est bien connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Non authentifié</div>
          <p className="text-gray-400">Veuillez vous connecter pour accéder à cette page.</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Vérifier que l'utilisateur est bien un professeur
  const userRole = user.role?.name || user.role?.type;
  if (userRole !== 'teacher') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Accès non autorisé</div>
          <p className="text-gray-400">Cette page est réservée aux professeurs.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Aller au dashboard étudiant
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Chargement de votre tableau de bord...</div>
          <div className="text-gray-400 text-sm">Récupération de vos données</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h1 className="text-xl font-bold text-white">LearnAI</h1>
              </div>

              <nav className="hidden md:flex space-x-6">
                {['tableau-de-bord', 'mes-matieres', 'ajouter-matiere', 'profil'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === 'ajouter-matiere') {
                        handleCreateSubject();
                      } else if (tab === 'profil') {
                        navigate('/teacher/profile');
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                    className={`capitalize px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {tab.split('-').join(' ')}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden md:block">
                Bonjour, {user?.username || 'Professeur'}
              </span>
              <button 
                onClick={() => navigate('/teacher/profile')}
                className="text-gray-300 hover:text-white"
              >
                👤 Profil
              </button>
              <button 
                onClick={logout}
                className="text-gray-300 hover:text-white"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <strong>Information:</strong> {error}
          </div>
        )}

        {/* En-tête du Tableau de Bord */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Tableau de Bord Enseignant
          </h2>
          <p className="text-gray-300">
            Bienvenue, {user?.username || 'Professeur'}! Gérez vos matières et leçons.
          </p>
        </div>

        {/* Cartes de Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Matières</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSubjects}</p>
              </div>
              <span className="text-2xl text-blue-600">📚</span>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Leçons</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLessons}</p>
              </div>
              <span className="text-2xl text-green-600">📝</span>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Étudiants</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
              </div>
              <span className="text-2xl text-orange-500">👥</span>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Note Moyenne</p>
                <p className="text-2xl font-bold text-slate-900">{stats.averageRating}/5</p>
              </div>
              <span className="text-2xl text-yellow-500">⭐</span>
            </div>
          </div>
        </div>

        {/* Matières du Professeur */}
        <div className="bg-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Mes Matières</h3>
            <button 
              onClick={handleCreateSubject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Nouvelle Matière
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">📚</span>
              <p className="text-slate-600 mb-4">Vous n'avez pas encore créé de matière</p>
              <button 
                onClick={handleCreateSubject}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Créer votre première matière
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📚</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{subject.subject_name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>{subject.level}</span>
                          <span>•</span>
                          <span>{subject.lessons_count} leçons</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            subject.is_published 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subject.is_published ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                        {subject.description && (
                          <p className="text-sm text-slate-500 mt-1">{subject.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleViewLessons(subject.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Voir leçons
                      </button>
                      <button 
                        onClick={() => handleEditSubject(subject.id)}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-around items-center h-16">
          {['tableau-de-bord', 'mes-matieres', 'ajouter-matiere', 'profil'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'ajouter-matiere') {
                  handleCreateSubject();
                } else if (tab === 'profil') {
                  navigate('/teacher/profile');
                } else {
                  setActiveTab(tab);
                }
              }}
              className={`flex flex-col items-center justify-center w-16 h-16 ${
                activeTab === tab ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">
                {tab === 'tableau-de-bord' && '📊'}
                {tab === 'mes-matieres' && '📚'}
                {tab === 'ajouter-matiere' && '➕'}
                {tab === 'profil' && '👤'}
              </span>
              <span className="text-xs mt-1 capitalize">{tab.split('-')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;