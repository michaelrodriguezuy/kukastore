import { useContext, useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import { getDocs, collection } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Typography,
  Pagination,
  Select,
  MenuItem,
  TextField,
  Container,
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Menu,
  Divider,
  Tooltip,
} from "@mui/material";

import { CartContext } from "../../../context/CartContext";

import { alpha } from "@mui/material/styles";
import ProductCard from "../../../components/common/ProductCard/ProductCard";
import { getFormatCurrency } from "../../../utils/formatCurrency";
import { customBlack } from "../../../utils/colors";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FilterListIcon from "@mui/icons-material/FilterList";
import BenefitsBar from "../../../components/common/BenefitsBar";

const ItemListContainer = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [anchorEl, setAnchorEl] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Cargar productos y categorías
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const querySnapshot = await getDocs(productsRef);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);

        // Extraer y filtrar categorías únicas
        const uniqueCategories = [
          ...new Set(
            productsData
              .map((product) => product.category)
              .filter((category) => category && category.trim() !== "")
          ),
        ].sort(); // Ordenar alfabéticamente
        setCategories(uniqueCategories);

        // Si hay término de búsqueda, resetear categoría
        if (searchTerm) {
          setSelectedCategory("Todas");
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };

    fetchProducts();
  }, []); // Solo se ejecuta al montar el componente

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
    handleFilterClose();
  };

  // Filtrar productos
  const filteredProducts = products
    .filter((product) => {
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        return product.variants.some((variant) => variant.stock > 0);
      }
      return product.stock > 0;
    })
    .filter((product) => {
      if (selectedCategory === "Todas") return true;
      return product.category === selectedCategory;
    })
    .filter((product) => {
      if (!searchTerm) return true;
      const searchFields = [
        product.title,
        product.description,
        product.category,
        product.code,
      ].map((field) => field?.toLowerCase() || "");

      return searchFields.some((field) => field.includes(searchTerm));
    });

  // Mantener productos únicos
  const uniqueProducts = Array.from(
    new Map(filteredProducts.map((product) => [product.code, product])).values()
  );

  const pageCount = Math.ceil(uniqueProducts.length / itemsPerPage);
  const displayedProducts = uniqueProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Si no hay resultados, mostrar mensaje
  if (searchTerm && filteredProducts.length === 0) {
    return (
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          marginTop: 5,
          marginBottom: 5,
        }}
      >
        No se encontraron productos que coincidan con "{searchTerm}"
      </Typography>
    );
  }

  return (
    <Box sx={{ paddingTop: "20px" }}>
      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          py: 0.5,
          px: 2,
          width: "100%",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "40px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title="Solo se muestran las categorías que tienen artículos">
                <Button
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterClick}
                  variant="outlined"
                  size="small"
                >
                  {selectedCategory === "Todas" ? "Filtros" : selectedCategory}
                </Button>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleFilterClose}
              >
                <MenuItem
                  onClick={() => handleCategorySelect("Todas")}
                  selected={selectedCategory === "Todas"}
                >
                  Todas las categorías
                </MenuItem>
                <Divider />
                {categories.map((category) => (
                  <MenuItem
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    selected={selectedCategory === category}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Menu>

              <Divider orientation="vertical" flexItem />

              <Typography variant="body2" color="text.secondary">
                Mostrando {currentPage * itemsPerPage + 1}-
                {Math.min(
                  (currentPage + 1) * itemsPerPage,
                  uniqueProducts.length
                )}{" "}
                de {uniqueProducts.length} resultados
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Mostrar</Typography>
              <TextField
                select
                size="small"
                value={itemsPerPage}
                onChange={(event) =>
                  setItemsPerPage(parseInt(event.target.value))
                }
                sx={{ width: 80 }}
              >
                <MenuItem value={16}>16</MenuItem>
                <MenuItem value={32}>32</MenuItem>
                <MenuItem value={48}>48</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mt: 1 }}
          >
            <MuiLink component={Link} to="/" underline="none" color="inherit">
              Inicio
            </MuiLink>
            <Typography color="text.primary">Tienda</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {displayedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
            mb: 4,
          }}
        >
          <Pagination
            count={pageCount}
            page={currentPage + 1}
            onChange={(event, page) => setCurrentPage(page - 1)}
            shape="rounded"
            showFirstButton
            showLastButton
            color="primary"
            size="large"
          />
        </Box>
      </Container>

      <BenefitsBar sx={{ mt: 2 }} />
    </Box>
  );
};

export default ItemListContainer;
