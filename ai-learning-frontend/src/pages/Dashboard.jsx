import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import httpClient from '../api/httpClient';
import { Link } from 'react-router-dom';

// ============================================================================
// CONSTANTS
// ============================================================================

const NAV_TABS = ['accueil', 'cours', 'progression', 'profil'];

const QUICK_ACTIONS = [
  { title: 'Explorer les cours', icon: '📖', action: 'explorer' },
  { title: 'Voir mes matières', icon: '📚', action: 'subjects' },
  { title: 'Nouveau cours', icon: '➕', action: 'new' }
];

const BADGES = ['🥇', '🥈', '⭐', '🚀'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Vérifie si l'utilisateur est un professeur
 */
const isUserTeacher = (user) => {
  return user?.role?.name === 'teacher';
};

/**
 * Extrait les informations d'un subject selon le rôle
 */
const getSubjectInfo = (subject, isTeacher) => {
  return isTeacher ? subject : subject.attributes;
};

/**
 * Extrait les leçons d'un subject selon le rôle
 */
const getSubjectLessons = (subject, isTeacher) => {
  const info = getSubjectInfo(subject, isTeacher);
  return isTeacher ? (info.lessons || []) : (info.lessons?.data || []);
};

/**
 * Extrait le nom de l'auteur d'un subject
 */
const getAuthorName = (subject, isTeacher, currentUser) => {
  if (isTeacher) {
    return currentUser.username;
  }
  const info = getSubjectInfo(subject, isTeacher);
  return info.author?.data?.attributes?.username || info.author?.username || 'Inconnu';
};

/**
 * Extrait le total depuis la réponse paginée de Strapi
 */
const extractTotalFromPagination = (response) => {
  return response?.data?.meta?.pagination?.total || 0;
};

/**
 * Compte les PDFs dans une liste de leçons
 */
const countPdfs = (lessons) => {
  return lessons.reduce((count, lesson) => {
    const lessonInfo = lesson.attributes || lesson;
    return lessonInfo.pdf_url ? count + 1 : count;
  }, 0);
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Récupère les subjects selon le rôle de l'utilisateur
 */
const fetchSubjects = async (user) => {
  const isTeacher = isUserTeacher(user);
  const endpoint = isTeacher
    ? '/users/me?populate[subjects][populate][lessons]=*'
    : '/subjects';

  const { data } = await httpClient.get(endpoint);

  if (isTeacher) {
    return data.subjects || [];
  } else if (user?.role?.name === 'student') {
    return data.data || [];
  }
  return [];
};

/**
 * Compte les professeurs avec rôle teacher
 */
const fetchTeachersCount = async () => {
  try {
    // Tentative principale : utiliser le filtre avec pagination
    const response = await httpClient.get(
      '/users?filters[role][name][$eq]=teacher&pagination[pageSize]=1&pagination[withCount]=true'
    );

    const total = extractTotalFromPagination(response);
    if (total > 0) {
      return total;
    }

    // Fallback : récupérer tous les users et filtrer manuellement
    const allUsersResponse = await httpClient.get('/users?populate=role&pagination[pageSize]=100');
    const users = allUsersResponse.data?.data || allUsersResponse.data || [];
    
    return users.filter(user => {
      const userRole = user.role?.name || 
                      user.attributes?.role?.name || 
                      user.role?.attributes?.name || 
                      user.attributes?.role?.attributes?.name;
      return userRole === 'teacher';
    }).length;
  } catch (error) {
    console.error('Erreur lors du comptage des teachers:', error);
    return 0;
  }
};

/**
 * Récupère toutes les statistiques depuis la base de données
 */
const fetchStatistics = async (subjectsData, isTeacher) => {
  try {
    const [teachersCount, subjectsCount, lessonsCount] = await Promise.all([
      fetchTeachersCount(),
      httpClient.get('/subjects?pagination[pageSize]=1&pagination[page]=1'),
      httpClient.get('/lessons?pagination[pageSize]=1&pagination[page]=1')
    ]);

    return {
      teachers: teachersCount,
      subjects: extractTotalFromPagination(subjectsCount) || subjectsData.length,
      lessons: extractTotalFromPagination(lessonsCount),
    };
  } catch (error) {
    console.error('Erreur lors du comptage des statistiques:', error);
    
    // Fallback : calculer depuis les données locales
    const lessonsCount = subjectsData.reduce((count, subject) => {
      return count + getSubjectLessons(subject, isTeacher).length;
    }, 0);

    return {
      teachers: isTeacher ? 1 : new Set(subjectsData.map(s => {
        const info = getSubjectInfo(s, isTeacher);
        return info.author?.data?.id || info.author?.id;
      })).size,
      subjects: subjectsData.length,
      lessons: lessonsCount,
    };
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('accueil');
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState({
    teachers: 0,
    lessons: 0,
    pdfs: 0,
    subjects: 0,
  });

  const isTeacher = isUserTeacher(user);
  const totalSubjects = statistics.subjects > 0 ? statistics.subjects : subjects.length;

  // Récupérer les données
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        // Récupérer les subjects
        const subjectsData = await fetchSubjects(user);
        setSubjects(subjectsData);

        // Calculer les PDFs depuis les subjects chargés
        const pdfsCount = subjectsData.reduce((count, subject) => {
          const lessons = getSubjectLessons(subject, isTeacher);
          return count + countPdfs(lessons);
        }, 0);

        // Récupérer les statistiques
        const stats = await fetchStatistics(subjectsData, isTeacher);
        setStatistics({
          ...stats,
          pdfs: pdfsCount,
        });
      } catch (err) {
        console.error('Erreur de récupération des données :', err);
        setError('Impossible de charger les matières. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Calculer le progrès utilisateur
  const userProgress = {
    completed: 0,
    total: statistics.lessons,
    percentage: statistics.lessons > 0 ? Math.round((0 / statistics.lessons) * 100) : 0
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-10">
      <div className="w-6 h-6 border-t-2 border-blue-600 rounded-full animate-spin mr-2"></div>
      <p className="text-slate-600">Chargement des matières...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="col-span-full text-center py-8">
      <p className="text-slate-600 mb-4">Aucune matière disponible pour le moment.</p>
      {isTeacher && (
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Créer une matière
        </button>
      )}
    </div>
  );

  const renderLessonItem = (lesson) => {
    const lessonTitle = lesson.attributes?.title || lesson.title;
    const lessonPdf = lesson.attributes?.pdf_url || lesson.pdf_url;

    return (
      <div
        key={lesson.id}
        className="flex items-center justify-between text-xs text-slate-600 bg-gray-50 p-2 rounded"
      >
        <span className="flex items-center space-x-1">
          <span>📘</span>
          <span className="truncate">{lessonTitle}</span>
        </span>
        {lessonPdf && (
          <a
            href={lessonPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            📄
          </a>
        )}
      </div>
    );
  };

  const renderSubjectCard = (subject) => {
    const info = getSubjectInfo(subject, isTeacher);
    const lessons = getSubjectLessons(subject, isTeacher);
    const authorName = getAuthorName(subject, isTeacher, user);

    return (
      <div
        key={subject.id}
        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-2xl">📚</span>
          {info.level && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {info.level}
            </span>
          )}
        </div>

        <h4 className="font-semibold text-slate-900 mb-2">{info.subject_name}</h4>

        {info.description && (
          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
            {info.description}
          </p>
        )}

        <p className="text-xs text-slate-500 mb-3">
          👨‍🏫 {authorName} • {lessons?.length || 0} leçon{lessons?.length > 1 ? 's' : ''}
        </p>

        {lessons && lessons.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-700 mb-2">Leçons :</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {lessons.slice(0, 3).map(renderLessonItem)}
              {lessons.length > 3 && (
                <p className="text-xs text-slate-500 text-center">
                  +{lessons.length - 3} autre{lessons.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        <Link
          to={`/subjects/${subject.id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors block text-center"
        >
          {isTeacher ? 'Gérer' : 'Voir les détails'}
        </Link>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-white">LearnAI</h1>
            </div>

            <nav className="hidden md:flex space-x-8">
              {NAV_TABS.map((tab) => (
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
            Bonjour, {user?.username || 'Utilisateur'}! 👋
          </h2>
          <p className="text-gray-300">
            {isTeacher ? 'Gérez vos matières et leçons' : 'Continuez votre apprentissage avec l\'IA'}
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
              {QUICK_ACTIONS.map((action, index) => (
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
              {BADGES.map((badge, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-xl"
                >
                  {badge}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-3">4 badges débloqués</p>
          </div>
        </div>

        {/* Section Matières */}
        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              {isTeacher ? 'Mes Matières' : 'Matières Disponibles'}
            </h3>
            <Link to="/subjects" className="text-blue-600 hover:text-blue-700 font-medium">
              Voir tout →
            </Link>
          </div>

          {isLoading && renderLoadingState()}
          {error && renderErrorState()}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.length === 0 ? renderEmptyState() : subjects.map(renderSubjectCard)}
            </div>
          )}
        </div>

        {/* Section Statistiques */}
        <div className="bg-gray-100 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Statistiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-semibold text-slate-900 mb-1">Matières</h4>
              <p className="text-sm text-slate-600">{totalSubjects}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="text-3xl mb-2">📘</div>
              <h4 className="font-semibold text-slate-900 mb-1">Leçons</h4>
              <p className="text-sm text-slate-600">{statistics.lessons}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="text-3xl mb-2">📄</div>
              <h4 className="font-semibold text-slate-900 mb-1">Ressources PDF</h4>
              <p className="text-sm text-slate-600">{statistics.pdfs}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="text-3xl mb-2">👨‍🏫</div>
              <h4 className="font-semibold text-slate-900 mb-1">
                Professeur{isTeacher ? ' (Vous)' : 's'}
              </h4>
              <p className="text-sm text-slate-600">{statistics.teachers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-around items-center h-16">
          {NAV_TABS.map((tab) => (
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
