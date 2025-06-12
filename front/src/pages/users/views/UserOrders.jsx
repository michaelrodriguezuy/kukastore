import { useContext, useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";
import { CartContext } from "../../../context/CartContext";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  Container,
  Box,
} from "@mui/material";

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
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const UserOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { user } = useContext(AuthContext);

  const { getDateShort, getFormatCurrency } = useContext(CartContext);

  useEffect(() => {
    const ordersCollection = collection(db, "orders");
    let ordersFiltered = query(
      ordersCollection,
      where("customerData.email", "==", user.email)
    );

    // async y await
    getDocs(ordersFiltered)
      .then((res) => {
        const ordersList = res.docs.map((order) => {
          return { ...order.data(), id: order.id };
        });
        // Filtrar las órdenes NO canceladas
        const activeOrders = ordersList.filter(order => order.estadoCompra !== "Cancelado");
        setMyOrders(activeOrders);
      })
      .catch((error) => console.log(error));
  }, [user.email]);

  const calcularSubtotal = (order) => {
    let subtotal = 0;    
      order.items.forEach((item) => {
        subtotal += item.unit_price * item.quantity;
      });
      return subtotal;
  }

  const getColorByHex = (colorHex) => {
    
    const colorMap = {
      "#FF0000": "rojo",
      "#0000FF": "azul",
      "#00FF00": "verde",
      "#FFFF00": "amarillo",
      "#FFA500": "naranja",
      "#EE82EE": "violeta",
      "#FFC0CB": "rosa",
      "#8B4513": "marrón",
      "#808080": "gris",
      "#FFFFFF": "blanco",
      "#000000": "negro",
      "#dbb845": "dorado",
      "#dededc": "plata",
      "#dd0f71": "fuscia",
      "#00FFFF": "celeste",
    };  
    
    return colorMap[colorHex] || colorHex
  }

  return (
    
      
      <Box sx={{ paddingTop: '20px' }}>

      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h1"
          align="center"
          sx={{ 
            fontWeight: 500,
            mb: 2
          }}
        >
          Mis órdenes de compra
        </Typography>
      </Container>

      {myOrders && myOrders.length > 0 && myOrders                
        .sort((a, b) => b.fechaCreacion.toMillis() - a.fechaCreacion.toMillis())
        .map((order) => (
          <Container key={order.id} maxWidth="lg">
            <TableContainer
              component={Paper}
              sx={{
                mb: 4,
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Orden #{order.id}
                </Typography>
                <Box>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Estado de la entrega: 
                    <span style={{ 
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: order.entrega === 'Despachado' ? '#4caf50' : 
                                     order.entrega === 'En espera' ? '#ff9800' : 
                                     order.entrega === 'Retiro' ? '#4caf50' :'#2196f3',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {order.entrega}
                    </span>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Estado de la orden: 
                    <span style={{ 
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: order.estadoCompra === 'Pagado' ? '#4caf50' : 
                                     order.estadoCompra === 'En espera' ? '#ff9800' : '#2196f3',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {order.estadoCompra}
                    </span>
                  </Typography>
                </Box>
              </Box>

              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1e1e1e' }}>
                    <StyledTableCell>Fecha</StyledTableCell>
                    <StyledTableCell align="center">Artículo</StyledTableCell>
                    <StyledTableCell align="center">Precio</StyledTableCell>
                    <StyledTableCell align="center">Cantidad</StyledTableCell>
                    <StyledTableCell align="center">SubTotal</StyledTableCell>
                    <StyledTableCell align="center">Envío</StyledTableCell>
                    <StyledTableCell align="center">Total</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell>
                      {getDateShort(order.fechaCreacion)}
                    </StyledTableCell>
                    <StyledTableCell colSpan={7} />
                  </StyledTableRow>
                  {order?.items?.map((product) => (
                    <StyledTableRow key={product.id}>
                      <StyledTableCell />
                      <StyledTableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img 
                            src={product.image[0]} 
                            alt={product.title}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <Typography sx={{ display: 'inline', fontWeight: 500 }}>
                            {product.title}
                            {(product.size || product.color) && (
                              <span style={{ color: '#666', fontWeight: 400, fontSize: '0.95em', marginLeft: 8 }}>
                                {product.size && `${product.size}`}
                                {product.size && product.color ? ' - ' : ''}
                                {product.color && `${getColorByHex(product.color)}`}
                              </span>
                            )}
                            {product.sku && (
                              <span style={{ color: '#888', fontStyle: 'italic', fontSize: '0.85em', marginLeft: 8, opacity: 0.6 }}>
                                SKU: {product.sku}
                              </span>
                            )}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {getFormatCurrency(product.unit_price)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {product.quantity}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {getFormatCurrency(product.unit_price * product.quantity)}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                  <StyledTableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <StyledTableCell colSpan={4} />
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {getFormatCurrency(calcularSubtotal(order))}
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {getFormatCurrency(order.shippingCost)}
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {getFormatCurrency(order.total)}
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        ))}
    </Box>
  );
};

export default UserOrders;
