import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { db } from "../../config/firebase";
import { doc, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import Swal from 'sweetalert2';

const Delivery = () => {
  const { guiaID } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [orderDetails, setOrderDetails] = useState(() => {
    try {
      const shippingData = localStorage.getItem('shippingData');
      console.log('Datos iniciales del localStorage:', shippingData);
      
      if (shippingData) {
        const parsedData = JSON.parse(shippingData);
        console.log('Datos parseados:', parsedData);
        
        if (parsedData.guiaID === guiaID) {
          console.log('Coincidencia encontrada, usando datos del localStorage');
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error al recuperar datos del localStorage:', error);
    }
    return { guiaID };
  });

  const steps = [
    {
      label: 'En preparación',
      description: 'Tu pedido está siendo preparado',
      icon: <InventoryIcon />
    },
    {
      label: 'En camino',
      description: 'Tu pedido está en camino',
      icon: <LocalShippingIcon />
    },
    {
      label: 'Entregado',
      description: 'Tu pedido ha sido entregado',
      icon: <CheckCircleIcon />
    }
  ];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Intentar obtener datos del localStorage primero
        const shippingDataFromStorage = localStorage.getItem('shippingData');
        console.log('Intentando obtener datos del localStorage en useEffect:', shippingDataFromStorage);

        if (shippingDataFromStorage) {
          const parsedShippingData = JSON.parse(shippingDataFromStorage);
          console.log('Datos parseados en useEffect:', parsedShippingData);

          setOrderDetails(parsedShippingData);
          if (parsedShippingData.guiaID === guiaID) {
            console.log('Coincidencia encontrada en useEffect, actualizando estado');
            return;
          }
        }

        // Si no está en localStorage, buscar en Firebase
        console.log('Buscando en Firebase...');
        let querySnapshot = await getDocs(
          query(collection(db, "orders"), 
          where("shippingData.guiaID", "==", guiaID))
        );

        if (querySnapshot.empty) {
          querySnapshot = await getDocs(
            query(collection(db, "orders"), 
            where("guiaID", "==", guiaID))
          );
        }

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          console.log('Datos encontrados en Firebase:', data);
          
          const orderData = {
            ...data,
            id: doc.id,
            guiaID: guiaID,
            tracking_web: data.tracking_web || data.shippingData?.tracking_web,
            shippingData: {
              ...data.shippingData,
              tracking_web: data.tracking_web || data.shippingData?.tracking_web
            }
          };
          
          setOrderDetails(orderData);
          
          // Guardar en localStorage para futura referencia
          localStorage.setItem('shippingData', JSON.stringify({
            guiaID: orderData.guiaID,
            tracking_web: orderData.tracking_web,
            shippingMethod: orderData.shippingMethod,
            shippingCost: orderData.shippingCost
          }));
        }
      } catch (error) {
        console.error("Error al obtener detalles del envío:", error);
      }
    };

    fetchOrderDetails();
  }, [guiaID]);

  // Función para abrir el seguimiento de UES
  const handleTrackingClick = () => {
    const tracking_web = orderDetails?.tracking_web;
    console.log('URL de seguimiento al hacer clic:', tracking_web);
    if (tracking_web) {
      window.open(tracking_web, '_blank');
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          sx={{ mb: 4 }}
        >
          <MuiLink 
            component={Link} 
            to="/"
            underline="none"
            color="inherit"
          >
            Inicio
          </MuiLink>
          <Typography color="text.primary">
            Seguimiento de envío
          </Typography>
        </Breadcrumbs>

        {/* Título */}
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ mb: 4 }}
        >
          Seguimiento de envío
        </Typography>

        {/* Información del envío */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: '#f8f9fa'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Guía de envío UES:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e1e1e', mb: 2 }}>
               {orderDetails?.guiaID}
            </Typography>

            {orderDetails?.tracking_web && (
              <Button
                variant="contained"
                onClick={handleTrackingClick}
                sx={{
                  bgcolor: '#1e1e1e',
                  '&:hover': { bgcolor: '#333' },
                  alignSelf: 'flex-start'
                }}
                startIcon={<LocalShippingIcon />}
              >
                Seguir envío en UES
              </Button>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Fecha estimada de entrega: De 2 a 3 días hábiles luego de confirmada la compra.
            </Typography>
          </Box>
        </Paper>

        {/* Stepper de seguimiento */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            backgroundColor: '#fff' 
          }}
        >
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#1e1e1e', // color personalizado para pasos completados
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#1e1e1e', // color personalizado para paso activo
              },
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        color: index <= activeStep ? '#1e1e1e' : '#bdbdbd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: index <= activeStep ? '#1e1e1e' : '#bdbdbd',
                      fontWeight: index === activeStep ? 'bold' : 'normal',
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: index <= activeStep ? '#1e1e1e' : '#bdbdbd',
                    }}
                  >
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Botones de acción */}
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          gap: 2,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            component={Link}
            to="/contact"
            sx={{
              bgcolor: '#1e1e1e',
              '&:hover': {
                bgcolor: '#333',
              },
            }}
          >
            Contactar vendedor
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Delivery; 