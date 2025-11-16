import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LessonDetails  from './pages/CourseDetail';

import RegistrationForm from './pages/inscription';
import DashboardStudent from './pages/DashboardStudent';
import DashboardTeacher from './pages/DashboardTeacher';
import ProtectedRoute from './pages/ProtectedRoute';
import LoginForm from './pages/LoginForm';
import CreateLesson from './pages/CreateLesson';
import EditLesson from './pages/EditLesson';
import MyLessons from './pages/MyLessons';
import LessonDetailsprof from './pages/LessonDetailsprof';



function App() {
  return (
    <Router>
        <div className="App">
          <Routes>

            
            <Route path="/" element={<HomePage />} />
           
            <Route path="/lesson/:id" element={<LessonDetails  />} />

           
           <Route path="/register" element={<RegistrationForm />} />
           <Route path="/loginn" element={<LoginForm />} />
           <Route path="/lesson/:documentId" element={<LessonDetailsprof />} />
           



          <Route 
          path="/dashboard-student" 
          element={
            <ProtectedRoute requiredUserType="student">
              <DashboardStudent />
            </ProtectedRoute>
          } 
        />
        <Route path="/edit-lesson/:lessonId" element={<EditLesson />} />
        <Route path="/my-lessons" element={<MyLessons />} />


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
      
    </Router>
  );
}

export default App;
