"use client";
import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [isAuthorized,setIsAuthorized]=useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading,setLoading]=useState(true)

  useEffect(() => {
    const getuser=async()=>{
      setLoading(true)
    axios.get('/api/get_user',{withCredentials: true }).then((res)=>{
      if(res.data.success){
        setUser(res.data.user)
        setIsAuthorized(true)
      }else{
        setUser("")
        setIsAuthorized(false)
      }
    }).catch((e)=>{
      setIsAuthorized(false)
      setUser("")
      console.log(error)
    })
    .finally(()=>{
      setLoading(false)
    })
    }
    getuser()
    console.log(user)
  }, [isAuthorized]);

  useEffect(() => {
    if (isDarkMode) {
      localStorage.setItem("theme", isDarkMode);
    }
  }, [isDarkMode]);

  return (
    <AppContext.Provider value={{ user, setUser, isAuthorized, setIsAuthorized, isDarkMode, setIsDarkMode, loading, setLoading }}>
      {children}
    </AppContext.Provider>
  );
}


export function useAppContext() {
  return useContext(AppContext);
}
