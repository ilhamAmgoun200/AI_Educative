import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/loginn" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;