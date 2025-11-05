import axios from "axios" ;
import { CONFIG } from "../config";
import { getToken , clearAuthData } from "../utils/localStorage";

const httpClient = axios.create({
        baseURL : CONFIG.API_URL,
        headers : {"Content-Type" : "application/json"},
})
 

// intercepteur execute avant chaque requête  
httpClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token){
            //backend va savoir quel utilisateur fait la requête
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//interceptor des réponses après chaque réponse et pour gérer les erreurs globales 
httpClient.interceptors.response.use(
    (response) => response,
    (error)=> {
        if(error.response?.status === 401){
            console.warn("Token expired or invalide");
            clearAuthData();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default httpClient;