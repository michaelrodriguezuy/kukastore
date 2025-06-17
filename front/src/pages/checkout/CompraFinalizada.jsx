import { useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Breadcrumbs
} from "@mui/material";
import { Link } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const CompraFinalizada = () => {
  const { clearAll } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const emailNotificationFromEcommerce = import.meta.env.VITE_EMAIL_Notification_From_eCommerce;
  const emailNotificationComercio = import.meta.env.VITE_EMAIL_Notification_Comercio;

  const banco = import.meta.env.VITE_Banco;
  const cuenta = import.meta.env.VITE_Banco_Cuenta;
  const titular = import.meta.env.VITE_Banco_Titular;
  const nroContacto = import.meta.env.VITE_Nro_contacto;
  const horasLiberacionOrden = import.meta.env.VITE_Horas_Liberacion_Ordenes;
  const direccion = import.meta.env.VITE_Direccion_local_1;
  const diasHorarios = import.meta.env.VITE_Dias_horarios_1 + ' - ' + import.meta.env.VITE_Dias_horarios_1_;

  useEffect(() => {
    // Limpiar localStorage después de 10 segundos
    const timer = setTimeout(() => {
      console.log('Limpiando localStorage automáticamente');
      clearAll();
    }, 10000); // 10 segundos

    // Limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Verificar si tenemos los datos necesarios
  if (!location.state?.orderData) {
    console.log('No hay datos de la orden');
    navigate('/');
    return null;
  }

  const orderData = location.state.orderData;

  const handleTrackShipment = () => {
    console.log('Datos de la orden:', orderData);
    
    // Guardar datos de envío en localStorage antes de navegar
    const shippingData = {
      guiaID: orderData.guiaID,
      tracking_web: orderData.tracking_web,
      shippingMethod: orderData.shippingMethod,
      shippingCost: orderData.shippingCost
    };
    
    console.log('Guardando en localStorage:', shippingData);
    localStorage.setItem('shippingData', JSON.stringify(shippingData));

    // Navegar a la página de delivery
    navigate(`/delivery/${orderData.guiaID}`);
    clearAll();
  };

  const renderPaymentMessage = () => {
    switch(orderData.paymentMethod) {
      case 'transferencia':
        return (
          <>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>

          <Typography variant="h5" gutterBottom>
              ¡Tu pedido ha sido registrado!
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Una copia de tu compra se ha enviado a tu correo electrónico.
            </Typography>
            </Box>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Datos bancarios:
            </Typography>
            <Typography variant="body2">Banco: {banco}</Typography>
            <Typography variant="body2">Cuenta: {cuenta}</Typography>
            <Typography variant="body2">Titular: {titular}</Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'error.main' }}>
              IMPORTANTE:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              1. Realice la transferencia al número de cuenta mencionado arriba
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              2. Envíe el comprobante de transferencia a {emailNotificationComercio}, o
                 al whatsapp 0{nroContacto} para que podamos verificar su pago.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
              Si no realiza estos pasos dentro de las próximas {horasLiberacionOrden} horas hábiles, 
              la compra será cancelada automáticamente y los productos serán liberados.
            </Typography>
          </Box>
          </>
        );
      case 'efectivo':
        return (
          <>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
              ¡Tu pedido ha sido registrado!
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Una copia de tu compra se ha enviado a tu correo electrónico.
            </Typography>
            </Box>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom color="error.main">
              IMPORTANTE:
            </Typography>
            <Typography variant="body2">
              Debe realizar el pago en efectivo en nuestro local dentro de las próximas {horasLiberacionOrden} horas hábiles.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
              De no efectuar el pago en el plazo establecido, la compra será cancelada 
              automáticamente y los productos serán liberados.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Dirección: {direccion}
            </Typography>
            <Typography variant="body2">
              Horario: {diasHorarios}
            </Typography>
          </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 4 }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Inicio
          </Link>
          <Typography color="text.primary">Compra finalizada</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
          <CheckCircleOutlineIcon 
            sx={{ fontSize: 60, color: 'success.main', mb: 2 }} 
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Número de orden: {orderData.orderId}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Estado de la orden: {orderData.estadoCompra}
          </Typography>
          
                    
          {renderPaymentMessage()}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              component={Link}
              to="/"
              onClick={clearAll}
              sx={{
                bgcolor: '#1e1e1e',
                '&:hover': { bgcolor: '#333' }
              }}
            >
              Seguir comprando
            </Button>
            {orderData?.shippingMethod !== 'retiro' && orderData?.guiaID && (
              <Button
                component={Link}
                to={`/delivery/${orderData.guiaID}`}
                variant="contained"
                onClick={handleTrackShipment}
                sx={{
                  bgcolor: '#1e1e1e',
                  '&:hover': {
                    bgcolor: '#333'
                  }
                }}
              >
                Seguir Envío
              </Button>
            )}
          </Box>
          
        </Paper>
      </Container>
    </Box>
  );
};

export default CompraFinalizada; 