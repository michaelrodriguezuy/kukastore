import { useContext, useEffect } from "react";
import { useState } from "react";
import { db, uploadFile } from "../../../config/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import ProductsList from "./ProductsList";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Modal,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Container,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; 
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { MenuItem, Select, LinearProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";

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

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [shipments, setShipments] = useState([]);
  const [currentShipmentId, setCurrentShipmentId] = useState("");
  const [currentShipmentName, setCurrentShipmentName] = useState("");
  const [currentShipmentDescription, setCurrentShipmentDescription] =
    useState("");
  const [currentShipmentCost, setCurrentShipmentCost] = useState(0);
  const [openModalShipment, setOpenModalShipment] = useState(false);
  const [isUES, setIsUES] = useState(false);

  const [forceUpdate, setForceUpdate] = useState(false);

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openModalCategory, setOpenModalCategory] = useState(false);

  const { getFormatCurrency } = useContext(CartContext);

  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

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

  useEffect(() => {
    setIsChange(false);
    let productsCollection = collection(db, "products");
    getDocs(productsCollection).then((res) => {
      const newArr = res.docs.map((product) => {
        return {
          ...product.data(),
          id: product.id,
        };
      });
      setProducts(newArr);
    });
  }, [isChange]);

  useEffect(() => {
    const fetchShipments = async () => {
      const shipmentCollection = collection(db, "shipment");
      const querySnapshot = await getDocs(shipmentCollection);
      const shipmentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        cost: doc.data().cost,
      }));
      setShipments(shipmentList);
    };

    fetchShipments();
  }, [forceUpdate]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configDocRef = doc(db, "Config", "shipmentConfig");
        const configDoc = await getDoc(configDocRef);
        if (configDoc.exists()) {
          setIsUES(configDoc.data().isUES || false);
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error);
      }
    };
    
    fetchConfig();
  }, []);

  const updateShipment = async () => {
    try {
           
      // Solo continuar con la actualización/creación de envío si hay un nombre
      if (currentShipmentName.trim()) {
        if (currentShipmentId) {
          await updateDoc(doc(db, "shipment", currentShipmentId), {
            name: currentShipmentName,
            description: currentShipmentDescription,
            cost: currentShipmentCost,
          });
          showNotification(`El método de envío "${currentShipmentName}" ha sido actualizado`);
        } else {
          const newShipmentRef = await addDoc(collection(db, "shipment"), {
            name: currentShipmentName,
            description: currentShipmentDescription || "Descripción",
            cost: currentShipmentCost,
          });

          setShipments((prevShipments) => [
            ...prevShipments,
            {
              id: newShipmentRef.id,
              name: currentShipmentName,
              description: currentShipmentDescription,
              cost: currentShipmentCost,
            },
          ]);
          showNotification(`El método de envío "${currentShipmentName}" ha sido creado`);
        }
        clearModalShipment();
      } else if (!currentShipmentId) {
        showNotification('El nombre del método de envío es requerido', 'error');
      }
      setForceUpdate((prev) => !prev);
    } catch (error) {
      console.error("Error al actualizar/crear el envío:", error);
      showNotification('Error al guardar el método de envío', 'error');
    }
  };

  const clearModalShipment = () => {
    setOpenModalShipment(false);
    setCurrentShipmentId("");
    setCurrentShipmentName("");
    setCurrentShipmentDescription("");
    setCurrentShipmentCost(0);
  };

  const handleEditClick = (shipment) => {
    setCurrentShipmentId(shipment.id);
    setCurrentShipmentName(shipment.name);
    setCurrentShipmentDescription(shipment.description);
    setCurrentShipmentCost(shipment.cost);
    setOpenModalShipment(true);
  };

  const handleUESChange = async (checked) => {
    try {
      setIsUES(checked);
      await setDoc(doc(db, "Config", "shipmentConfig"), {
        isUES: checked
      }, { merge: true });
      showNotification(`Envíos UES ${checked ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error("Error al actualizar configuración UES:", error);
      setIsUES(!checked); // Revertir el cambio en la UI
      showNotification('Error al actualizar la configuración UES', 'error');
    }
  };

  useEffect(() => {
    const categoriesCollection = collection(db, "categories");
    const q = query(categoriesCollection);
    getDocs(q).then((querySnapshot) => {
      const categoryList = [];
      querySnapshot.forEach((doc) => {
        categoryList.push({ id: doc.id, ...doc.data() });
      });
      setCategories(categoryList);
    });
  }, []);

  const updateCategory = async () => {
    try {
      if (selectedCategory) {
        const categoryDocRef = doc(db, "categories", selectedCategory);
        await updateDoc(categoryDocRef, {
          name: category,
          img: imageUrl,
        });

        const updatedCategories = categories.map((c) => {
          if (c.id === selectedCategory) {
            return { ...c, name: category, img: imageUrl};
          }
          return c;
        });

        setCategories(updatedCategories);
        showNotification(`La categoría ${category} ha sido actualizada`);
      } else {
        const categoryCollection = collection(db, "categories");
        const newCategoryRef = await addDoc(categoryCollection, {
          name: category,
          img: imageUrl,
        });

        setCategories((prevCategories) => [
          ...prevCategories,
          { id: newCategoryRef.id, name: category, img: imageUrl },
        ]);
        showNotification(`La categoría ${category} ha sido creada`);
      }

      handleCloseCategory();
    } catch (error) {
      console.error("Error al actualizar/crear la categoría:", error);
      showNotification('Error al guardar la categoría', 'error');
    }
  };

  const handleCloseCategory = () => {
    setOpenModalCategory(false);

    setCategory("");
    setSelectedCategory(null);
    setImageUrl("");
    setFile(null);
    setIsLoading(false);
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleImage = async () => {
    console.log("cargando imagen");
    setIsLoading(true);

    try {
      const url = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      console.log("url cargada", url);
      setImageUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setFile(null);
  };

  const handleDeleteShipment = async (shipment) => {
    try {
      setOpenModalShipment(false);
      
      const result = await Swal.fire({
        title: `¿Eliminar el método de envío "${shipment.name}"?`,
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1e1e1e",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, "shipment", shipment.id));
        setShipments(prevShipments => prevShipments.filter(s => s.id !== shipment.id));
        showNotification(`El método de envío "${shipment.name}" ha sido eliminado`);
      } else {
        setOpenModalShipment(true);
      }
    } catch (error) {
      console.error("Error al eliminar el envío:", error);
      showNotification('Error al eliminar el método de envío', 'error');
      setOpenModalShipment(true);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 4, 
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          Panel de Administración
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                height: '100%'
              }}>
                <ShoppingBasketIcon sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Órdenes de Compra
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Gestiona las órdenes de compra de tus clientes
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Link to="/dashboard/orders" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" sx={{
                  bgcolor: '#1e1e1e',
                  '&:hover': { bgcolor: '#333' },
                  alignSelf: 'flex-start'
                }} fullWidth>
                      Ver Órdenes
                    </Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                height: '100%'
              }}>
                <CategoryIcon sx={{ fontSize: 40,  mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Categorías
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Administra las categorías de tus productos
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                <Button variant="contained" 
                sx={{
                  bgcolor: '#1e1e1e',
                  '&:hover': { bgcolor: '#333' },
                  alignSelf: 'flex-start'
                }} 
                onClick={() => setOpenModalCategory(true)}
                fullWidth>
                  
                    Gestionar Categorías
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                height: '100%'
              }}>
                <LocalShippingIcon sx={{ fontSize: 40,  mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Envíos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configura las opciones de envío y retiro
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => setOpenModalShipment(true)}
                    sx={{
                      bgcolor: '#1e1e1e',
                      '&:hover': { bgcolor: '#333' },
                      alignSelf: 'flex-start'
                    }}
                  >
                    Gestionar Envíos
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Modal
          open={openModalShipment}
          onClose={clearModalShipment}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Gestión de Retiros/Envíos
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Paper 
              elevation={3} 
              sx={{ 
                
                mb: 3,
                maxHeight: "40vh",
                overflow: "auto",
                borderRadius: 2
              }}
            >
              <List sx={{ width: "100%" }}>
                {shipments.map((shipment) => (
                  <ListItem 
                    key={shipment.id} 
                    divider
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {shipment.name}
                          </Typography>
                        }
                        secondary={shipment.description}
                      />
                    </Box>
                    <Typography 
                      variant="body1" 
                      
                      sx={{ 
                        mx: 2,
                        fontWeight: 500
                      }}
                    >
                      {getFormatCurrency(parseFloat(shipment.cost))}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar retiro">
                        <IconButton 
                          edge="end" 
                          aria-label="edit" 
                          onClick={() => handleEditClick(shipment)}
                          
                        >
                          <EditIcon color="primary"/>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar retiro">
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleDeleteShipment(shipment)}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.04)'
                            }
                          }}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
            
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                {currentShipmentId ? "Modificar retiro" : "Agregar nuevo retiro"}
              </Typography>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nombre del retiro"
                  value={currentShipmentName}
                  onChange={(e) => setCurrentShipmentName(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Descripción"
                  value={currentShipmentDescription}
                  onChange={(e) => setCurrentShipmentDescription(e.target.value)}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Costo"
                  type="number"
                  value={currentShipmentCost}
                  onChange={(e) => setCurrentShipmentCost(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>$</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isUES} 
                  onChange={(e) => handleUESChange(e.target.checked)}
                  color="primary"
                  sx={{
                    '&:hover': { bgcolor: 'primary.light' },
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                  {isUES ? "Deshabilitar el uso de envíos UES" : "Habilitar el uso de envíos UES"}
                </Typography>
              }
              sx={{ mb: 3 }}
            />
            
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={clearModalShipment}
                sx={{ 
                  flex: 1,
                  color: '#1e1e1e',
                  borderColor: '#1e1e1e',
                  
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={updateShipment} 
                
                sx={{
                  flex: 1,
                  bgcolor: '#1e1e1e',
                  '&:hover': { bgcolor: '#333' },
                  alignSelf: 'flex-start'
                }}
              >
                {currentShipmentId ? "Modificar" : "Crear"} Retiro
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal
          open={openModalCategory}
          onClose={handleCloseCategory}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{...style,
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Gestión de Categorías
            </Typography>
            
            <Divider sx={{ mb: 3 }} />

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Selecciona una categoría</InputLabel>
                <Select
                  value={selectedCategory || ""}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    const selectedCat = categories.find(
                      (category) => category.id === e.target.value
                    );
                    if (selectedCat) {
                      setCategory(selectedCat.name || "");
                      setImageUrl(selectedCat.img || "");
                    } else {
                      setCategory("");
                      setImageUrl("");
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Crear nueva categoría</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {category.img && (
                          <Box
                            component="img"
                            src={category.img}
                            alt={category.name}
                            sx={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 1 }}
                          />
                        )}
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={selectedCategory ? "Modificar categoría" : "Nueva categoría"}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                variant="outlined"
                sx={{ mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Imagen de la categoría
                </Typography>
                <Box
                  sx={{
                    border: '1px dashed grey',
                    borderRadius: 1,
                    p: 2,
                    textAlign: 'center',
                    mb: 2,
                    position: 'relative'
                  }}
                >
                  {imageUrl ? (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Box
                        component="img"
                        src={imageUrl}
                        alt="Preview"
                        sx={{
                          maxWidth: '100%',
                          height: 'auto',
                          maxHeight: 200,
                          borderRadius: 1,
                          mb: 2
                        }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No hay imagen seleccionada
                    </Typography>
                  )}
                  
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ 
                      mb: 1,
                      color: '#1e1e1e',
                      borderColor: '#1e1e1e',
                    }}
                  >
                    Seleccionar Imagen
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </Button>
                </Box>

                {file && (
                  <>
                    {isLoading ? (
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            mb: 1,
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#1e1e1e'
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" align="center">
                          Subiendo imagen... {uploadProgress}%
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleImage}
                        fullWidth
                        disabled={!file}
                        sx={{
                          bgcolor: '#1e1e1e',
                          '&:hover': { bgcolor: '#333' }
                        }}
                      >
                        Cargar imagen
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleCloseCategory}
                sx={{ 
                  flex: 1,
                  color: '#1e1e1e',
                  borderColor: '#1e1e1e',
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={updateCategory}
                disabled={!category || (!imageUrl && !file)}
                sx={{ 
                  flex: 1,
                  bgcolor: '#1e1e1e',
                  '&:hover': { bgcolor: '#333' }
                }}
              >
                {selectedCategory ? "Modificar" : "Crear"} Categoría
              </Button>
            </Box>
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

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3,
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              mb: 3,
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Listado de Productos
          </Typography>
          <ProductsList
            products={products}
            categories={categories}
            setIsChange={setIsChange}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
