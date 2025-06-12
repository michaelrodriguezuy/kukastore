import { useContext, useState } from "react";
import { db, uploadFile } from "../../../config/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ProductsForm = ({
  handleClose,
  setIsChange,
  productSelected,
  setProductSelected,
  categories,
  showNotification
}) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newSize, setNewSize] = useState('');

  //codigo para el manejo de variantes
  const [useVariants, setUseVariants] = useState(Array.isArray(productSelected?.variants) && productSelected.variants.length > 0);
  const [variants, setVariants] = useState(productSelected?.variants || [] );

  const [variantColor, setVariantColor] = useState('');
const [variantSize, setVariantSize] = useState('');
const [variantStock, setVariantStock] = useState('');

  const [newProduct, setNewProduct] = useState({
    title: productSelected?.title || "",
    description: productSelected?.description || "",
    unit_price: productSelected?.unit_price || "",
    stock: productSelected?.stock || "",
    category: productSelected?.category || "",
    code: productSelected?.code || "",
    color: productSelected?.color || "",
    image: Array.isArray(productSelected?.image) ? productSelected.image : 
           productSelected?.image ? [productSelected.image] : [],
    destacado: productSelected?.destacado || false,
    discount: productSelected?.discount || 0,
    sizes: productSelected?.sizes || [],
  });

  const handleImage = async () => {
    setIsLoading(true);
    try {
      const uploadPromises = files.map(file => 
        uploadFile(file, (progress) => {
          setUploadProgress(progress);
        })
      );

      const urls = await Promise.all(uploadPromises);
      setNewProduct(prev => ({
        ...prev,
        image: [...prev.image, ...urls]
      }));
      setFiles([]);
      setIsLoading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error al cargar las imágenes:", error);
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewProduct(prev => ({
      ...prev,
      image: prev.image.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleAddSize = () => {
    if (newSize.trim() !== '' && !newProduct.sizes.includes(newSize.trim())) {
      setNewProduct(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productsCollection = collection(db, "products");

    // Construir el objeto a guardar según si hay variantes o no
    let dataToSave = {
      ...newProduct,
      image: newProduct.image,
      destacado: newProduct.destacado,
      discount: newProduct.discount,
      // ...otros campos que quieras mantener
    };

    if (useVariants) {
      dataToSave.variants = variants;
      // Elimina campos simples innecesarios
      delete dataToSave.stock;
      delete dataToSave.color;
      delete dataToSave.sizes;
    } else {
      // Elimina variantes si no se usan
      delete dataToSave.variants;
    }

    try {
      if (productSelected) {
        const productRef = doc(db, "products", productSelected.id);
        await updateDoc(productRef, dataToSave);
        setIsChange(true);
        handleClose();
        setProductSelected(null);
        showNotification(`El artículo ${dataToSave.title} ha sido actualizado`);
      } else {
        await addDoc(productsCollection, dataToSave);
        setIsChange(true);
        handleClose();
        setProductSelected(null);
        showNotification(`El artículo ${dataToSave.title} ha sido creado`);
      }
    } catch (error) {
      console.error("Error al guardar el artículo:", error);
      showNotification('Hubo un problema al guardar el artículo', 'error');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Código"
                  value={newProduct.code}
                  onChange={(e) => {
                    const cleanCode = e.target.value.replace(/\s+/g, '');
                    setNewProduct({ ...newProduct, code: cleanCode });
                  }}
                  fullWidth
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1e1e1e',
                      },
                    },
                  }}
                />
                <TextField
                  label="Título"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  fullWidth
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1e1e1e',
                      },
                    },
                  }}
                />
                <TextField
                  label="Descripción"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1e1e1e',
                      },
                    },
                  }}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={newProduct.category}
                    label="Categoría"
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    required
                    sx={{
                      '&:hover fieldset': {
                        borderColor: '#1e1e1e',
                      },
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Detalles del Producto
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Precio"
                  type="number"
                  value={newProduct.unit_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit_price: +e.target.value })
                  }
                  fullWidth
                  required
                  size="small"
                  InputProps={{
                    startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>$</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1e1e1e',
                      },
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useVariants}
                      onChange={e => setUseVariants(e.target.checked)}
                    />
                  }
                  label="¿Este artículo tiene variantes (color/talle/stock)?"
                />

                {useVariants ? (
                  <>
                    {/* Formulario para agregar una variante */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <TextField
                        label="Color"
                        value={variantColor}
                        onChange={e => setVariantColor(e.target.value)}
                        size="small"
                        sx={{ minWidth: 100 }}
                      />
                      <TextField
                        label="Talle"
                        value={variantSize}
                        onChange={e => setVariantSize(e.target.value)}
                        size="small"
                        sx={{ minWidth: 100 }}
                      />
                      <TextField
                        label="Stock"
                        type="number"
                        value={variantStock}
                        onChange={e => setVariantStock(e.target.value)}
                        size="small"
                        inputProps={{ min: 0 }}
                        sx={{ minWidth: 80 }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (variantColor || variantSize) {
                            const sku = `${newProduct.code}-${variantSize}-${variantColor}`;
                            setVariants([
                              ...variants,
                              { color: variantColor, size: variantSize, stock: Number(variantStock), sku }
                            ]);
                            setVariantColor('');
                            setVariantSize('');
                            setVariantStock('');
                          }
                        }}
                        sx={{ bgcolor: '#1e1e1e', '&:hover': { bgcolor: '#333' }, minWidth: 40 }}
                      >
                        <AddIcon />
                      </Button>
                    </Box>

                    {/* Tabla de variantes agregadas */}
                    {variants.length > 0 ? (
                      <Box sx={{ mb: 2, overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 500, border: '1px solid #eee' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Color</TableCell>
                              <TableCell>Talle</TableCell>
                              <TableCell>Stock</TableCell>
                              <TableCell>SKU</TableCell>
                              <TableCell align="center">Acción</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {variants.map((v, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{v.color || '-'}</TableCell>
                                <TableCell>{v.size || '-'}</TableCell>
                                <TableCell>{v.stock}</TableCell>
                                <TableCell>{v.sku}</TableCell>
                                <TableCell align="center">
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                                  >
                                    Eliminar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No hay variantes agregadas.
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    {/* Solo muestra el sistema simple si el producto es genérico */}
                    <TextField
                      label="Stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: +e.target.value })
                      }
                      fullWidth
                      required
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1e1e1e',
                          },
                        },
                      }}
                    />
                  </>
                )}

                <TextField
                  label="Descuento %"
                  type="number"
                  value={newProduct.discount}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, discount: +e.target.value })
                  }
                  fullWidth
                  size="small"
                  InputProps={{
                    inputProps: { min: 0, max: 100 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1e1e1e',
                      },
                    },
                  }}
                />

                <Tooltip 
                  title="Los productos destacados aparecerán en el carrusel de la página principal y seran enviados por email a los suscriptores del newsletter"
                  placement="top"
                  arrow
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newProduct.destacado}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, destacado: e.target.checked })
                        }
                        sx={{
                          '&.Mui-checked': {
                            color: '#1e1e1e',
                          },
                        }}
                      />
                    }
                    label="Producto Destacado"
                  />
                </Tooltip>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Imágenes del Producto
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {newProduct.image.map((img, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          position: 'relative',
                          p: 1,
                          '&:hover .delete-button': {
                            opacity: 1
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt={`Imagen ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 1,
                            display: 'block'
                          }}
                        />
                        <IconButton
                          className="delete-button"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ 
                    mb: 1,
                    color: '#1e1e1e',
                    borderColor: '#1e1e1e',
                    '&:hover': {
                      borderColor: '#1e1e1e',
                    }
                  }}
                >
                  Seleccionar Imágenes
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    accept="image/*"
                  />
                </Button>
                {files.length > 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                    {files.length} {files.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                  </Typography>
                )}
              </Box>

              {files.length > 0 && (
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
                        Subiendo imágenes... {uploadProgress}%
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleImage}
                      fullWidth
                      sx={{
                        bgcolor: '#1e1e1e',
                        '&:hover': { bgcolor: '#333' }
                      }}
                    >
                      Cargar imágenes
                    </Button>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          <Button 
            onClick={() => {
              handleClose();
              setProductSelected(null);
            }}
            variant="outlined"
            sx={{ 
              color: '#1e1e1e',
              borderColor: '#1e1e1e',
              '&:hover': {
                borderColor: '#1e1e1e',
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#1e1e1e',
              '&:hover': { bgcolor: '#333' }
            }}
          >
            {productSelected ? "Modificar" : "Crear"} Artículo
          </Button>
        </Box>
      </form>
    </>
  );
};

export default ProductsForm;
