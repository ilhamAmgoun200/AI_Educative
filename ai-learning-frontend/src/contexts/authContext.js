import { createContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";
import { saveToken, getToken, removeToken, saveUser, getUser, clearAuthData } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";



// gerer les sessions 
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const navigate = useNavigate(); 
   
   //verifier si tocken existe 
   useEffect(()=> {
    const token = getToken();
    if(token){
        getMe().then((data)=> setUser(data))
        .catch(() => logout())
    }



   },[]);

   const loginUser = (data) => {
    saveToken(data.jwt);
    saveUser(data.user);
    setUser(data.user);
    navigate("/accueil"); 
  };

    const logout = () => {
        clearAuthData();
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout }}>
        {children}
        </AuthContext.Provider>
    );




};