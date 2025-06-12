import {
  Box,
  Grid,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  tableCellClasses,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { db } from "../../../config/firebase";

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { CartContext } from "../../../context/CartContext";
import Swal from "sweetalert2";
import axios from "axios";
import { getColorByHex } from '../../../utils/colors';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },

  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState("asc");

  const [openModalOrder, setOpenModalOrder] = useState(false);
  const [theOrder, setTheOrder] = useState(null);

  const { getFormatCurrency } = useContext(CartContext);

  const [searchInput, setSearchInput] = useState("");

  const [orderStatus, setOrderStatus] = useState("");

  const orderStates = [
    { value: "En espera", label: "En espera" },
    { value: "Confirmado", label: "Confirmado" },
    { value: "Cancelado", label: "Cancelado" },
    { value: "Pagado", label: "Pagado" }
  ];

  const orderEntregaStates = [
    { value: "En espera", label: "En espera" },
    { value: "Despachado", label: "Despachado" }, //esto lo cambia el usuario administrador, cuando efectivamente despacha la orden
    { value: "Retiro", label: "Retiro" }
  ];

  const fetchOrders = async () => {
    try {
      const ordersCollection = collection(db, "orders");
      const querySnapshot = await getDocs(ordersCollection);
      
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fecha: data.fechaCreacion?.toDate() || new Date(),
          cliente: data.customerData?.nombre && data.customerData?.apellido 
            ? `${data.customerData.nombre} ${data.customerData.apellido}`
            : data.customerData?.email || 'Sin datos',
          paymentMethod: data.paymentMethod || 'No especificado',
          estadoCompra: data.estadoCompra || 'En espera',
          total: data.total || 0,
          items: data.items || [],
          customerData: data.customerData || {},
          shipmentCost: data.shipmentCost || 0,
          ...data
        };
      });

      ordersData.sort((a, b) => b.fecha - a.fecha);
      
      setOrders(ordersData);
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las órdenes'
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && orderDirection === "asc";
    setOrderBy(property);
    setOrderDirection(isAsc ? "desc" : "asc");
  };

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(order, orderBy) {
    return (a, b) => {
      if (order === "asc") {
        return a[orderBy] < b[orderBy] ? -1 : 1;
      } else {
        return b[orderBy] < a[orderBy] ? -1 : 1;
      }
    };
  }

  const sortedOrders = stableSort(
    orders.filter(order => 
      searchInput === "" || 
      order.id.toLowerCase().includes(searchInput.toLowerCase())
    ),
    getComparator(orderDirection, orderBy)
  );

  const handleOrder = async (orderId) => {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        setTheOrder({
          ...orderData,
          id: orderId
        });
        setOpenModalOrder(true);
      }
    } catch (error) {
      console.error("Error al obtener detalles de la orden:", error);
    }
  };

  const handleCloseOrder = () => {
    setOpenModalOrder(false);
  };

  const calcularSubtotal = () => {
    if (!theOrder?.items) return 0;
    return theOrder.items.reduce((acc, item) => {
      const priceWithDiscount = item.discount ? 
        item.unit_price - (item.unit_price * item.discount / 100) : 
        item.unit_price;
      return acc + (priceWithDiscount * item.quantity);
    }, 0);
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleStatusChange = async (newStatus, order) => {
    const oldStatus = order.estadoCompra;
    
    if (oldStatus === newStatus) return;

    let message = '';
    let stockAction = '';

    if (oldStatus === 'En espera' && newStatus === 'Cancelado') {
      message = 'Al cancelar esta orden, se restaurará el stock de los productos.';
      stockAction = 'restaurar';
    } else if (oldStatus === 'Cancelado' && newStatus === 'Confirmado') {
      message = 'Al confirmar esta orden, se descontará el stock de los productos.';
      stockAction = 'descontar';
    } else if (oldStatus === 'En espera' && newStatus === 'Confirmado') {
      message = 'Al confirmar esta orden, se mantendrá el descuento del stock ya realizado.';
      stockAction = 'mantener';
    } else if (oldStatus === 'Pagado' && newStatus === 'Cancelado') { //si cancelo una orden de mercadopago
      //OJO con este caso, porque tendria que devolverle el dinero a la persona
      message = 'Al cancelar esta orden, se restaurará el stock de los productos.';
      stockAction = 'restaurar';
    } else if (oldStatus === 'Cancelado' && newStatus === 'Pagado') { //si restauro una orden de mercadopago
      message = 'Al pagar esta orden, se descontará el stock de los productos.';
      stockAction = 'descontar';
    }

    if (message) {
      setOpenModalOrder(false);
      
      const result = await Swal.fire({
        title: 'Cambiar estado de la orden',
        html: `<p>${message}</p><p>¿Estás seguro de continuar?</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1e1e1e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar estado',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        setTheOrder(prev => ({...prev, estadoCompra: oldStatus}));
        setOpenModalOrder(true);
        return;
      }
    }

    try {
      const orderRef = doc(db, "orders", order.id);
      
      await updateDoc(orderRef, {
        estadoCompra: newStatus,
        fechaActualizacion: serverTimestamp(),
        ...(newStatus === 'Cancelado' && stockAction === 'restaurar' ? { motivoCancelacion: 'Cancelado manualmente por el administrador' } : {})
      });

      if (stockAction === 'restaurar') {
        for (const item of order.items) {
          const productRef = doc(db, "products", item.id);
          const productDoc = await getDoc(productRef);

          if (productDoc.exists()) {
            const productData = productDoc.data();
            if (item.sku && Array.isArray(productData.variants) && productData.variants.length > 0) {
              // Es variante, restaurar stock de la variante
              const updatedVariants = productData.variants.map(variant => {
                if (variant.sku === item.sku) {
                  return { ...variant, stock: (variant.stock || 0) + item.quantity };
                }
                return variant;
              });
              await updateDoc(productRef, { variants: updatedVariants });
              console.log(`Stock de variante RESTAURADO (manual) para SKU: ${item.sku}`);
            } else {
              // Producto simple, restaurar stock global
              await updateDoc(productRef, { stock: increment(item.quantity) });
              console.log(`Stock global RESTAURADO (manual) para Producto ID: ${item.id}`);
            }
          } else {
            console.warn(`Producto no encontrado para restaurar stock (manual): ID ${item.id}`);
          }
        }

        // Enviar email de cancelación al cliente
        try {
          // await axios.post('http://localhost:8081/send-email-cancel', {
          await axios.post('https://8rx6nnr9-8081.brs.devtunnels.ms/send-email-cancel', {
            to: order.customerData.email,
            orderId: order.id,
            customerData: order.customerData
          });
        } catch (emailError) {
          console.error('Error enviando email de cancelación:', emailError);
          showNotification('Error al enviar el email de cancelación', 'warning');
        }
      } else if (stockAction === 'descontar') {
        for (const item of order.items) {
          const productRef = doc(db, "products", item.id);
          const productDoc = await getDoc(productRef);

          if (productDoc.exists()) {
            const productData = productDoc.data();
            if (item.sku && Array.isArray(productData.variants) && productData.variants.length > 0) {
              // Es variante, descontar stock de la variante
              const updatedVariants = productData.variants.map(variant => {
                if (variant.sku === item.sku) {
                  return { ...variant, stock: Math.max(0, (variant.stock || 0) - item.quantity) };
                }
                return variant;
              });
              await updateDoc(productRef, { variants: updatedVariants });
              console.log(`Stock de variante DESCONTADO (manual) para SKU: ${item.sku}`);
            } else {
              // Producto simple, descontar stock global
              await updateDoc(productRef, { stock: increment(-item.quantity) });
              console.log(`Stock global DESCONTADO (manual) para Producto ID: ${item.id}`);
            }
          } else {
            console.warn(`Producto no encontrado para descontar stock (manual): ID ${item.id}`);
          }
        }
      }

      setTheOrder(prev => ({...prev, estadoCompra: newStatus}));
      showNotification(`Estado de la orden actualizado a ${newStatus}`);
      fetchOrders();

    } catch (error) {
      console.error("Error actualizando estado:", error);
      showNotification('Error al actualizar el estado de la orden', 'error');
      setTheOrder(prev => ({...prev, estadoCompra: oldStatus}));
      setOpenModalOrder(true);
    }
  };

  const handleStatusChangeEntrega = async (newStatus, order) => {
    const oldStatus = order.entrega;

    if (oldStatus === newStatus) return;
    
    
      setOpenModalOrder(false);
      
      const result = await Swal.fire({
        title: 'Cambiar el estado de la entrega de la orden',
        html: '¿Estás seguro de continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1e1e1e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar estado de la entrega',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        setTheOrder(prev => ({...prev, estadoCompra: oldStatus}));
        setOpenModalOrder(true);
        return;
      }
    

    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        entrega: newStatus,
        fechaActualizacion: serverTimestamp()
      });   

      //si el estado cambia a Despachado, envio un email al cliente
      if (newStatus === 'Despachado') {
        try {
          // await axios.post('http://localhost:8081/send-email-despachado', {
          await axios.post('https://8rx6nnr9-8081.brs.devtunnels.ms/send-email-despachado', {
            to: order.customerData.email,
            subject: '¡Atenti, tu pedido se movió!',
            orderId: order.id,
            customerData: order.customerData
          });
          showNotification('Email de aviso de despacho enviado correctamente al cliente', 'success');
        } catch (emailError) {
          console.error('Error enviando email de despachado:', emailError);
          showNotification('Error al enviar el email de aviso de despacho', 'warning');
        }
      }

      setTheOrder(prev => ({...prev, entrega: newStatus}));
      setOpenModalOrder(true);
      //showNotification(`Estado de la entrega actualizado a ${newStatus}`);
      fetchOrders();
      
    } catch (error) {
      console.error("Error actualizando estado de la entrega:", error);
      showNotification('Error al actualizar el estado de la entrega', 'error');
      setTheOrder(prev => ({...prev, entrega: oldStatus}));
      setOpenModalOrder(true);
    }    
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "1000px",
    maxHeight: "90vh",
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
    overflow: "auto",
    zIndex: 1000
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mb: 3,
        mt: 2,
        px: 2,
        width: '100%'
      }}>
        <Tooltip title="Volver al panel de administración">
          <IconButton 
            onClick={() => window.location.href = '/dashboard'}
            sx={{
              color: '#1e1e1e',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <KeyboardBackspaceIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Tooltip>

        <Typography
          variant="h5"
          color="textPrimary"
        >
          Ordenes de compra
        </Typography>
      </Box>

      <Grid item xs={12} sm={6} sx={{ padding: "20px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <TextField
              id="search"
              label="Buscar orden de compra por código"
              variant="outlined"
              value={searchInput}
              onChange={handleSearchInputChange}
              fullWidth
            />
          </Grid>

      <TableContainer component={Paper} style={{ marginTop: "5px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Código</StyledTableCell>
              <StyledTableCell align="center">
                <Tooltip title="Ordena por fecha">
                  <span onClick={() => handleRequestSort("fecha")}>Fecha de compra</span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Tooltip title="Ordena por cliente">
                  <span onClick={() => handleRequestSort("cliente")}>
                    Cliente
                  </span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Tooltip title="Ordena por método de pago">
                  <span onClick={() => handleRequestSort("paymentMethod")}>
                    Método de pago
                  </span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Tooltip title="Ordena por estado">
                  <span onClick={() => handleRequestSort("estadoCompra")}>
                    Estado de la compra
                  </span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Tooltip title="Ordena por monto">
                  <span onClick={() => handleRequestSort("total")}>Total</span>
                </Tooltip>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <StyledTableRow key={order.id}>
                  <StyledTableCell component="th" scope="row" align="center">
                    <Tooltip title="Haga clic para ver la compra">
                      <span
                        style={{
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={() => handleOrder(order.id)}
                      >
                        {order.id}
                      </span>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {order.fecha instanceof Date 
                      ? order.fecha.toLocaleDateString('es-UY', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Fecha no válida'
                    }
                  </StyledTableCell>
                  <StyledTableCell align="center">{order.cliente}</StyledTableCell>
                  <StyledTableCell align="center">{order.paymentMethod}</StyledTableCell>
                  <StyledTableCell align="center">{order.estadoCompra === 'Cancelado'
                    ? (order.motivoCancelacion && order.motivoCancelacion.toLowerCase().includes('24 horas')
                        ? 'Cancelado automático'
                        : 'Cancelado manual')
                    : order.estadoCompra}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {getFormatCurrency(order.total)}
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <StyledTableRow>
                <StyledTableCell colSpan={6} align="center">
                  No hay datos disponibles.
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {theOrder && (
        <Modal
          open={openModalOrder}
          onClose={handleCloseOrder}
          aria-labelledby="modal-modal-title"
        >
          <Box sx={modalStyle}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Orden de Compra #{theOrder.id}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Información del Cliente
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Fecha de compra:</strong> {theOrder.fechaCreacion?.toDate().toLocaleDateString('es-UY', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Nombre del cliente:</strong> {theOrder.customerData?.nombre} {theOrder.customerData?.apellido}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Email:</strong> {theOrder.customerData?.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Teléfono:</strong> {theOrder.customerData?.celular || 'No disponible'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Direccion:</strong> {theOrder.customerData?.direccion || 'No disponible'}
                      </Typography>
                    </Grid>                    
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Localidad:</strong> {theOrder.customerData?.localidad || 'No disponible'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Departamento:</strong> {theOrder.customerData?.ciudad || 'No disponible'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Detalles del Pago
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Método de Pago:</strong> {theOrder.paymentMethod || "No especificado"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Estado de la Orden:</strong>
                      </Typography>
                      <FormControl fullWidth sx={{ mt: 1 }}>                        
                        <Select
                          value={theOrder.estadoCompra || "En espera"}
                          onChange={(e) => handleStatusChange(e.target.value, theOrder)}
                          
                        >
                          {orderStates.map((state) => (
                            <MenuItem key={state.value} value={state.value}>
                              {state.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Método de envío:</strong> {theOrder.shippingMethod}
                      </Typography>
                      {theOrder.shippingMethod.includes("UES") && theOrder.guiaID && (
                        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                          <strong>Número de rastreo:</strong> {theOrder.guiaID}
                        </Typography>
                      )}
                      
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Estado de la entrega:</strong>
                      </Typography>                     
                      <FormControl fullWidth sx={{ mt: 1 }}>                        
                        <Select
                          value={theOrder.entrega || "En espera"}
                          onChange={(e) => handleStatusChangeEntrega(e.target.value, theOrder)}
                          
                        >
                          {orderEntregaStates.map((state) => (
                            <MenuItem key={state.value} value={state.value}>
                              {state.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                    </Grid>
                    <Grid item xs={12}>
                      <Typography><strong>Subtotal:</strong> {getFormatCurrency(calcularSubtotal())}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>
                        <strong>Envío:</strong> {getFormatCurrency(theOrder.shippingCost || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6"><strong>Total:</strong> {getFormatCurrency(Math.round(Number(calcularSubtotal()) + Number(theOrder.shippingCost || 0)))}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Productos
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell align="center">Color</TableCell>
                          <TableCell align="center">Talle</TableCell>
                          <TableCell align="center">Cantidad</TableCell>
                          <TableCell align="right">Precio</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {theOrder.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.title}
                              {item.discount > 0 && (
                                <Typography color="error" variant="caption" display="block">
                                  Descuento: {item.discount}%
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {item.color ? getColorByHex(item.color) : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {item.size || '-'}
                            </TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {item.discount > 0 ? (
                                <>
                                  <Typography variant="caption" style={{ textDecoration: 'line-through' }}>
                                    {getFormatCurrency(item.unit_price)}
                                  </Typography>
                                  <Typography color="error">
                                    {getFormatCurrency(item.unit_price - (item.unit_price * item.discount / 100))}
                                  </Typography>
                                </>
                              ) : (
                                getFormatCurrency(item.unit_price)
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {getFormatCurrency(
                                item.discount ? 
                                  (item.unit_price - (item.unit_price * item.discount / 100)) * item.quantity :
                                  item.unit_price * item.quantity
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Modal>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Orders;
