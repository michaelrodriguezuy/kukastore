import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthContextComponent = ({ children }) => {

  const navigate = useNavigate();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || {}
  );
  const [isLogged, setIsLogged] = useState(
    JSON.parse(localStorage.getItem("isLogged")) || false
  );

  const handleLogin = (userLogged) => {
    setUser(userLogged);
    setIsLogged(true);
    localStorage.setItem("userInfo", JSON.stringify(userLogged));
    localStorage.setItem("isLogged", JSON.stringify(true));
  };

  const logoutContext = () => {
    setUser({});
    setIsLogged(false);  

    //en realidad quiero actualizar la pagina cart.jsx
    history.go(0) 
    //este tiene el mismo efecto que windows.location.reload(), se ve el refresco de la 
    localStorage.clear();    
    // localStorage.removeItem("originalArticleId");
    
  };

  const sessionTimeout = 300000; // 60000 -> 1 minuto
  let timeoutId;

  const resetSessionTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      logoutContext();
    }, sessionTimeout);
  };

  const handleActivity = () => {
    resetSessionTimeout();
  };

  //solo se resetea el timeout si el usuario esta logeado
  useEffect(() => {

    if (isLogged) {
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);

    resetSessionTimeout();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keydown", handleActivity);
    };
  }
  }, [isLogged]);

  let data = {
    user,
    isLogged,
    handleLogin,
    logoutContext,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export default AuthContextComponent;
