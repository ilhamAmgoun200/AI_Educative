const TOKEN_KEY = "jwt";
const USER_KEY = "user";

export const saveToken = (token) => {
    if(token && typeof token ==='string'){
        localStorage.setItem(TOKEN_KEY,token)
    }
};
//recuperation de token
 export const getToken = () =>{
    return localStorage.getItem(TOKEN_KEY)
 };


 export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

//sauvgarde les infos d user

export const saveUser = (user) =>{
    if(user){
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

//recuperation des infos d user 
export const getUser = () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null ;
};


// suppresion de toute les donnees d'auth
export const clearAuthData = () => {
    removeToken();
    localStorage.removeItem(USER_KEY);
};

// verifier si user connected 
 export const isAuthenticated = () => {
    return Boolean(getToken());
 }