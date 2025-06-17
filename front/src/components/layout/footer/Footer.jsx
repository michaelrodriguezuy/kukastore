import {
  Box,
  Container,
  Link,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { db } from "../../../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const Footer = () => {
  const customBlack = alpha("#000", 0.8); //color negro especial
  const [email, setEmail] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSubscribe = async () => {
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage("Por favor, ingresa un email válido");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const newsletterCollection = collection(db, "newsletter");
      await addDoc(newsletterCollection, {
        email: email,
        createdAt: new Date(),
      });

      setEmail("");
      setSnackbarMessage("¡Gracias por suscribirte!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage("Error al suscribirse. Intenta nuevamente.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: "#1e1e1e",
          color: "white",
          py: 3,
          px: 2,
          mt: 0,
          width: "100%",
        }}
      >
        <Grid
          container
          spacing={4}
          sx={{
            maxWidth: "100%",
            margin: "0 auto",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
            px: 2,
          }}
        >
          {/* Sección Logo y Dirección */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Kuka Store
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, mt: 2 }}>
              Santiago Gadea 1063,
              <br />
              Treinta y Tres, URUGUAY
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-start",
                alignItems: "flex-start", // Alinea verticalmente al inicio
                mt: 2, // espacio arriba
                pl: 0, // padding a la izquierda
              }}
            >
              <IconButton
                href="https://www.instagram.com/kuka_uy/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "white", p: 0 }} // sin padding interno en el botón
              >
                <Tooltip title="Contactanos por instagram">
                  <InstagramIcon fontSize="medium" />
                </Tooltip>
              </IconButton>
            </Box>
          </Grid>

          {/* Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <a href="/" style={{ color: "white", textDecoration: "none" }}>
                Inicio
              </a>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <a
                href="/shop"
                style={{ color: "white", textDecoration: "none" }}
              >
                Tienda
              </a>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <a
                href="/about"
                style={{ color: "white", textDecoration: "none" }}
              >
                Sobre nosotros
              </a>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <a
                href="/contact"
                style={{ color: "white", textDecoration: "none" }}
              >
                Contacto
              </a>
            </Typography>
          </Grid>

          {/* Ayuda */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <a
                href="/opcionesPago"
                style={{ color: "white", textDecoration: "none" }}
              >
                Opciones de pago
              </a>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <a
                href="/devoluciones"
                style={{ color: "white", textDecoration: "none" }}
              >
                Devoluciones
              </a>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <a
                href="/politicas"
                style={{ color: "white", textDecoration: "none" }}
              >
                Política de privacidad
              </a>
            </Typography>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Newsletter
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "280px",
                  borderBottom: "1px solid white",
                }}
              >
                <TextField
                  variant="standard"
                  placeholder="Ingresa tu correo electrónico"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  sx={{
                    width: "100%",
                    "& input": {
                      color: "white",
                    },
                  }}
                />
              </Box>

              <Button
                variant="text"
                onClick={handleSubscribe}
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                Suscribirse
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box
          container
          spacing={4}
          sx={{
            maxWidth: "100%",
            margin: "0 auto",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
            padding: "0 30px",
          }}
        >
          <Divider sx={{ backgroundColor: "#333", my: 3 }} />
          <Typography variant="body2" align="left">
            Derechos reservados
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer;
