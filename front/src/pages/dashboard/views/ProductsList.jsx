import { useEffect, useState, useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, IconButton, Tooltip, styled, Checkbox, TextField, Snackbar, Alert, Chip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { deleteDoc, doc, updateDoc, collection, addDoc, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import ProductsForm from "../components/ProductsForm";
import { db } from "../../../config/firebase";
import { CartContext } from "../../../context/CartContext";
import Swal from "sweetalert2";
import { Divider } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  maxWidth: '98vw',
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "98vh",
  overflowY: "auto"
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
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const ProductsList = ({ products, categories, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [productSelected, setProductSelected] = useState(null);
  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState("asc");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { getFormatCurrency } = useContext(CartContext);

  const deleteProduct = async (id, code) => {
    try {
      const result = await Swal.fire({
        title: `¿Eliminar el artículo '${code}'?`,
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1e1e1e",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, "products", id));
        setIsChange(true);
        setSnackbar({
          open: true,
          message: `El artículo ${code} ha sido eliminado`,
          severity: "success"
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al eliminar el artículo",
        severity: "error"
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (product) => {
    setProductSelected(product);
    setOpen(true);
  };

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

  const sortedProducts = stableSort(
    products,
    getComparator(orderDirection, orderBy)
  );

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

  return (
    <div>
      <Button variant="contained" onClick={() => handleOpen(null)}
         sx={{
          bgcolor: '#1e1e1e',
          '&:hover': { bgcolor: '#333' },
          alignSelf: 'flex-start'
        }} >
      
        Agregar producto
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "5px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("code")}>Código</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("title")}>Título</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("unit_price")}>
                    Precio
                  </span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("stock")}>Stock</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <span>Color </span>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Talles disponibles">
                  <span>Talle</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">Imágen</StyledTableCell>

              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("category")}>
                    Categoría
                  </span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("discount")}>
                    Descuento %
                  </span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">Destacado</StyledTableCell>

              <StyledTableCell align="center">SKU</StyledTableCell>

              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProducts.map((product) => (
              <StyledTableRow
                key={product.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <StyledTableCell component="th" scope="row" align="left">
                  {product.code}
                </StyledTableCell>
                <StyledTableCell align="left">{product.title}</StyledTableCell>
                <StyledTableCell align="center">
                  {getFormatCurrency(product.unit_price)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {product.variants && product.variants.length > 0
                    ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
                    : product.stock}
                </StyledTableCell>

                <StyledTableCell align="center">
                  {product.variants && product.variants.length > 0
                    ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                        {[...new Set(product.variants.map(v => v.color || '-'))].map((color, idx) => (
                          <Chip
                            key={color + idx}
                            label={color}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: '20px',
                              bgcolor: '#f0f0f0',
                              border: '1px solid #ddd',
                              m: 0.2
                            }}
                          />
                        ))}
                      </Box>
                    )
                    : (product.color || '-')}
                </StyledTableCell>

                <StyledTableCell align="center">
                  {product.variants && product.variants.length > 0
                    ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                        {[...new Set(product.variants.map(v => v.size || '-'))].map((size, idx) => (
                          <Chip
                            key={size + idx}
                            label={size}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: '20px',
                              bgcolor: '#f0f0f0',
                              border: '1px solid #ddd',
                              m: 0.2
                            }}
                          />
                        ))}
                      </Box>
                    )
                    : (
                      product.sizes && product.sizes.length > 0
                        ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                            {product.sizes.map((size) => (
                              <Chip
                                key={size}
                                label={size}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: '20px',
                                  bgcolor: '#f0f0f0',
                                  border: '1px solid #ddd',
                                  m: 0.2
                                }}
                              />
                            ))}
                          </Box>
                        )
                        : <Typography variant="body2" color="text.secondary">-</Typography>
                    )
                  }
                </StyledTableCell>

                <StyledTableCell align="center">
                  <img src={product.image} alt="" style={{ height: "80px" }} />
                </StyledTableCell>

                <StyledTableCell align="left">
                  {product.category}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <TextField
                    type="number"
                    size="small"
                    value={product.discount || 0}
                    InputProps={{ 
                      inputProps: { 
                        min: 0, 
                        max: 100,
                        style: { textAlign: 'center' }
                      }
                    }}
                    sx={{ width: '80px' }}
                    onChange={async (e) => {
                      const value = Math.min(100, Math.max(0, e.target.value));
                      try {
                        const productRef = doc(db, "products", product.id);
                        await updateDoc(productRef, {
                          discount: Number(value)
                        });
                        setIsChange(true);
                      } catch (error) {
                        console.error("Error al actualizar descuento:", error);
                      }
                    }}
                  />
                </StyledTableCell>

                <StyledTableCell align="center">
                  <Checkbox
                    checked={product.destacado || false}
                    onChange={async (e) => {
                      try {
                        const productRef = doc(db, "products", product.id);
                        await updateDoc(productRef, {
                          destacado: e.target.checked
                        });
                        setIsChange(true);
                        
                        // Si el producto se marca como destacado, enviar newsletter
                        if (e.target.checked) {
                          const newsletterRef = collection(db, "newsletter");
                          const newsletterSnapshot = await getDocs(newsletterRef);
                          
                          // Obtener todos los emails suscritos
                          const subscribers = newsletterSnapshot.docs.map(doc => doc.data().email);
                          
                          // Guardar registro de envío para cada suscriptor
                          const newsletterLogRef = collection(db, "newsletterLog");
                          subscribers.forEach(async (email) => {
                            await addDoc(newsletterLogRef, {
                              email,
                              productId: product.id,
                              sentAt: new Date()
                            });
                          });
                        }
                      } catch (error) {
                        console.error("Error al actualizar producto:", error);
                      }
                    }}
                  />
                </StyledTableCell>

                <StyledTableCell align="center">
                  {product.variants && product.variants.length > 0
                    ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        {product.variants.map((variant, idx) => (
                          <Chip
                            key={variant.sku || idx}
                            label={variant.sku || '-'}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: '20px',
                              bgcolor: '#e0e0e0',
                              border: '1px solid #bbb',
                              m: 0.2
                            }}
                          />
                        ))}
                      </Box>
                    )
                    : <Typography variant="body2" color="text.secondary">-</Typography>
                  }
                </StyledTableCell>

                <StyledTableCell align="center">
                <Tooltip title="Editar artículo">
                  <IconButton onClick={() => handleOpen(product)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  </Tooltip>
                  {/* tengo que consultar si realmente desea eliminar */}
                  <Tooltip title="Eliminar artículo">
                  <IconButton
                    onClick={() => deleteProduct(product.id, product.code)}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.04)'
                      }
                    }}
                  >
                    <DeleteForeverIcon  />
                  </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            {productSelected ? "Modificar Artículo" : "Agregar Nuevo Artículo"}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Divider />
          </Box>

          <ProductsForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            productSelected={productSelected}
            setProductSelected={setProductSelected}
            categories={categories}
            showNotification={showNotification}
          />
        </Box>
      </Modal>

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
    </div>
  );
};

export default ProductsList;
