/**
 * Utilitaires pour gérer les tokens d'authentification
 * Gère deux systèmes : authToken (LoginForm) et jwt (API Strapi)
 */

import axios from 'axios';

/**
 * Récupère le JWT réel de Strapi depuis plusieurs sources
 * @returns {string|null} Le JWT ou null si non trouvé
 */
export const getJWT = () => {
  console.log('🔍 getJWT() - Recherche du token JWT...');
  
  // ✅ MÉTHODE 1: Depuis 'jwt' (utilisé par l'API Strapi /auth/local)
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    // Vérifier que c'est un vrai JWT (3 parties séparées par des points)
    const parts = jwt.split('.');
    if (parts.length === 3) {
      console.log('✅ JWT valide trouvé dans localStorage.getItem("jwt")');
      return jwt;
    } else {
      console.warn('⚠️ "jwt" trouvé mais ne semble pas être un JWT valide (format incorrect)');
    }
  }

  // ✅ MÉTHODE 2: Utiliser getToken() de localStorage.js (même clé "jwt")
  // Note: getToken() de localStorage.js utilise aussi la clé "jwt"
  // Donc si jwt n'a pas été trouvé ci-dessus, getToken() ne le trouvera pas non plus
  // Mais on vérifie quand même au cas où
  try {
    // Import dynamique pour éviter les dépendances circulaires
    const localStorageModule = require('./localStorage');
    if (localStorageModule && localStorageModule.getToken) {
      const token = localStorageModule.getToken();
      if (token && token !== jwt) { // Si différent de ce qu'on a déjà vérifié
        const parts = token.split('.');
        if (parts.length === 3) {
          console.log('✅ JWT valide trouvé via getToken() de localStorage.js');
          return token;
        }
      }
    }
  } catch (error) {
    // Ignorer silencieusement si le module n'est pas disponible
  }

  // ✅ MÉTHODE 3: Vérifier authToken (mais ce n'est généralement pas un vrai JWT)
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    // Vérifier si authToken est un vrai JWT (3 parties)
    const parts = authToken.split('.');
    if (parts.length === 3) {
      console.log('✅ JWT trouvé dans authToken (format JWT valide)');
      return authToken;
    } else {
      console.warn('⚠️ authToken trouvé mais ce n\'est pas un vrai JWT (format base64)');
      try {
        const decoded = JSON.parse(atob(authToken));
        console.log('📋 authToken contient:', Object.keys(decoded));
        console.log('⚠️ authToken est un token personnalisé, pas un JWT Strapi');
      } catch (e) {
        console.error('❌ Erreur décodage authToken:', e);
      }
    }
  }

  console.error('❌ Aucun JWT valide trouvé dans localStorage');
  console.log('📋 État localStorage:', {
    jwt: localStorage.getItem('jwt') ? 'Présent' : 'Absent',
    authToken: localStorage.getItem('authToken') ? 'Présent' : 'Absent',
    user: localStorage.getItem('user') ? 'Présent' : 'Absent'
  });

  return null;
};

/**
 * Récupère l'ID du teacher/user depuis plusieurs sources
 * @returns {number|null} L'ID du teacher/user ou null
 */
export const getTeacherId = () => {
  console.log('🔍 getTeacherId() - Recherche de l\'ID TEACHER...');
  
  // ✅ PRIORITÉ 1: Depuis authToken (contient l'ID du TEACHER)
  // authToken est créé avec l'ID du teacher, donc c'est la source la plus fiable
  try {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      console.log('  📋 authToken trouvé, décodage...');
      const decodedToken = JSON.parse(atob(authToken));
      console.log('  📋 authToken décodé:', decodedToken);
      
      if (decodedToken && decodedToken.id) {
        const id = typeof decodedToken.id === 'number' ? decodedToken.id : parseInt(decodedToken.id);
        console.log('  ✅ ID TEACHER trouvé dans authToken:', id);
        
        // Vérifier si on a aussi un JWT (meilleur pour l'authentification)
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
          console.log('  ✅ JWT Strapi également présent - Authentification complète');
        } else {
          console.warn('  ⚠️ Pas de JWT Strapi - CREATE/DELETE peuvent ne pas fonctionner');
        }
        return id;
      }
    }
  } catch (error) {
    console.warn('  ⚠️ Erreur décodage authToken:', error.message);
  }
  
  // ✅ PRIORITÉ 2: Si JWT présent mais pas authToken, on doit trouver le teacher via API
  // Mais cette fonction est synchrone, donc on ne peut pas faire d'appel API
  // Dans ce cas, on retourne null et les composants devront utiliser getTeacherIdAsync()
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    const parts = jwt.split('.');
    if (parts.length === 3) {
      console.log('  ✅ JWT Strapi détecté mais pas d\'authToken');
      console.warn('  ⚠️ Impossible de déterminer l\'ID TEACHER sans authToken');
      console.warn('  💡 Solution: Utilisez getTeacherIdAsync() dans les composants');
      // On ne retourne pas l'ID du user car ce n'est pas l'ID du teacher
    }
  }

  // ✅ MÉTHODE 2: Depuis userData (stocké directement)
  try {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      console.log('  📋 userData trouvé:', Object.keys(userData));
      
      // Vérifier plusieurs champs possibles
      if (userData.id) {
        const id = typeof userData.id === 'number' ? userData.id : parseInt(userData.id);
        console.log('  ✅ ID trouvé dans userData.id:', id);
        return id;
      }
      
      // Vérifier si c'est dans attributes (structure Strapi)
      if (userData.attributes && userData.attributes.id) {
        const id = typeof userData.attributes.id === 'number' ? userData.attributes.id : parseInt(userData.attributes.id);
        console.log('  ✅ ID trouvé dans userData.attributes.id:', id);
        return id;
      }
    }
  } catch (error) {
    console.warn('  ⚠️ Erreur parsing userData:', error.message);
  }

  // ✅ MÉTHODE 3: Depuis 'user' (utilisé par localStorage.js)
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('  📋 user trouvé:', Object.keys(user));
      
      if (user.id) {
        const id = typeof user.id === 'number' ? user.id : parseInt(user.id);
        console.log('  ✅ ID trouvé dans user.id:', id);
        return id;
      }
    }
  } catch (error) {
    console.warn('  ⚠️ Erreur parsing user:', error.message);
  }

  // Note: La vérification JWT est maintenant en haut de la fonction (priorité)

  console.error('  ❌ Aucun ID trouvé dans localStorage');
  
  // Afficher l'état complet pour diagnostic
  const state = {
    jwt: localStorage.getItem('jwt') ? 'Présent ✅' : 'Absent ❌',
    authToken: localStorage.getItem('authToken') ? 'Présent ✅' : 'Absent ❌',
    userData: localStorage.getItem('userData') ? 'Présent ✅' : 'Absent ❌',
    user: localStorage.getItem('user') ? 'Présent ✅' : 'Absent ❌'
  };
  
  console.log('  📋 État localStorage:', state);
  
  // Afficher un message d'aide si JWT est absent
  if (!localStorage.getItem('jwt')) {
    console.warn('  ⚠️ Aucun JWT Strapi trouvé !');
    console.warn('  💡 Solution: Connectez-vous via l\'API Strapi /auth/local');
    console.warn('  💡 Pour cela, créez un user dans Strapi Admin → Content Manager → User');
    console.warn('  💡 Puis liez le teacher à ce user dans Strapi Admin → Content Manager → Teacher');
  }

  return null;
};

/**
 * Vérifie si un JWT valide est disponible
 * @returns {boolean}
 */
export const hasValidJWT = () => {
  return getJWT() !== null;
};

/**
 * Récupère l'ID du teacher de manière asynchrone
 * Utile quand on a un JWT mais pas d'authToken
 * Fait une requête API pour trouver le teacher lié au user
 * @returns {Promise<number|null>} L'ID du teacher ou null
 */
export const getTeacherIdAsync = async () => {
  console.log('🔍 getTeacherIdAsync() - Recherche asynchrone de l\'ID TEACHER...');
  
  // D'abord essayer la méthode synchrone
  const syncId = getTeacherId();
  if (syncId) {
    console.log('  ✅ ID TEACHER trouvé via méthode synchrone:', syncId);
    return syncId;
  }
  
  // Si pas trouvé, essayer de trouver via JWT
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    console.warn('  ⚠️ Aucun JWT trouvé');
    return null;
  }
  
  try {
    // Décoder le JWT pour obtenir l'ID du user
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      console.warn('  ⚠️ JWT invalide');
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const userId = payload.id;
    
    if (!userId) {
      console.warn('  ⚠️ Pas d\'ID utilisateur dans le JWT');
      return null;
    }
    
    console.log('  📋 ID USER dans JWT:', userId);
    console.log('  📡 Recherche du teacher lié à ce user...');
    
    // Chercher le teacher qui a ce user dans la relation
    const response = await axios.get(
      `http://localhost:1337/api/teachers`,
      {
        params: {
          'filters[user][id][$eq]': userId,
          'populate': 'user'
        },
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      }
    );
    
    if (response.data.data && response.data.data.length > 0) {
      const teacher = response.data.data[0];
      const teacherId = teacher.id;
      console.log('  ✅ Teacher trouvé avec ID:', teacherId);
      return teacherId;
    } else {
      console.warn('  ⚠️ Aucun teacher trouvé pour ce user');
      console.warn('  💡 Assurez-vous que le teacher est lié au user dans Strapi Admin');
      return null;
    }
  } catch (error) {
    console.error('  ❌ Erreur lors de la recherche du teacher:', error);
    return null;
  }
};

/**
 * Affiche un résumé de l'état d'authentification dans la console
 * Utile pour le débogage
 */
export const logAuthState = () => {
  console.log('📊 ===== ÉTAT D\'AUTHENTIFICATION =====');
  
  const jwt = localStorage.getItem('jwt');
  const authToken = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  const userData = localStorage.getItem('userData');
  
  if (jwt) {
    const parts = jwt.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('✅ JWT Strapi présent');
        console.log('  📋 ID utilisateur:', payload.id);
        console.log('  📋 Email:', payload.email || 'N/A');
        console.log('  📋 Expiration:', payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A');
        console.log('  ✅ CREATE et DELETE devraient fonctionner');
      } catch (e) {
        console.warn('⚠️ JWT présent mais invalide');
      }
    } else {
      console.warn('⚠️ JWT présent mais format incorrect');
    }
  } else {
    console.warn('❌ Aucun JWT Strapi trouvé');
    console.warn('  💡 CREATE et DELETE peuvent ne pas fonctionner');
  }
  
  if (authToken) {
    try {
      const decoded = JSON.parse(atob(authToken));
      console.log('📋 authToken présent (token personnalisé)');
      console.log('  📋 ID:', decoded.id);
      console.log('  📋 Type:', decoded.type);
      console.log('  ⚠️ Ce n\'est pas un JWT Strapi');
    } catch (e) {
      console.warn('⚠️ authToken présent mais invalide');
    }
  }
  
  if (user) {
    try {
      const userObj = JSON.parse(user);
      console.log('📋 user présent:', userObj.email || userObj.username);
    } catch (e) {
      console.warn('⚠️ user présent mais invalide');
    }
  }
  
  if (userData) {
    try {
      const userDataObj = JSON.parse(userData);
      console.log('📋 userData présent');
    } catch (e) {
      console.warn('⚠️ userData présent mais invalide');
    }
  }
  
  console.log('📊 ====================================');
};

