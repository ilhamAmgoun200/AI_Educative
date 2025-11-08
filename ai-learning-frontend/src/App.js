import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import CourseDetail from './pages/CourseDetail';
import Subjects from './pages/subjects';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherProfile from './pages/TeacherProfile';
import AddCourse from './pages/AddCourse';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
           
           <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
           <Route path="/teacher/profile" element={<TeacherProfile />} />
           <Route path="/teacher/add-course" element={<AddCourse />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
