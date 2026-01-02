import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';
import UserMenu from '../components/UserMenu';
import RecommendationsCard from '../components/RecommendationCard';
import ProgressCard from './ProgressCard';
import SubjectsSection from '../components/SubjectsSection';
import CoursesSection from '../components/CoursesSection';
import ExercisesBySubjectSection from '../components/ExercisesBySubjectSection';
import NotificationBell from "../components/NotificationBell";


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

        <ProgressCard />
<RecommendationsCard />

<SubjectsSection
  subjects={subjects}
  loading={loading}
  error={error}
  selectedTeacherId={selectedTeacherId}
  onSelectTeacher={fetchCourses}
/>

{selectedTeacherId && (
  <CoursesSection
    courses={courses}
    exercisesByCourse={exercisesByCourse}
    expandedExercises={expandedExercises}
    onToggleExercises={toggleExercises}
    onViewCourse={handleViewCourse}
    onViewExercise={handleViewExercise}
    getPdfUrl={getUserPdfUrl}
    loading={loading}
    error={error}
  />
)}

{selectedTeacherId && courses.length > 0 && (
  <ExercisesBySubjectSection
    courses={courses}
    exercisesByCourse={exercisesByCourse}
    onViewCourse={handleViewCourse}
    onViewExercise={handleViewExercise}
    getPdfUrl={getUserPdfUrl}
  />
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