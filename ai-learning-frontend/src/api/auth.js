import httpClient from "./httpClient";
import axios from "axios";
import { CONFIG } from "../config";

export const login = async(email, password) =>{
    const res = await httpClient.post("/auth/local",{identifier:email, password: password});
    return res.data ;
};


export const getMe = async () =>{
    const res = await httpClient.get("/users/me");
    return res.data ;
};

export const register = async (username, email, password, roleName) => {
 
  const registerRes = await httpClient.post("/auth/local/register", {
    username,
    email,
    password,
  });


  const { data: rolesRes } = await httpClient.get("/users-permissions/roles");


  const selectedRole = rolesRes.roles.find(
    (r) => r.name.toLowerCase() === roleName.toLowerCase()
  );

  if (!selectedRole) {
    throw new Error(`Rôle "${roleName}" introuvable dans Strapi`);
  }

 
  const token = registerRes.data.jwt;
  const userId = registerRes.data.user.id;

  try {
    
    await axios.put(
      `${CONFIG.API_URL}/users/${userId}`,
      {
        role: selectedRole.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    
    const { data: updatedUser } = await axios.get(
      `${CONFIG.API_URL}/users/${userId}?populate=role`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    
    return {
      jwt: token,
      user: updatedUser,
    };
  } catch (updateError) {
    
    console.warn("Impossible de mettre à jour le rôle, l'utilisateur a été créé avec le rôle par défaut:", updateError);
    
 
    return registerRes.data;
  }
};