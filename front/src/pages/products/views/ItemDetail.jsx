import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../config/firebase";
import {
  collection,
  getDoc,
  doc,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import {
  Button,
  Grid,
  IconButton,
  Typography,
  Container,
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
} from "@mui/material";
import { CartContext } from "../../../context/CartContext";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Swal from "sweetalert2";
import ColorCircle from '../../../components/common/ColorCircle';
import { alpha } from "@mui/material/styles";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { getFormatCurrency } from '../../../utils/formatCurrency';
import { Link } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ProductCard from '../../../components/common/ProductCard/ProductCard';
import '../../../styles/pages/ItemDetail.css';

const ItemDetail = () => {
  const { id } = useParams();
  const { addItem, getQuantityById } = useContext(CartContext);
  let quantity = getQuantityById(id);
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [contador, setContador] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const [colorSelected, setColorSelected] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  // para mostrar en grande la imagen seleccionada
  const [selectedImage, setSelectedImage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const customBlack = alpha("#000", 0.8); //color

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [openZoom, setOpenZoom] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reiniciar color y talle cuando cambie el producto
  useEffect(() => {
    setSelectedColor(null);
    setColorSelected(false);
    setSelectedSize(null);
  }, [id]);

  const tieneStock = (product) => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.some((variant) => variant.stock > 0);
    }
    return product.stock > 0;
  };

  useEffect(() => {
    const getProduct = async () => {
      try {
        const productRef = doc(db, "products", id);
        const productSnapshot = await getDoc(productRef);

        if (productSnapshot.exists()) {
          const productData = productSnapshot.data();
          console.log('Datos originales:', productData.image); // Ver datos originales
         
          // Asegurarnos de que image sea siempre un array
          const imageArray = Array.isArray(productData.image) 
            ? productData.image.filter(img => img && img.trim() !== '')
            : [productData.image].filter(img => img && img.trim() !== '');

          console.log('Array filtrado:', imageArray); 

          setProduct({
            id: productSnapshot.id,
            ...productData,
            image: imageArray
          });

          if (imageArray.length > 0) {
            setSelectedImage(0);
          }

          // Si el producto tiene código, buscar variantes de color
          if (productData.code) {
            const variantsQuery = query(
              collection(db, "products"),
              where("code", "==", productData.code)
            );
            const variantsSnapshot = await getDocs(variantsQuery);
            const variants = variantsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            setColorVariants(variants);
            
            // Si solo hay una variante, seleccionarla automáticamente
            if (variants.length <= 1) {
              setSelectedColor(productData.color);
              setColorSelected(true);
            }
          } else {
            // Si no tiene código, mostrar solo su color
            setColorVariants([]);
            setSelectedColor(productData.color);
            setColorSelected(true);
          }

          // Consulta para productos relacionados
          const relatedQuery = query(
            collection(db, "products"),
            where("category", "==", productData.category)
          );

          const relatedSnapshot = await getDocs(relatedQuery);
          const filteredRelated = relatedSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(prod => prod.id !== id)
            .filter(tieneStock);

          setRelatedProducts(filteredRelated);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    getProduct();
  }, [id]);

  // Resetear el contador cada vez que se cambia talle o color
  useEffect(() => {
    setContador(1);
  }, [selectedSize, selectedColor]);

  // Cuando cambie el producto seleccionado (por cambio de color), actualizar la imagen seleccionada
  useEffect(() => {
    if (product && product.image && product.image.length > 0) {
      setSelectedImage(0);
    }
  }, [product]); // Este efecto se ejecutará cuando cambie el producto

  // Helpers para variantes (flujo talle -> color)
  const getAvailableSizes = () => {
    if (product && Array.isArray(product.variants) && product.variants.length > 0) {
      // Solo talles con al menos una variante con stock > 0
      return [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))];
    }
    return product?.sizes || [];
  };

  const getAvailableColors = () => {
    if (product && Array.isArray(product.variants) && product.variants.length > 0 && selectedSize) {
      // Solo colores con stock > 0 para el talle seleccionado
      return [...new Set(product.variants.filter(v => v.size === selectedSize && v.stock > 0).map(v => v.color))];
    }
    return [];
  };

  const getVariantStock = () => {
    console.log("Buscando stock para Talle:", selectedSize, "Color:", selectedColor);
    if (product && Array.isArray(product.variants) && product.variants.length > 0 && selectedSize && selectedColor) {
      console.log("Variantes disponibles:", product.variants);
      const variant = product.variants.find(v => {
        console.log("Comparando:", v.size, "vs", selectedSize, "y", v.color, "vs", selectedColor);
        return v.size === selectedSize && v.color === selectedColor;
      });
      console.log("Variante encontrada:", variant);
      return variant ? variant.stock : 0;
    }
    console.log("Fallback a stock global:", product?.stock);
    return product?.stock || 0;
  };

  // Cambiar sumar/restar para variantes
  const sumar = () => {
    const maxStock = getVariantStock();
    if (contador < maxStock) {
      setContador(contador + 1);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Artículo",
        text: "No hay más stock",
        confirmButtonText: "Ok",
      });
    }
  };

  const restar = () => {
    if (contador <= getVariantStock() && contador > 1) {
      setContador(contador - 1);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Artículo",
        text: "Al menos debes agregar 1 artículo",
        confirmButtonText: "Ok",
      });
    }
  };

  // Cambiar agregarAlCarrito para variantes
  const agregarAlCarrito = () => {
    // Si hay variantes, validar selección
    if (product && Array.isArray(product.variants) && product.variants.length > 0) {
      if (!selectedSize) {
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Por favor, selecciona un talle antes de agregar al carrito.',
        });
        return;
      }
      if (!selectedColor) {
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Por favor, selecciona un color antes de agregar al carrito.',
        });
        return;
      }
      if (getVariantStock() < 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin stock',
          text: 'No hay stock para la variante seleccionada.',
        });
        return;
      }
      // Buscar la variante seleccionada y obtener su SKU
      const varianteSeleccionada = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
      // Excluir el campo variants del producto
      const { variants, ...productWithoutVariants } = product;
      let producto = {
        ...productWithoutVariants,
        color: selectedColor,
        size: selectedSize,
        quantity: contador,
        sku: varianteSeleccionada ? varianteSeleccionada.sku : undefined
      };
      addItem(producto);
      return;
    }
    // Si no hay variantes, lógica vieja
    if (!selectedSize && product.sizes?.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor, selecciona un talle antes de agregar al carrito.',
      });
      return;
    }
    if (product) {
      // Excluir el campo variants del producto simple también por consistencia
      const { variants, ...productWithoutVariants } = product;
      let producto = {
        ...productWithoutVariants,
        color: selectedColor,
        size: selectedSize,
        quantity: contador,
        sku: product.code // Para productos simples, el sku es el code
      };
      addItem(producto);
    }
  };

  const handleCartClick = () => {
    if (relatedProducts.length > 1 && !colorSelected) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor, selecciona un color antes de agregar al carrito.',
      });
      return;
    }
    
    agregarAlCarrito();
  };

  const getColorByName = (colorName) => {
    const colorMap = {
      rojo: "#FF0000",
      azul: "#0000FF",
      verde: "#00FF00",
      amarillo: "#FFFF00",
      naranja: "#FFA500",
      violeta: "#EE82EE",
      rosa: "#FFC0CB",
      marron: "#8B4513",
      gris: "#808080",
      blanco: "#FFFFFF",
      negro: "#000000",
      dorado: "#dbb845",
      plata: "#dededc",
      fuscia: "#dd0f71",
      celeste: "#00FFFF",
    };
    colorName = colorName.toLowerCase();
    return colorMap[colorName] || colorName;
  };

  const handleImageClick = (image, index) => {
    setModalImage(image);
    setModalOpen(true);
    setSelectedImage(index); // Guardamos el índice de la imagen seleccionada
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // No necesitamos resetear selectedImage aquí
  };

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleOpenZoom = () => {
    setOpenZoom(true);
  };

  const handleCloseZoom = () => {
    setOpenZoom(false);
  };

  return (
    <>
      {/* Título y Breadcrumb */}
      <Box sx={{ paddingTop: '20px' }}>
        <Box 
          sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            py: 2.5,
            px: 2,
            width: '100%',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              height: '40px'
            }}>
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
              >
                <MuiLink 
                  component={Link} 
                  to="/"
                  underline="none"
                  color="inherit"
                >
                  Inicio
                </MuiLink>
                <MuiLink 
                  component={Link} 
                  to="/shop"
                  underline="none"
                  color="inherit"
                >
                  Tienda
                </MuiLink>
                {product && (
                  <Typography color="text.primary">
                    {product.title}
                  </Typography>
                )}
              </Breadcrumbs>
            </Box>
          </Container>
        </Box>

        {/* Contenido principal */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Grid container spacing={6}>
            {/* Columna izquierda - Imágenes */}
            {product && (
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', gap: 3, position: 'relative' }}>
                  {/* Miniaturas verticales */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {product.image.map((img, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={img}
                        alt={`${product.title} - ${index + 1}`}
                        sx={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: index === selectedImage ? '2px solid #1976d2' : '2px solid transparent',
                          borderRadius: '4px'
                        }}
                        onClick={() => handleThumbnailClick(index)}
                      />
                    ))}
                  </Box>
                  
                  {/* Imagen principal */}
                  <Box
                    sx={{
                      position: 'relative',
                      flex: 1
                    }}
                  >
                    <Box className="main-image-container">
                      {imageLoading && (
                        <Skeleton 
                          variant="rectangular" 
                          width="100%" 
                          height="100%"
                          animation="wave"
                        />
                      )}
                      <img
                        src={product.image[selectedImage]}
                        alt={product.title}
                        className="main-image"
                        onLoad={handleImageLoad}
                        onClick={handleOpenZoom}
                        style={{ 
                          display: imageLoading ? 'none' : 'block',
                          cursor: 'zoom-in' 
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Columna derecha - Información */}
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 2 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 2 
                  }}
                >
                  {product && product.title}
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  {product && (product.discount ? (
                    <>
                      <Typography 
                        variant="h5" 
                        component="span" 
                        sx={{ 
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                          mr: 2
                        }}
                      >
                        {getFormatCurrency(product.unit_price)}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        component="span" 
                        color="error"
                        sx={{ fontWeight: 500 }}
                      >
                        {getFormatCurrency(product.unit_price - (product.unit_price * product.discount / 100))}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="error"
                        sx={{ mt: 1 }}
                      >
                        {product.discount}% OFF
                      </Typography>
                    </>
                  ) : (
                    <Typography 
                      variant="h4" 
                      sx={{ fontWeight: 500 }}
                    >
                      {getFormatCurrency(product.unit_price)}
                    </Typography>
                  ))}
                </Box>

                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 2, 
                    mb: 4,
                    lineHeight: 1.6 
                  }}
                >
                  {product && product.description}
                </Typography>

                {/* Selector de talle (primero) */}
                {product && Array.isArray(product.variants) && product.variants.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Talles disponibles:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 1,
                      flexWrap: 'wrap'
                    }}>
                      {getAvailableSizes().map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "contained" : "outlined"}
                          onClick={() => {
                            setSelectedSize(size);
                            setSelectedColor(null); // Resetear color al cambiar talle
                            setColorSelected(false); // Opcional: resetear colorSelected
                          }}
                          sx={{
                            minWidth: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            borderColor: selectedSize === size ? 'black' : '#e0e0e0',
                            color: selectedSize === size ? 'white' : 'black',
                            backgroundColor: selectedSize === size ? 'black' : 'transparent',
                            fontWeight: selectedSize === size ? 700 : 400,
                            '&:hover': {
                              backgroundColor: selectedSize === size ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.04)',
                              borderColor: 'black'
                            }
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Selector de colores (segundo, depende del talle) */}
                {product && Array.isArray(product.variants) && product.variants.length > 0 && selectedSize && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Colores disponibles:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {getAvailableColors().map((color) => (
                        <ColorCircle
                          key={color}
                          colorCode={getColorByName(color)}
                          setSelectedColor={() => {
                            setSelectedColor(color);
                            setColorSelected(true);
                          }}
                          selectedColor={selectedColor}
                          productID={product.id}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Si no hay variantes, renderizado clásico */}
                {product && (!Array.isArray(product.variants) || product.variants.length === 0) && product.sizes && product.sizes.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Talles disponibles:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 1,
                      flexWrap: 'wrap'
                    }}>
                      {product.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "contained" : "outlined"}
                          onClick={() => setSelectedSize(size)}
                          sx={{
                            minWidth: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            borderColor: selectedSize === size ? 'black' : '#e0e0e0',
                            color: selectedSize === size ? 'white' : 'black',
                            backgroundColor: selectedSize === size ? 'black' : 'transparent',
                            fontWeight: selectedSize === size ? 700 : 400,
                            '&:hover': {
                              backgroundColor: selectedSize === size ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.04)',
                              borderColor: 'black'
                            }
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Contador y botón de agregar al carrito */}
                {product && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 2,
                    p: 3,
                    mb: 3
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      backgroundColor: 'white'
                    }}>
                      <IconButton onClick={restar}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="h6" sx={{ mx: 3 }}>
                        {contador}
                      </Typography>
                      <IconButton onClick={sumar}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleCartClick}
                      sx={{ 
                        flex: 1,
                        bgcolor: 'black',
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)'
                        }
                      }}
                      disabled={Array.isArray(product?.variants) && product.variants.length > 0 && (!selectedSize || !selectedColor)}
                    >
                      Agregar al carrito
                    </Button>
                  </Box>
                )}

                {/* Stock, mostrar el stock de la variante seleccionada o global */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  {product && Array.isArray(product.variants) && product.variants.length > 0
                    ? (selectedSize && selectedColor
                        ? `Stock disponible: ${getVariantStock()}`
                        : 'Selecciona talle y color')
                    : `Stock disponible: ${getVariantStock()}`}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Modal para imagen ampliada */}
          {product && (
            <Modal
              open={modalOpen}
              onClose={handleCloseModal}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  '& img': {
                    maxWidth: '100%',
                    maxHeight: '90vh',
                    objectFit: 'contain'
                  }
                }}
              >
                <IconButton
                  onClick={handleCloseModal}
                  sx={{
                    position: 'absolute',
                    right: -40,
                    top: -40,
                    color: 'white'
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <img 
                  src={modalImage} 
                  alt={product ? product.title : ''} 
                />
              </Box>
            </Modal>
          )}

          <Snackbar 
            open={snackbarOpen} 
            autoHideDuration={6000} 
            onClose={handleSnackbarClose}
          >
            <MuiAlert 
              onClose={handleSnackbarClose} 
              severity="warning" 
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </MuiAlert>
          </Snackbar>
        </Container>
      </Box>

      {/* Sección de productos relacionados */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Productos relacionados
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {relatedProducts.slice(0, 4).map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            component={Link} 
            to="/shop"
            variant="outlined" 
            sx={{ 
              minWidth: 200,
              borderColor: 'text.primary',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'text.primary',
                backgroundColor: 'transparent'
              }
            }}
          >
            Ver más
          </Button>
        </Box>
      </Container>

      {/* Modal para zoom */}
      {product && (
        <Modal
          open={openZoom}
          onClose={handleCloseZoom}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 1,
            outline: 'none'
          }}>
            <img
              src={product.image[selectedImage]}
              alt={product.title}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        </Modal>
      )}
    </>
  );
};

export default ItemDetail;
