import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';
import UserMenu from '../components/UserMenu';
import LikeButton from '../components/LikeButton';
import RecommendationsCard from '../components/RecommendationCard';
import ProgressCard from './ProgressCard';
import NotificationBell from '../components/NotificationBell';

const DashboardStudent = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exercisesByCourse, setExercisesByCourse] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedExercises, setExpandedExercises] = useState({});

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
      return;
    }
    fetchSubjects();
  }, [isAuthenticated, navigate]);

  // Charger toutes les matières et professeurs
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/teachers`, { headers: getAuthHeaders() });
      setSubjects(response.data.data || []);
    } catch (err) {
      console.error('Erreur chargement matières:', err);
      setError('Impossible de charger les matières');
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours d'un professeur
  const fetchCourses = async (teacherId) => {
    try {
      setLoading(true);
      setError('');
      setSelectedTeacherId(teacherId);
      const response = await axios.get(
        `${API_URL}/courses?teacher_id=${teacherId}&is_published=true&include_files=true`,
        { headers: getAuthHeaders() }
      );
      const coursesData = response.data.data || [];
      setCourses(coursesData);
      
      // Pour chaque cours, charger les exercices associés
      const exercisesMap = {};
      for (const course of coursesData) {
        try {
          const exercisesResponse = await axios.get(
            `${API_URL}/exercises/course/${course.id}`,
            { headers: getAuthHeaders() }
          );
          exercisesMap[course.id] = exercisesResponse.data.data || [];
        } catch (err) {
          console.error(`Erreur chargement exercices cours ${course.id}:`, err);
          exercisesMap[course.id] = [];
        }
      }
      setExercisesByCourse(exercisesMap);
    } catch (err) {
      console.error('Erreur chargement courses:', err);
      setError('Impossible de charger les cours');
      setCourses([]);
      setExercisesByCourse({});
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewExercise = (exerciseId) => {
    navigate(`/view-exercise/${exerciseId}`);
  };

  const toggleExercises = (courseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const getUserPdfUrl = (fileName) => {
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}/uploads/exercises/${fileName}`;
  };

  const userName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'Utilisateur';

  return (
    <div className="min-h-screen bg-slate-900">
      
      {/* HEADER */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Espace Étudiant</h1>
          <div className="flex items-center space-x-4">
           <div className="text-right hidden md:block">
            <p className="text-white font-semibold">{userName}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
           </div>
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">

        {/* 🎯 PROGRESS CARD */}
        <ProgressCard />

        {/* 🤖 AI RECOMMENDATIONS */}
        <RecommendationsCard />

        {/* 📚 SECTION MATIÈRES */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Matières Disponibles</h2>

          {loading ? (
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          ) : subjects.length === 0 ? (
            <p className="text-gray-500">Aucune matière disponible</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border ${
                    selectedTeacherId === teacher.id ? 'border-blue-500 scale-105' : 'border-gray-200'
                  } p-6 flex flex-col justify-between`}
                  onClick={() => fetchCourses(teacher.id)}
                >
                  
                  {/* Matière */}
                  <div>
                    <h3 className="text-2xl font-bold text-blue-700 mb-2">
                      {teacher.subject?.subject_name || 'Matière inconnue'}
                    </h3>
                    {teacher.subject?.description && (
                      <p className="text-gray-600 mb-1">{teacher.subject.description}</p>
                    )}
                    {teacher.subject?.level && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                        Niveau: {teacher.subject.level}
                      </span>
                    )}
                  </div>

                  {/* Prof */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2 hover:scale-105 transition-all">
                    <p className="font-semibold text-gray-800">
                      Professeur: {teacher.first_name} {teacher.last_name}
                    </p>
                    {teacher.email && (
                      <p className="text-gray-600 text-sm">📧 {teacher.email}</p>
                    )}
                    {teacher.phone && (
                      <p className="text-gray-600 text-sm">📞 {teacher.phone}</p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📘 SECTION COURS ET EXERCICES */}
        {selectedTeacherId && (
          <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Cours Disponibles</h2>

            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            ) : courses.length === 0 ? (
              <p className="text-gray-500">Aucun cours disponible pour cette matière</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => {
                  const courseExercises = exercisesByCourse[course.id] || [];
                  const hasExercises = courseExercises.length > 0;
                  const isExpanded = expandedExercises[course.id];

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 p-6 flex flex-col justify-between"
                    >
                      {/* Info du cours */}
                      <div>
                        <h3 className="text-2xl font-bold text-blue-700 mb-2">{course.title}</h3>
                        {course.description && <p className="text-gray-600 mb-1">{course.description}</p>}
                        {course.level && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                            Niveau: {course.level}
                          </span>
                        )}
                      </div>

                      {/* Fichiers / vidéo */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2">
                        {course.files && course.files.length > 0 && (
                          <p className="text-gray-600 text-sm">📄 PDF disponible</p>
                        )}
                        {course.video_url && (
                          <p className="text-gray-600 text-sm">🎥 Vidéo disponible</p>
                        )}

                        {/* Bouton pour voir les exercices */}
                        {hasExercises && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExercises(course.id);
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-all"
                          >
                            <span className="font-semibold">
                              📚 {courseExercises.length} exercice{courseExercises.length > 1 ? 's' : ''}
                            </span>
                            <span className="text-lg">{isExpanded ? '▲' : '▼'}</span>
                          </button>
                        )}

                        {/* Section exercices (dépliée) */}
                        {isExpanded && hasExercises && (
                          <div className="mt-3 space-y-3 animate-fadeIn">
                            {courseExercises.map((exercise) => (
                              <div key={exercise.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                <h4 className="font-semibold text-gray-800 text-sm mb-1">{exercise.title}</h4>
                                {exercise.description && (
                                  <p className="text-gray-600 text-xs mb-2">{exercise.description}</p>
                                )}
                                <div className="flex gap-2">
                                  {exercise.pdf_file && (
                                    <a
                                      href={getUserPdfUrl(exercise.pdf_file)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                    >
                                      📄 Voir PDF
                                    </a>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewExercise(exercise.id);
                                    }}
                                    className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                                  >
                                    👁️ Voir détails
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-slate-600">
                            {course.created_at ? new Date(course.created_at).toLocaleDateString('fr-FR') : ''}
                          </span>
                          <LikeButton courseId={course.id} size="small" />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCourse(course.id);
                          }}
                          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold w-full transition-all"
                        >
                          👁️ Voir le cours
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 🎯 SECTION EXERCICES PAR MATIÈRE */}
        {selectedTeacherId && courses.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              📘 Exercices organisés par matière
            </h2>
            
            <div className="space-y-6">
              {courses.map((course) => {
                const courseExercises = exercisesByCourse[course.id] || [];
                if (courseExercises.length === 0) return null;

                return (
                  <div key={course.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-bold text-blue-700">{course.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {courseExercises.length} exercice{courseExercises.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courseExercises.map((exercise) => (
                        <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800">{exercise.title}</h4>
                            {exercise.pdf_file && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                PDF
                              </span>
                            )}
                          </div>
                          
                          {exercise.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{exercise.description}</p>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {exercise.pdf_file && (
                                <a
                                  href={getUserPdfUrl(exercise.pdf_file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                                >
                                  📄 Ouvrir
                                </a>
                              )}
                              <button
                                onClick={() => handleViewExercise(exercise.id)}
                                className="text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center gap-1"
                              >
                                👁️ Détails
                              </button>
                            </div>
                            <button
                              onClick={() => handleViewCourse(course.id)}
                              className="text-gray-500 hover:text-blue-600 text-xs font-medium"
                            >
                              Voir le cours →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Styles CSS pour l'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardStudent;