import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './style/LoginForm.css';

const LoginForm = () => {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, userType);
      
      console.log('✅ Login réussi, résultat:', result);
      
      // Redirection immédiate vers le dashboard approprié
      const finalUserType = result.userType || userType;
      console.log('🔄 Redirection vers:', finalUserType === 'student' ? '/dashboard-student' : '/dashboard-teacher');
      
      // Utiliser window.location.href pour forcer un rechargement complet et éviter les problèmes de contexte
      if (finalUserType === 'student') {
        window.location.href = '/dashboard-student';
      } else {
        window.location.href = '/dashboard-teacher';
      }
    } catch (error) {
      setError(error.message || 'Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-gray-100 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Connexion</h2>
          <p className="text-slate-600 mt-2">Accédez à votre espace</p>
        </div>

        {/* Sélecteur de type d'utilisateur */}
        <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-md transition-all ${
              userType === 'student' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() => setUserType('student')}
          >
            🎓 Étudiant
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-md transition-all ${
              userType === 'teacher' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() => setUserType('teacher')}
          >
            📚 Enseignant
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Votre mot de passe"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-6">
          Pas de compte ?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;