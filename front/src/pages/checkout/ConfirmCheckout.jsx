import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Breadcrumbs,
  TextField,
  Grid,
  Divider
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import axios from "axios";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { initMercadoPago } from "@mercadopago/sdk-react";
import confetti from 'canvas-confetti';

const ConfirmCheckout = () => {
  const { 
    cart, 
    orderData,
    deleteById,
    updateQuantity,
    getTotalPrice,
    getTotalDiscount,
    clearAll
  } = useContext(CartContext);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramValue = queryParams.get("status");

  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar MercadoPago
  useEffect(() => {
    if (orderData?.paymentMethod === 'mercadopago') {
      initMercadoPago(import.meta.env.VITE_PUBLICKEY, {
        locale: "es-UY",
      });
    }
  }, [orderData]);

  const handleQuantityChange = (item, newQuantity) => {
    const quantity = parseInt(newQuantity);
    
    if (isNaN(quantity)) return;
    
    if (quantity > item.stock) {
      Swal.fire({
        icon: 'error',
        title: 'Stock insuficiente',
        text: `Solo hay ${item.stock} unidades disponibles`
      });
      return;
    }
    
    if (quantity < 1) return;
    
    updateQuantity(item.id, quantity);
  };

  const sendEmailToCustomer = async (orderId, orderToSave) => {
    try {
      const customerName = `${orderToSave.customerData.nombre} ${orderToSave.customerData.apellido}`;
      
      // await axios.post('http://localhost:8081/send-email-checkout-user', {
      await axios.post('https://8rx6nnr9-8081.brs.devtunnels.ms/send-email-checkout-user', {
        to: orderToSave.customerData.email,
        subject: 'Confirmación de pedido',
        customerName: customerName,
        orderId: orderId,
        orderDetails: {
          nombre: orderToSave.customerData.nombre,
          apellido: orderToSave.customerData.apellido,
          celular: orderToSave.customerData.celular,
          email: orderToSave.customerData.email,
          paymentMethod: orderToSave.paymentMethod,
          estadoCompra: orderToSave.estadoCompra,
          items: cart.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.unit_price,
            subtotal: item.quantity * item.unit_price,
            discount: item.discount || 0,
            color: item.color || '',
            size: item.size,
            priceWithDiscount: item.discount ? 
              item.unit_price - (item.unit_price * item.discount / 100) : 
              item.unit_price
          })),
          shippingCost: orderToSave.shippingCost || 0,
          subtotal: getTotalPrice(),
          totalConEnvio: getTotalPrice() + (orderToSave.shippingCost || 0)
        }
      });
    } catch (error) {
      console.error('Error enviando email al cliente:', error);
      throw new Error('Error al enviar email de confirmación al cliente');
    }
  };

  const sendEmailToCommerce = async (orderId, orderToSave) => {
    try {
      // await axios.post('http://localhost:8081/send-email-checkout', {
      await axios.post('https://8rx6nnr9-8081.brs.devtunnels.ms/send-email-checkout', {
        to: "kukastore.tyt@gmail.com",
        subject: "Nueva venta - ID: " + orderId,
        text: "Datos de una venta en su e-Commerce",
        order: {
          orderId: orderId,
          nombre: orderData.customerData.nombre,
          apellido: orderData.customerData.apellido,
          email: orderData.customerData.email,
          paymentMethod: orderData.paymentMethod,
          estadoCompra: orderToSave.estadoCompra,
          total: getTotalPrice() + (orderData.shippingCost || 0),
          items: cart.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.unit_price
          }))
        }
      });
    } catch (error) {
      console.error('Error enviando email al comercio:', error);
      throw new Error('Error al enviar email de notificación al comercio');
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      // Obtener el método de envío del localStorage si no está en orderData
      const shippingMethod = orderData.shippingMethod || localStorage.getItem('shippingMethod') || 'retiro';

      const order = {
        items: cart,
        total: getTotalPrice(),
        customerData: orderData.customerData,
        paymentMethod: orderData.paymentMethod,
        shippingMethod: shippingMethod,
        shipmentCost: orderData.shippingCost || 0,
        estadoCompra: orderData.paymentMethod === 'mercadopago' ? 'Confirmado' : 'En espera',
        fechaCreacion: serverTimestamp(),
        informacionAdicional: orderData.customerData.informacionAdicional || ''
      };

      const ordersCollection = collection(db, "orders");
      const docRef = await addDoc(ordersCollection, order);

      // Actualizar stock
      for (const item of orderData.items) {
        await updateDoc(doc(db, "products", item.id), {
          stock: item.stock - item.quantity
        });
      }

      // Enviar emails
      await Promise.all([
        sendEmailToCustomer(docRef.id, order),
        sendEmailToCommerce(docRef.id, order)
      ]);

      // Limpiar carrito y datos
      clearAll();
      
      // Si es mercadopago, limpiar localStorage
      if (orderData.paymentMethod === 'mercadopago') {
        localStorage.removeItem("order");
      }

      // Lanzar confetti y mostrar mensaje de éxito
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Si todo sale bien, mostrar éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Compra procesada!',
        text: 'Redirigiendo...',
        timer: 2000,
        showConfirmButton: false
      });

      // Enviar los datos completos de la orden
      navigate('/compra-finalizada', { 
        state: { 
          orderData: {
            ...order,
            paymentMethod: orderData.paymentMethod,
            customerData: orderData.customerData,
            shippingCost: orderData.shippingCost,
            informacionAdicional: orderData.customerData.informacionAdicional || ''
          } 
        } 
      });

    } catch (error) {
      console.error('Error al procesar la orden:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema procesando tu pedido'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        <Typography variant="h4" gutterBottom style={{ textAlign: 'center' }}>
            Finalizar compra            
        </Typography>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 4 }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Inicio
          </Link>
          <Typography color="text.primary">Finalizar compra</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Columna de productos */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalles de facturación
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Precio</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.title}
                            sx={{ width: 50, height: 50, mr: 2, objectFit: 'cover' }}
                          />
                          {item.title}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {item.discount > 0 ? (
                          <>
                            <Typography 
                              variant="body2" 
                              sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                            >
                              $ {item.unit_price}
                            </Typography>
                            <Typography color="error">
                              $ {item.unit_price - (item.unit_price * item.discount / 100)}
                            </Typography>
                          </>
                        ) : (
                          `$ ${item.unit_price}`
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item, e.target.value)}
                          inputProps={{ 
                            min: 1, 
                            max: item.stock,
                            style: { textAlign: 'center' }
                          }}
                          sx={{ width: 60 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        $ {item.unit_price * item.quantity}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => deleteById(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orderData.shippingCost > 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>Envío a domicilio</TableCell>
                      <TableCell align="right">$ {orderData.shippingCost}</TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Columna de totales */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom style={{ textAlign: 'center' }}>
                Total del carrito
              </Typography>

              {/* Subtotal original */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Subtotal</Typography>
                <Typography>
                  $ {cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0)}
                </Typography>
              </Box>

              {/* Descuento total */}
              {getTotalDiscount() > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="error">Descuento</Typography>
                  <Typography color="error">
                    -$ {getTotalDiscount()}
                  </Typography>
                </Box>
              )}

              {/* Subtotal con descuentos */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Total</Typography>
                <Typography>
                  $ {getTotalPrice()}
                </Typography>
              </Box>

              {/* Costo de envío */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Costo de envío</Typography>
                <Typography>
                  $ {orderData.shippingCost || 0}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Total final */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">A pagar</Typography>
                <Typography variant="h6">
                  $ {getTotalPrice() + (orderData.shippingCost || 0)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={isProcessing}
                sx={{
                  mt: 2,
                  bgcolor: '#1e1e1e',
                  '&:hover': { bgcolor: '#333' }
                }}
              >
                {isProcessing ? 'Procesando...' : 'Finalizar compra'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ConfirmCheckout; 