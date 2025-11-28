import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './style/RegistrationFoem.css';

const RegistrationForm = () => {
  const [userType, setUserType] = useState('student');
  const [subjects, setSubjects] = useState([]); // 🔥 Liste dynamique des subjects

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

  // 📌 Charger les subjects depuis Flask
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        setSubjects(res.data.data);
      } catch (error) {
        console.error('Erreur chargement subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

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
      const endpoint =
        userType === 'student'
          ? `${API_URL}/students`
          : `${API_URL}/teachers`;

      const submissionData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        cin: formData.cin,
        establishment: formData.establishment,
      };

      if (userType === 'student') {
        submissionData.birth_date = formData.birth_date;
        submissionData.branch = formData.branch;
        submissionData.cne = formData.cne;
      } else {
        submissionData.subject_id = parseInt(formData.subject_id);
        submissionData.experience_years = parseInt(formData.experience_years) || 0;
      }

      await axios.post(endpoint, submissionData);

      setMessage(`✅ ${userType === 'student' ? 'Étudiant' : 'Enseignant'} créé avec succès !`);
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur: ' + (error.response?.data?.error || ''));
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
      subject_id: '',
      experience_years: 0
    });
  };

  return (
    <div className="registration-container">
      <div className="registration-form">
        <h2>Créer un compte</h2>

        {/* 🔥 Boutons Étudiant / Enseignant */}
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

          {/* SECTION 1 — Informations personnelles */}
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

          {/* SECTION 2 — Spécifique Student */}
          {userType === 'student' && (
            <div className="form-section">
              <h3>Informations académiques</h3>

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
                  <option value="SVT">SVT</option>
                  <option value="PC">PC</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
            </div>
          )}

          {/* SECTION 3 — Spécifique Teacher */}
          {userType === 'teacher' && (
            <div className="form-section">
              <h3>Informations professionnelles</h3>

              <div className="form-group">
                <label>Matière enseignée *</label>
                <select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionnez une matière</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subject_name}
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
                />
              </div>
            </div>
          )}

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
            {loading ? 'Création...' : `Créer le compte`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
