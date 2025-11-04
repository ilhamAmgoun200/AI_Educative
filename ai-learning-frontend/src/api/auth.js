import httpClient from "./httpClient";

export const login = async(email, password) =>{
    const res = await httpClient.post("/auth/local",{identifier:email, password});
    return res.data ;
};


export const getMe = async () =>{
    const res = await httpClient.get("/users/me");
    return res.data ;
};