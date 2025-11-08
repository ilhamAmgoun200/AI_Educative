import httpClient from './httpClient';

export const teacherService = {
  // Récupérer le profil du professeur
  getProfile: async (userId) => {
    try {
      const response = await httpClient.get(`/users/${userId}?populate=*`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil teacher:', error);
      throw error;
    }
  },

  // Mettre à jour le profil - ADAPTÉ À TA STRUCTURE
  updateProfile: async (profileData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await httpClient.put(`/users/${user.id}`, profileData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  },

  // Récupérer les subjects du professeur - NOUVEAU
  getMySubjects: async (teacherId) => {
    try {
      const response = await httpClient.get('/subjects', {
        params: {
          'filters[author][id][$eq]': teacherId,
          'populate': 'lessons'  // Pour compter les leçons
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération subjects:', error);
      throw error;
    }
  },

  // Créer un nouveau subject - NOUVEAU
  createSubject: async (subjectData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await httpClient.post('/subjects', {
        data: {
          ...subjectData,
          author: user.id
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création subject:', error);
      throw error;
    }
  },

  // Récupérer les leçons d'un subject - NOUVEAU
  getSubjectLessons: async (subjectId) => {
    try {
      const response = await httpClient.get('/lessons', {
        params: {
          'filters[subject][id][$eq]': subjectId,
          'populate': '*'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération leçons:', error);
      throw error;
    }
  },

  // Uploader un fichier PDF
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await httpClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload fichier:', error);
      throw error;
    }
  }
};

// Export pour éviter l'erreur ESLint
export const apiServices = {
  teacherService
};

export default apiServices;