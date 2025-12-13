import React, { useState, useEffect } from 'react';

const RegistrationForm = () => {
  const [userType, setUserType] = useState('student');
  const [subjects, setSubjects] = useState([
    { id: 1, subject_name: 'Mathématiques' },
    { id: 2, subject_name: 'Physique' },
    { id: 3, subject_name: 'Chimie' },
    { id: 4, subject_name: 'SVT' },
    { id: 5, subject_name: 'Économie' },
  ]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    cin: '',
    establishment: '',
    birth_date: '',
    branch: '',
    cne: '',
    subject_id: '',
    experience_years: 0
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    setTimeout(() => {
      setMessage(`✅ ${userType === 'student' ? 'Étudiant' : 'Enseignant'} créé avec succès !`);
      setLoading(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      cin: '',
      establishment: '',
      birth_date: '',
      branch: '',
      cne: '',
      subject_id: '',
      experience_years: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-blue-200">Rejoignez notre plateforme d'apprentissage</p>
        </div>

        {/* Sélecteur de type */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 inline-flex gap-2">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 ${
                userType === 'student'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🎓 Étudiant
            </button>
            <button
              type="button"
              onClick={() => setUserType('teacher')}
              className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 ${
                userType === 'teacher'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📚 Enseignant
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <div>
            {/* Informations personnelles */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-blue-600">
                Informations personnelles
              </h2>
              
              {/* Ligne 1: Prénom, Nom, CIN */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Jean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    CIN
                  </label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="AB123456"
                  />
                </div>
              </div>

              {/* Ligne 2: Email, Téléphone, Mot de passe */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="exemple@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Ligne 3: Établissement (pleine largeur) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Établissement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="establishment"
                  value={formData.establishment}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Nom de votre établissement"
                />
              </div>
            </div>

            {/* Informations académiques (Étudiant) */}
            {userType === 'student' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-green-600">
                  Informations académiques
                </h2>
                
                {/* Date de naissance, CNE, Filière */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      CNE
                    </label>
                    <input
                      type="text"
                      name="cne"
                      value={formData.cne}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      placeholder="N1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Filière <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="Economie & Gestion">Économie & Gestion</option>
                      <option value="Sciences Maths (SM)">Sciences Maths (SM)</option>
                      <option value="Sciences Physiques (PC)">Sciences Physiques (PC)</option>
                      <option value="Sciences SVT">Sciences SVT</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Informations professionnelles (Enseignant) */}
            {userType === 'teacher' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-orange-600">
                  Informations professionnelles
                </h2>
                
                {/* Matière, Années d'expérience, Champ vide */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Matière enseignée <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject_id"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                    >
                      <option value="">Sélectionnez...</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Années d'expérience
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div></div>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg font-medium ${
                message.includes('✅')
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                {message}
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>

            {/* Lien vers connexion */}
            <p className="text-center mt-6 text-slate-600">
              Déjà un compte ?{' '}
              <a href="/loginn" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;