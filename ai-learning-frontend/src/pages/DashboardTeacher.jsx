import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardTeacher = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    navigate('/loginn');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Espace Enseignant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">
                  {userData.first_name} {userData.last_name}
                </p>
                <p className="text-slate-400 text-sm">{userData.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
   <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
     onClick={() => navigate('/create-lesson')}>
  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
    <span className="text-white text-xl">📖</span>
  </div>
  <h3 className="text-xl font-bold text-slate-900 mb-2">Créer un Cours</h3>
  <p className="text-slate-600">Publiez de nouveaux contenus pédagogiques</p>
</div>

          {/* Card 2 */}
          <div className="bg-gray-100 p-6 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">👨‍🏫</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mes Étudiants</h3>
            <p className="text-slate-600">Gérez votre liste d'étudiants</p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-100 p-6 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">📈</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Statistiques</h3>
            <p className="text-slate-600">Analyser l'engagement des étudiants</p>
          </div>
        </div>

        {/* Informations enseignant */}
        <div className="mt-8 bg-gray-100 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Mes Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-600"><strong>Matière:</strong> {userData.subject || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>Établissement:</strong> {userData.establishment || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-slate-600"><strong>Expérience:</strong> {userData.experience_years || '0'} ans</p>
              <p className="text-slate-600"><strong>CIN:</strong> {userData.cin || 'Non renseigné'}</p>
              <p className="text-slate-600"><strong>Téléphone:</strong> {userData.phone || 'Non renseigné'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardTeacher;