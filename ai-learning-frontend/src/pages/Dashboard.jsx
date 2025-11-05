import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import httpClient from '../api/httpClient';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('accueil');
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalPdfs, setTotalPdfs] = useState(0);
  const [totalSubjectsCount, setTotalSubjectsCount] = useState(0);

  // Récupérer les subjects depuis la base de données
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        // Déterminer l'endpoint selon le rôle (vérifier les deux noms possibles)
        const isTeacher = user?.role?.name === 'teacher' ;
        const endpoint = isTeacher
          ? '/users/me?populate[subjects][populate][lessons]=*'
          : '/subjects'; // Le populate est géré par le contrôleur backend

        const { data } = await httpClient.get(endpoint);

        // Adapter les données selon le rôle
        let subjectsData = [];
        if (isTeacher) {
          subjectsData = data.subjects || [];
          setSubjects(subjectsData);
        } else if (user?.role?.name === 'student') {
          subjectsData = data.data || [];
          setSubjects(subjectsData);
        } else {
          setSubjects([]);
        }

        // Calculer les statistiques depuis les données chargées
        const getSubjectInfo = (subject) => {
          return isTeacher ? subject : subject.attributes;
        };

        const getSubjectLessons = (subject) => {
          const info = getSubjectInfo(subject);
          return isTeacher ? (info.lessons || []) : (info.lessons?.data || []);
        };

        // Calculer le nombre total de leçons
        let lessonsCount = 0;
        let pdfsCount = 0;
        
        subjectsData.forEach((subject) => {
          const lessons = getSubjectLessons(subject);
          lessonsCount += lessons.length;
          
          // Compter les PDFs
          lessons.forEach((lesson) => {
            const lessonInfo = lesson.attributes || lesson;
            if (lessonInfo.pdf_url) {
              pdfsCount++;
            }
          });
        });

        setTotalPdfs(pdfsCount);

        // Récupérer les comptes depuis la base de données (optimisé - seulement les totaux)
        try {
          // 1. Compter les utilisateurs avec le rôle teacher (sans condition supplémentaire)
          const teacherCountResponse = await httpClient.get(
            '/users?filters[role][name]=teacher'
          );
          const teachersCount = teacherCountResponse.data?.meta?.pagination?.total || 0;
          setTotalTeachers(teachersCount);

          // 2. Compter tous les subjects (sans aucune condition)
          const subjectsCountResponse = await httpClient.get(
            '/subjects?pagination[pageSize]=1&pagination[page]=1'
          );
          const totalSubjectsCount = subjectsCountResponse.data?.meta?.pagination?.total || subjectsData.length;
          setTotalSubjectsCount(totalSubjectsCount);

          // 3. Compter tous les cours (lessons) sans condition
          const lessonsCountResponse = await httpClient.get(
            '/lessons?pagination[pageSize]=1&pagination[page]=1'
          );
          const totalLessonsCount = lessonsCountResponse.data?.meta?.pagination?.total || 0;
          setTotalLessons(totalLessonsCount);

          console.log('Statistiques complètes depuis la BD:', {
            teachers: teachersCount,
            subjects: totalSubjectsCount,
            lessons: totalLessonsCount,
            pdfs: pdfsCount
          });
        } catch (countErr) {
          console.error('Erreur lors du comptage des statistiques:', countErr);
          // En cas d'erreur, utiliser les valeurs calculées depuis les données chargées
          setTotalLessons(lessonsCount);
          if (!isTeacher) {
            // Fallback pour les professeurs depuis les subjects
            const uniqueTeachers = new Set();
            if (subjectsData && subjectsData.length > 0) {
              subjectsData.forEach(s => {
                const info = isTeacher ? s : (s.attributes || s);
                const authorId = info.author?.data?.id || info.author?.id;
                if (authorId) uniqueTeachers.add(authorId);
              });
            }
            setTotalTeachers(uniqueTeachers.size);
          } else {
            setTotalTeachers(1);
          }
        }
      } catch (err) {
        console.error('Erreur de récupération des subjects :', err);
        setError('Impossible de charger les matières. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculer les statistiques depuis les vraies données
  const isTeacher = user?.role?.name === 'teacher' ;
  // Utiliser le compte depuis la BD si disponible, sinon utiliser subjects.length
  const totalSubjects = totalSubjectsCount > 0 ? totalSubjectsCount : subjects.length;

  const userProgress = {
    completed: 0, // À calculer depuis les progresses si disponible
    total: totalLessons,
    percentage: totalLessons > 0 ? Math.round((0 / totalLessons) * 100) : 0
  };

  // Générer les catégories depuis les subjects
  const categories = [
    { name: 'Toutes les matières', icon: '📚', count: totalSubjects }
  ];

  const quickActions = [
    { title: 'Explorer les cours', icon: '📖', action: 'explorer' },
    { title: 'Voir mes matières', icon: '📚', action: 'subjects' },
    { title: 'Nouveau cours', icon: '➕', action: 'new' }
  ];

  // Fonction pour obtenir les informations d'un subject
  const getSubjectInfo = (subject) => {
    return isTeacher ? subject : subject.attributes;
  };

  // Fonction pour obtenir les leçons d'un subject
  const getSubjectLessons = (subject) => {
    const info = getSubjectInfo(subject);
    return isTeacher ? (info.lessons || []) : (info.lessons?.data || []);
  };

  // Fonction pour obtenir le nom de l'auteur
  const getAuthorName = (subject) => {
    const info = getSubjectInfo(subject);
    if (isTeacher) {
      return user.username;
    }
    return info.author?.data?.attributes?.username || info.author?.username || 'Inconnu';
  };

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
            Bonjour, {user?.username || 'Utilisateur'}! 👋
          </h2>
          <p className="text-gray-300">
            {isTeacher 
              ? 'Gérez vos matières et leçons' 
              : 'Continuez votre apprentissage avec l\'IA'}
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

        {/* Section Matières */}
        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              {isTeacher ? 'Mes Matières' : 'Matières Disponibles'}
            </h3>
            <Link 
              to="/subjects" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>

          {/* Chargement */}
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="w-6 h-6 border-t-2 border-blue-600 rounded-full animate-spin mr-2"></div>
              <p className="text-slate-600">Chargement des matières...</p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Liste des matières */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-600 mb-4">Aucune matière disponible pour le moment.</p>
                  {isTeacher && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Créer une matière
                    </button>
                  )}
                </div>
              ) : (
                subjects.map((subject) => {
                  const info = getSubjectInfo(subject);
                  const lessons = getSubjectLessons(subject);
                  const authorName = getAuthorName(subject);

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

                      {/* Liste des leçons avec PDF */}
                      {lessons && lessons.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Leçons :</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {lessons.slice(0, 3).map((lesson) => {
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
                            })}
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
                })
              )}
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
              <p className="text-sm text-slate-600">{totalLessons}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="text-3xl mb-2">📄</div>
              <h4 className="font-semibold text-slate-900 mb-1">Ressources PDF</h4>
              <p className="text-sm text-slate-600">{totalPdfs}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="text-3xl mb-2">👨‍🏫</div>
              <h4 className="font-semibold text-slate-900 mb-1">Professeur{isTeacher ? ' (Vous)' : 's'}</h4>
              <p className="text-sm text-slate-600">{totalTeachers}</p>
            </div>
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