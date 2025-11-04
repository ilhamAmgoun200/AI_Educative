import axios from "axios" ;
import { CONFIG } from "../config";
import { getToken , clearAuthData } from "../utils/localStorage";

const httpClient = axios.create({
        baseURL : CONFIG.API_URL,
        Headers : {"Content-Type" : "application/json"},

})
 

// intercepteur execute avant chque requete  
httpClient.interceptors.request.use(
    (confing) => {
        const token = getToken();
        if (token){
            //backend va savoir quel utilisateur fait la requête
            confing.headers.Authorization =`Bearer ${token}`;
        }
        return confing;

    },
    (error) => Promise.reject(error)
);

//interceptor des reponsesnapres chque reponse et pour gerer les erreurs globales 
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