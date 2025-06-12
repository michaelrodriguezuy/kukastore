import { Card, CardContent, CardMedia, Typography, CardActionArea, Box } from "@mui/material";
import { Link } from "react-router-dom";
import "../../../styles/components/ProductCard.css";
import { getFormatCurrency } from "../../../utils/formatCurrency";
import { useContext } from "react";
import { CartContext } from "../../../context/CartContext";

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const ProductCard = ({ product }) => {
  const { getFormatCurrency } = useContext(CartContext);
  
  return (
    <Card className="product-card">
      <Box 
        component={Link} 
        to={`/itemDetail/${product.id}`}
        className="product-link"
      >
        <div className="product-image-container">
          <CardMedia
            component="img"
            image={product.image[0]}
            alt={product.title}
            className="product-image"
          />
          {product.discount > 0 && (
            <div className="discount-badge">
              -{product.discount}%
            </div>
          )}
        </div>

        <CardContent>
          <Typography className="product-title">
            {truncateText(product.title, 50)}
          </Typography>
          <Typography className="product-description">
            {truncateText(product.description, 60)}
          </Typography>
          <Typography className="product-price">
            {getFormatCurrency(product.unit_price)}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default ProductCard; 