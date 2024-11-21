import { useContext } from "react";
import { CartContext } from "../../../context/CartContext";
import { AuthContext } from "../../../context/AuthContext";
import { Link, useNavigate } from 'react-router-dom';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import {
  IconButton,
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
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import Swal from "sweetalert2";

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
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Cart = () => {


  const { cart, clearCart, deleteById, getTotalPrice, getFormatCurrency } =
    useContext(CartContext);
  const { isLogged } = useContext(AuthContext);
  const navigate = useNavigate();

  let total = getTotalPrice();

  const handlerClearCart = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Se vaciará el carrito de compras",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, vaciar",
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire("Vacío", "El carrito de compras se vació", "success");
      }
    });
  };

  const handleCheckout = () => {
    if (isLogged) {
      // Si el usuario está logueado, lo redirige al checkout
      return (
        <Link to="/checkout">
          <IconButton>
            <Tooltip title="PAGAR">
              <PaidIcon color="primary" style={{ fontSize: 60 }} />
            </Tooltip>
          </IconButton>
        </Link>
      );
    } else {
      // Si el usuario no está logueado, muestra un mensaje de advertencia
      Swal.fire({
        title: "Inicia sesión",
        text: "Para proceder con la compra, primero debes iniciar sesión.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Iniciar sesión",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {      
          // Si el usuario decide iniciar sesión, lo redirige a la página de inicio de sesión
          return (
            navigate("/login")
          );
        }
      });
    }
  };

  const getColorByHex = (colorHex) => {
    
    const colorMap = {
      "#FF0000" : "rojo",
      "#0000FF" : "azul",
       "#00FF00" : "verde",
      "#FFFF00" : "amarillo",
      "#FFA500" : "naranja",
      "#EE82EE"   : "violeta",
      "#FFC0CB" : "rosa",
      "#8B4513" : "marrón",
      "#808080" : "gris",
      "#FFFFFF": "blanco",
      "#000000": "negro",
      "#dbb845": "dorado",
      "#dededc": "plata",
      "#dd0f71": "fuscia",
    };    
    
    return colorMap[colorHex] || colorHex
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          justifyContent: "space-around",
          padding: "20px",
          textAlign: "center",
          mb: 3,
          maxWidth: 600,
          margin: "0 auto",
        }}
        >
        <Typography variant="h4" component="h4">
          Mi compra
        </Typography>

        {cart.length > 0 && (
          <Tooltip title="Vaciar carrito">
            <IconButton onClick={handlerClearCart}>
              <RemoveShoppingCartIcon color="primary" />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
      
      <TableContainer
        component={Paper}
        style={{ maxWidth:800, margin:'0 auto', marginTop: "30px", marginBottom: "50px", textAlign: "center" }}
      >
        <Card sx={{ minWidth: 275, overflowX: "auto" }}>
          <CardContent>
            <Table sx={{ minWidth: 650 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Artículo</StyledTableCell>
                  <StyledTableCell align="center">Color</StyledTableCell>
                  <StyledTableCell align="center">
                    Precio unitario
                  </StyledTableCell>
                  <StyledTableCell align="center">Cantidad</StyledTableCell>
                  <StyledTableCell align="center">Subtotal</StyledTableCell>
                  <StyledTableCell align="center">Editar</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cart.map((product) => {
                  return (
                    <StyledTableRow key={product.id}>
                      <StyledTableCell
                        component="th"
                        scope="row"
                        align="center"
                      >
                        {product.title}
                      </StyledTableCell>

                      <StyledTableCell align="center">                        
                        {/* aca necesito una funcion para mostrar el color en string */}
                        {getColorByHex(product.color)}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {getFormatCurrency(product.unit_price)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {product.quantity}
                      </StyledTableCell>

                      {/* calculo el subtotal del articulo  */}
                      <StyledTableCell align="center">
                        {getFormatCurrency(
                          product.unit_price * product.quantity
                        )}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <IconButton onClick={() => deleteById(product.id)}>
                          <Tooltip title="Eliminar item">
                            <DeleteForeverIcon color="primary" />
                          </Tooltip>
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TableContainer>

      <Paper
        elevation={3}
        sx={{
          display: "flex",
          justifyContent: "space-around",
          flexDirection: "row",
          alignItems: "center",
          padding: "20px",
          textAlign: "center",
          mb: 3,
          maxWidth: 600,
          margin: "0 auto",          
        }}
      >
        <Typography
          variant="h3"
          component="h3"
          sx={{
            alignSelf: "center",
            lineHeight: "1",
            display: "flex",
          }}
        >
          Total: {getFormatCurrency(total)}
        </Typography>

        {cart.length > 0 && handleCheckout()}

      </Paper>
    </>
  );
};

export default Cart;
