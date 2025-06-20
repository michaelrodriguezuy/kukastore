import React from "react";
import {
  Container,
  Typography,
  Box,
  Link as MuiLink,
  Grid,
  Stack,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ContactMailIcon from "@mui/icons-material/ContactMail";

const nroContacto = import.meta.env.VITE_Nro_contacto;

const Devoluciones = () => {
  return (
    <Box sx={{ paddingTop: "20px" }}>
      <Box sx={{ backgroundColor: "rgba(0, 0, 0, 0.03)", py: 2, px: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", height: "40px" }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <MuiLink component={Link} to="/" underline="none" color="inherit">
                Inicio
              </MuiLink>
              <Typography color="text.primary">Devoluciones</Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {/* Información de pagos y envíos */}
          <Box sx={{ mt: 4 }}>
            <p></p>

            <Typography variant="body1" paragraph align="center">
              UNA VEZ REALIZADA LA COMPRA LA MISMA{" "}
              <Box component="span" fontWeight="bold">
                NO TIENE DEVOLUCIÓN
              </Box>
              .
            </Typography>
            <Typography variant="body1" paragraph align="center">
              LA EMPRESA NO EMITE VALES DE COMPRA, NO PUDIENDO QUEDAR DINERO A
              FAVOR.
            </Typography>
            <Typography variant="body1" paragraph align="center">
              SI EL PRODUCTO ADQUIRIDO CONTIENE UNA FALLA O NO CORRESPONDE CON
              EL PRODUCTO ADQUIRIDO COMUNICARSE AL TELÉFONO 0{nroContacto} en el
              Horario de 10 a 12 o de 14 a 18 de Lunes a Viernes.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Devoluciones;
