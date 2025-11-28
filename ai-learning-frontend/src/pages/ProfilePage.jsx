import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { getAuthHeaders } from "../utils/auth";
import { API_URL } from "../config/api";
import "./style/ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // États pour les données modifiables
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    cin: "",
    establishment: "",
    birth_date: "",
    branch: "",
    cne: "",
    subject: "",
    experience_years: 0
  });

  // Options pour les sélecteurs
  const branchOptions = ['SVT', 'PC', 'SMA'];
  const subjectOptions = ['Mathématiques', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

useEffect(() => {
  if (!isAuthenticated()) {
    navigate("/loginn");
    return;
  }
  
  if (user) {
    console.log('🔍 DONNÉES UTILISATEUR:', user);
    
    // Convertir subject_id en nom de matière
    let subjectName = '';
    if (user.subject_id) {
      subjectName = getSubjectNameById(user.subject_id);
      console.log('📚 Conversion matière:', user.subject_id, '→', subjectName);
    }
    
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      cin: user.cin || "",
      establishment: user.establishment || "",
      birth_date: user.birth_date || "",
      branch: user.branch || "",
      cne: user.cne || "",
      subject: subjectName, // Utiliser le nom converti
      experience_years: user.experience_years || 0
    });
  }
}, [isAuthenticated, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const role = user.role || user.userType || user.type;
    const endpoint = role === "student" 
      ? `${API_URL}/students/me`
      : `${API_URL}/teachers/me`;

    const submissionData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      cin: formData.cin,
      establishment: formData.establishment,
    };

    if (role === "student") {
      submissionData.birth_date = formData.birth_date;
      submissionData.branch = formData.branch;
      submissionData.cne = formData.cne;
    } else {
      // Convertir le nom de matière en subject_id pour l'envoi au backend
      submissionData.subject_id = getSubjectIdByName(formData.subject);
      submissionData.experience_years = parseInt(formData.experience_years) || 0;
      
      console.log('🔄 Envoi matière:', formData.subject, '→', submissionData.subject_id);
    }

    console.log('📦 Données envoyées:', submissionData);

    const response = await axios.put(endpoint, submissionData, {
      headers: getAuthHeaders()
    });

    setMessage("✅ Profil mis à jour avec succès!");
    
    // Mettre à jour le contexte avec les nouvelles données
    const updatedUser = {
      ...user,
      ...response.data.data,
      // Ajouter le nom de matière pour l'affichage immédiat
      subject_name: formData.subject
    };
    
    updateUser(updatedUser);
    setIsEditing(false);
    
  } catch (error) {
    console.error('Erreur:', error);
    if (error.response) {
      setMessage(`❌ Erreur ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else {
      setMessage('❌ Erreur: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
};

const getSubjectNameById = (subjectId) => {
  const subjectMap = {
    1: 'Mathématiques',
    2: 'Physics', 
    3: 'Chemistry',
    4: 'Biology',
    5: 'Computer Science'
  };
  return subjectMap[subjectId] || '';
};


const getSubjectIdByName = (subjectName) => {
  const subjectMap = {
    'Mathématiques': 1,
    'Physics': 2,
    'Chemistry': 3,
    'Biology': 4,
    'Computer Science': 5
  };
  return subjectMap[subjectName] || null;
};

const handleCancel = () => {
  if (user) {
    // Reconvertir subject_id en nom pour l'affichage
    let subjectName = '';
    if (user.subject_id) {
      subjectName = getSubjectNameById(user.subject_id);
    }
    
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      cin: user.cin || "",
      establishment: user.establishment || "",
      birth_date: user.birth_date || "",
      branch: user.branch || "",
      cne: user.cne || "",
      subject: subjectName,
      experience_years: user.experience_years || 0
    });
  }
  setIsEditing(false);
  setMessage("");
};

  const handleLogout = () => {
    logout();
    navigate("/loginn");
  };

  // Fonction pour retourner au dashboard selon le type d'utilisateur
  const handleBackToDashboard = () => {
    const role = user.role || user.userType || user.type;
    if (role === "student") {
      navigate("/dashboard-student");
    } else if (role === "teacher") {
      navigate("/dashboard-teacher");
    } else {
      // Fallback vers la page d'accueil si le rôle n'est pas déterminé
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-form">
          <h2>Chargement des informations...</h2>
        </div>
      </div>
    );
  }

  const role = user.role || user.userType || user.type || "N/A";
  const isStudent = role === "student";
  const isTeacher = role === "teacher";

  return (
    <div className="profile-container">
      <div className="profile-form">
        <div className="profile-header">
          <div className="header-top">
            <button
              onClick={handleBackToDashboard}
              className="back-btn"
              title="Retour au dashboard"
            >
              ← Retour
            </button>
            <h2>Mon Profil</h2>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="edit-btn"
            >
              ✏️ Modifier le profil
            </button>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Informations personnelles */}
          <div className="form-section">
            <h3>Informations personnelles</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Prénom :</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Nom :</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email :</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Téléphone :</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>CIN :</label>
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Établissement :</label>
              <input
                type="text"
                name="establishment"
                value={formData.establishment}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Informations spécifiques étudiants */}
          {isStudent && (
            <div className="form-section">
              <h3>Informations Académiques</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de naissance :</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label>CNE :</label>
                  <input
                    type="text"
                    name="cne"
                    value={formData.cne}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Filière :</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Sélectionnez une filière</option>
                  {branchOptions.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Informations spécifiques enseignants */}
          {isTeacher && (
            <div className="form-section">
              <h3>Informations Professionnelles</h3>

              <div className="form-group">
                <label>Matière enseignée :</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
                <label>Années d'expérience :</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  disabled={!isEditing}
                />
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="action-buttons">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? "Enregistrement..." : "💾 Sauvegarder modifications"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  ❌ Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBackToDashboard}
                  className="back-dashboard-btn"
                >
                  📊 Retour au Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;