import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Drawer,
  Box,
  Divider,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { styled } from "@mui/material/styles";
import { getColorByHex } from "../../utils/colors";
import { getFormatCurrency } from "../../utils/formatCurrency";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import Swal from "sweetalert2";
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';


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

const Cart = ({ isOpen, onClose }) => {
  const { cart, deleteById, getTotalPrice, getFormatCurrency, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const calculateDiscountedPrice = (item) => {
    if (item.discount) {
      return item.unit_price - (item.unit_price * (item.discount / 100));
    }
    return item.unit_price;
  };

  const handleComprar = () => {
    onClose();
    navigate('/cartPage');
  };

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

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Carrito</Typography>

          {cart.length > 0 && (
          <Tooltip title="Vaciar carrito">
            <IconButton onClick={handlerClearCart}>
              <RemoveShoppingCartIcon />
            </IconButton>
          </Tooltip>
        )}

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {cart.map((item) => (
          <Box key={item.id} sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <Box sx={{ position: 'relative' }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: '8px'
                    }}
                  />
                  {item.discount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bgcolor: 'error.main',
                        color: 'white',
                        px: 1,
                        borderRadius: '8px 0 8px 0',
                        fontSize: '0.75rem'
                      }}
                    >
                      -{item.discount}%
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={9}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <Box>
                    <Typography variant="subtitle1">
                      {item.title}
                    </Typography>
                    {(item.size || item.color) && (
                      <Typography variant="body2" color="GrayText">
                        {item.size && `Talle: ${item.size}`}
                        {item.size && item.color ? ' - ' : ''}
                        {item.color && `Color: ${item.color}`}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Cantidad: {item.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center' }}>
                    {item.discount > 0 ? (
                      <Box sx={{ mr: 2, textAlign: 'right' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textDecoration: 'line-through',
                            color: 'text.secondary'
                          }}
                        >
                          $ {item.unit_price}
                        </Typography>
                        <Typography color="error">
                          $ {calculateDiscountedPrice(item)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ mr: 2 }}>
                        $ {item.unit_price}
                      </Typography>
                    )}
                    <IconButton 
                      size="small" 
                      onClick={() => deleteById(item.sku)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}

        {cart.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 2 
            }}>
              <Typography variant="subtitle1">Subtotal</Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                 {getFormatCurrency(getTotalPrice())}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={handleComprar}
              sx={{
                mb: 1,
                bgcolor: '#1e1e1e',
                '&:hover': {
                  bgcolor: '#333'
                }
              }}
            >
              COMPRAR
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{
                color: '#1e1e1e',
                borderColor: '#1e1e1e',
                '&:hover': {
                  borderColor: '#333'
                }
              }}
            >
              CONTINUAR COMPRANDO
            </Button>
          </Box>
        ) : (
          <Typography variant="body1" align="center" sx={{ mt: 4 }}>
            El carrito está vacío
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default Cart;
