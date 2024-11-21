import { useContext, useEffect, useState } from "react";
import { db } from "../../../fireBaseConfig";
import { getDocs, collection } from "firebase/firestore";

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
} from "@mui/material";

import { CartContext } from "../../../context/CartContext";

import { alpha } from "@mui/material/styles";

const ItemListContainer = () => {
  const [products, setProducts] = useState([]);
  const { getFormatCurrency } = useContext(CartContext);
  const itemsPerPage = 9;

  //esto lo hice para que no se muestren los productos que no tienen stock y tampoco se repitan los productos
  const filteredProducts = products.filter(product => product.stock > 0);
  const uniqueProducts = [];
  const codes = new Set();

  const customBlack = alpha("#000", 0.8); //color

  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let refCollectionCategories = collection(db, "categories");
    getDocs(refCollectionCategories).then((res) => {
      let categoriesList = res.docs.map((doc) => {
        return { ...doc.data(), id: doc.id };
      });

      setCategories(categoriesList);
    });

    let refCollection = collection(db, "products");
    getDocs(refCollection)
      .then((res) => {
        let productsList = res.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });

        setProducts(productsList);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    setCurrentPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setCurrentPage(0);
  };

  filteredProducts.forEach(product => {
    if (!codes.has(product.code)) {
      uniqueProducts.push(product);
      codes.add(product.code);
    }
  });

  const pageCount = Math.ceil(uniqueProducts.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(0);

  const displayedProducts = uniqueProducts
    .filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchInput.toLowerCase());
      const matchesCategory =
        categoryFilter === "todos" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <>
      {/* <Typography variant="h2" component="h3" sx={{ textAlign: "center", marginBottom: 3 }}>
        Tienda 
      </Typography> */}
      <Paper elevation={3} sx={{ padding: "20px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              id="search"
              label="Buscar artículo"
              variant="outlined"
              value={searchInput}
              onChange={handleSearchInputChange}
              fullWidth
              
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Select
              id="categoryFilter"
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              fullWidth
              variant="outlined"
              

            >
              <MenuItem value="todos">todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name} >
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} justifyContent="center" sx={{ marginX: -2, marginTop: 3 }}>
        {displayedProducts.map((product) => (
          <Grid
            item
            key={product.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            sx={{
              marginX: 2,
              mb: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card sx={{ width: 300 }}>
              <Link to={`/itemDetail/${product.id}`}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.image}
                    alt={product.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {product.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Link>
              <CardActions>
                <Button
                  size="large"
                  color="primary"
                  sx={{
                    color: customBlack,
                    fontSize: "32px",
                    height: "40px",
                    textTransform: "none",
                    fontWeight: "bold",
                    fontFamily: "'Caveat', sans-serif",
                  }}
                >
                  {getFormatCurrency(product.unit_price)}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={pageCount}
        page={currentPage + 1}
        onChange={(event, page) => setCurrentPage(page - 1)}
        shape="rounded"
        showFirstButton
        showLastButton
        color="primary"
        size="large"
        variant="outlined"
        boundaryCount={2}
        siblingCount={0}
        disabled={pageCount === 1}
        sx={{
          marginTop: 3,
          display: "flex",
          justifyContent: "center",
          marginBottom: "80px",
        }}
      />
    </>
  );
};

export default ItemListContainer;
