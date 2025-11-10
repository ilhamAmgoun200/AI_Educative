import React, { useState } from 'react';
import axios from 'axios';
import './style/RegistrationFoem.css';

const RegistrationForm = () => {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    // Champs communs
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    cin: '',
    establishment: '',
    
    // Champs spécifiques student
    birth_date: '',
    branch: '',
    cne: '',
    
    // Champs spécifiques teacher
    subject: '',
    experience_years: 0
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Enumérations corrigées selon vos spécifications
  const branchOptions = ['SVT', 'PC', 'SMA'];
  const subjectOptions = ['math', 'physique', 'svt', 'arabe', 'french', 'philosophy', 'english'];

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
    setMessage('');

    try {
      const apiUrl = userType === 'student' 
        ? 'http://localhost:1337/api/students'
        : 'http://localhost:1337/api/teachers';

      // ✅ Structure correcte pour Strapi v4
      const submissionData = {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          cin: formData.cin,
          establishment: formData.establishment,
          is_active: true,
          // Champs conditionnels selon le type
          ...(userType === 'student' && {
            birth_date: formData.birth_date,
            branch: formData.branch,
            cne: formData.cne
          }),
          ...(userType === 'teacher' && {
            subject: formData.subject,
            experience_years: parseInt(formData.experience_years) || 0
          })
        }
      };

      console.log('Données envoyées:', submissionData);

      const response = await axios.post(apiUrl, submissionData);
      
      setMessage(`✅ ${userType === 'student' ? 'Étudiant' : 'Enseignant'} créé avec succès!`);
      resetForm();
      
    } catch (error) {
      console.error('Erreur détaillée:', error);
      
      if (error.response) {
        setMessage(`❌ Erreur ${error.response.status}: ${JSON.stringify(error.response.data.error || error.response.data)}`);
      } else if (error.request) {
        setMessage('❌ Pas de réponse du serveur. Vérifiez que Strapi est démarré.');
      } else {
        setMessage('❌ Erreur: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
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
      subject: '',
      experience_years: 0
    });
  };

  return (
    <div className="registration-container">
      <div className="registration-form">
        <h2>Créer un compte</h2>
        
        <div className="user-type-selector">
          <button
            type="button"
            className={`type-btn ${userType === 'student' ? 'active' : ''}`}
            onClick={() => setUserType('student')}
          >
            🎓 Étudiant
          </button>
          <button
            type="button"
            className={`type-btn ${userType === 'teacher' ? 'active' : ''}`}
            onClick={() => setUserType('teacher')}
          >
            📚 Enseignant
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Informations personnelles</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>CIN</label>
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Établissement *</label>
              <input
                type="text"
                name="establishment"
                value={formData.establishment}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Champs spécifiques */}
          <div className="form-section">
            <h3>Informations {userType === 'student' ? 'académiques' : 'professionnelles'}</h3>
            
            {userType === 'student' ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date de naissance</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>CNE</label>
                    <input
                      type="text"
                      name="cne"
                      value={formData.cne}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Filière *</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez une filière</option>
                    {branchOptions.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Matière enseignée *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez une matière</option>
                    {subjectOptions.map(subject => (
                      <option key={subject} value={subject}>
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Années d'expérience</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                  />
                </div>
              </>
            )}
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Création en cours...' : `Créer le compte ${userType === 'student' ? 'Étudiant' : 'Enseignant'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;