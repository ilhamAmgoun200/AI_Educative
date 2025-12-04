import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';
import UserMenu from '../components/UserMenu';

// 👉 IMPORT DU COMPOSANT PROGRESSCARD
import ProgressCard from './ProgressCard';

const DashboardStudent = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
      return;
    }
    fetchSubjects();
  }, [isAuthenticated, navigate]);

  // 📌 Charger toutes les matières et professeurs
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

  // 📌 Charger les cours d’un prof
  const fetchCourses = async (teacherId) => {
    try {
      setLoading(true);
      setError('');
      setSelectedTeacherId(teacherId);
      const response = await axios.get(
        `${API_URL}/courses?teacher_id=${teacherId}&is_published=true&include_files=true`,
        { headers: getAuthHeaders() }
      );
      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Erreur chargement courses:', err);
      setError('Impossible de charger les cours');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/loginn');
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
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
            <UserMenu />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">

        {/* 🎯 PROGRESS CARD — AJOUTÉ ICI */}
        <ProgressCard />

        {/* 📚 SECTION MATIÈRES */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Matières Disponibles</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          ) : subjects.length === 0 ? (
            <p>Aucune matière disponible</p>
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

        {/* 📘 SECTION COURS */}
        {selectedTeacherId && (
          <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Cours Disponibles</h2>

            {loading ? (
              <p>Chargement...</p>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            ) : courses.length === 0 ? (
              <p>Aucun cours disponible pour cette matière</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 p-6 flex flex-col justify-between"
                    onClick={() => handleViewCourse(course.id)}
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
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2 hover:scale-105 transition-all">
                      {course.files && course.files.length > 0 && (
                        <p className="text-gray-600 text-sm">📄 PDF disponible</p>
                      )}
                      {course.video_url && (
                        <p className="text-gray-600 text-sm">🎥 Vidéo disponible</p>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCourse(course.id);
                        }}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                      >
                        👁️ Voir le cours
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        )}


      </main>
    </div>
  );
};

export default DashboardStudent;
