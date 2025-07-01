import EmblaCarousel from "../../components/ui/carousel/EmblaCarousel";

import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/Home.css";
import { Grid, Typography, Container, Button, Box } from "@mui/material";
import ProductCard from "../../components/common/ProductCard/ProductCard";

const Home = () => {
  const [destacados, setDestacados] = useState([]);
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  const tieneStock = (product) => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.some((variant) => variant.stock > 0);
    }
    return product.stock > 0;
  };

  useEffect(() => {
    const getDestacados = async () => {
      const q = query(
        collection(db, "products"),
        where("destacado", "==", true)
      );
      const querySnapshot = await getDocs(q);

      const productosDestacados = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(tieneStock);

      setDestacados(productosDestacados);
    };

    const getProductos = async () => {
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);

      const productosData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(tieneStock)
        .slice(0,8);

      setProductos(productosData);
    };

    getDestacados();
    getProductos();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/itemDetail/${id}`);
  };

  const OPTIONS = {
    dragFree: false,
    loop: true,
    align: "center",
  };

  return (
    <div className="home-container">
      {destacados.length > 0 && (
        <EmblaCarousel options={OPTIONS} destacados={destacados} />
      )}

      {/* Nuevo grid de productos */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            textAlign: "center",
            mb: 4,
            fontWeight: 500,
            color: "#1e1e1e",
          }}
        >
          Nuestros productos
        </Typography>

        <Grid container spacing={3}>
          {productos.map((producto) => (
            <Grid item xs={12} sm={6} md={3} key={producto.id}>
              <ProductCard product={producto} onClick={handleProductClick} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/shop")}
            sx={{
              bgcolor: "#1e1e1e",
              "&:hover": {
                bgcolor: "#333",
              },
            }}
          >
            VER MÁS
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
