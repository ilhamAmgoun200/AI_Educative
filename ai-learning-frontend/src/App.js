import React from 'react';
import { BrowserRouter   as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import CourseDetail from './pages/CourseDetail';
import ViewLesson from './pages/ViewLesson';
import RegistrationForm from './pages/inscription';
import DashboardStudent from './pages/DashboardStudent';
import DashboardTeacher from './pages/DashboardTeacher';
import ProtectedRoute from './pages/ProtectedRoute';
import LoginForm from './pages/LoginForm';
import CreateLesson from './pages/CreateLesson';
import EditLesson from './pages/EditLesson';
import MyLessons from './pages/MyLessons';
import LessonDetailsprof from './pages/LessonDetailsprof';
import ProfilePage from './pages/ProfilePage';
import AddExercise from './pages/AddExercise';
import EditExercise from './pages/EditExercise';
import ViewExercise from './pages/ViewExercise';  
import FavoritesPage from './pages/FavoritesPage';



function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>

            
            <Route path="/" element={<HomePage />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/view-lesson/:lessonId" element={<ViewLesson />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/loginn" element={<LoginForm />} />
            <Route path="/lesson/:documentId" element={<LessonDetailsprof />} />
            <Route path="/profile" element={<ProfilePage />} />

           



          <Route 
          path="/dashboard-student" 
          element={
            <ProtectedRoute requiredUserType="student">
              <DashboardStudent />
            </ProtectedRoute>
          } 
        />

        <Route 
  path="/favorites" 
  element={
    <ProtectedRoute requiredUserType="student">
      <FavoritesPage />
    </ProtectedRoute>
  } 
/>

        <Route path="/edit-lesson/:lessonId" element={<EditLesson />} />
        <Route path="/my-lessons" element={<MyLessons />} />
        <Route path="/add-exercise/:lessonId" element={<AddExercise />} />
        <Route path="/edit-exercise/:exerciseId" element={<EditExercise />} />
        <Route path="/view-exercise/:exerciseId" element={<ViewExercise />} />
        



        <Route 
          path="/dashboard-teacher" 
          element={
            <ProtectedRoute requiredUserType="teacher">
              <DashboardTeacher />
            </ProtectedRoute>
          } 
        />
        
        <Route 
  path="/create-lesson" 
  element={
    <ProtectedRoute requiredUserType="teacher">
      <CreateLesson />
    </ProtectedRoute>
  } 
/>

           
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
