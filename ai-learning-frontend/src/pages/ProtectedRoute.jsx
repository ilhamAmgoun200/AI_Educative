import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/loginn" replace />;
  }

  // Vérifier le type d'utilisateur si requis
  if (requiredUserType) {
    // Le type peut être dans user.type (depuis to_dict), user.userType, ou localStorage
    const userType = user?.type || user?.userType || localStorage.getItem('userType');
    
    console.log('🔍 ProtectedRoute - requiredUserType:', requiredUserType);
    console.log('🔍 ProtectedRoute - userType détecté:', userType);
    console.log('🔍 ProtectedRoute - user:', user);
    
    if (!userType || userType !== requiredUserType) {
      // Rediriger vers le dashboard approprié au lieu de /unauthorized
      if (userType === 'teacher') {
        console.log('🔄 Redirection vers dashboard-teacher');
        return <Navigate to="/dashboard-teacher" replace />;
      } else if (userType === 'student') {
        console.log('🔄 Redirection vers dashboard-student');
        return <Navigate to="/dashboard-student" replace />;
      } else {
        console.log('🔄 Redirection vers login (type inconnu)');
        return <Navigate to="/loginn" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;