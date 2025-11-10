import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import CourseDetail from './pages/CourseDetail';

import RegistrationForm from './pages/inscription';
import DashboardStudent from './pages/DashboardStudent';
import DashboardTeacher from './pages/DashboardTeacher';
import ProtectedRoute from './pages/ProtectedRoute';
import LoginForm from './pages/LoginForm';
import CreateLesson from './pages/CreateLesson';

function App() {
  return (
    <Router>
        <div className="App">
          <Routes>

            
            <Route path="/" element={<HomePage />} />
           
            <Route path="/course/:courseId" element={<CourseDetail />} />
           
           <Route path="/register" element={<RegistrationForm />} />
           <Route path="/loginn" element={<LoginForm />} />


          <Route 
          path="/dashboard-student" 
          element={
            <ProtectedRoute requiredUserType="student">
              <DashboardStudent />
            </ProtectedRoute>
          } 
        />
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
