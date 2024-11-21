import { useContext, useEffect } from 'react';
import { logout } from "../../../fireBaseConfig";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const Logout = () => {    
    const { logoutContext } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            logoutContext();
            navigate('/');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        handleLogout(); // Aquí se ejecuta cuando el componente se monta
        return () => {
            // Limpia el contexto de autenticación cuando el componente se desmonta
            logoutContext();
        };
    }, []); // Dependenicas vacías para que se ejecute solo una vez al montar el componente

    return null;
};

export default Logout;
