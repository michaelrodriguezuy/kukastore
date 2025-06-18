import React from "react";
import {
  Container,
  Typography,
  Box,
  Link as MuiLink,
  Grid,
  Stack,
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
const banco = import.meta.env.VITE_Banco;
const bancoCuenta = import.meta.env.VITE_Banco_Cuenta;
const bancoTitular = import.meta.env.VITE_Banco_Titular;
const emailNotificationComercio = import.meta.env
  .VITE_EMAIL_Notification_Comercio;

const OpcionesPago = () => {
  return (
    <Box sx={{ paddingTop: "20px" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{ fontWeight: 500, mb: 2 }}
        >
          Opciones de pago
        </Typography>
      </Container>

      <Box sx={{ backgroundColor: "rgba(0, 0, 0, 0.03)", py: 2, px: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", height: "40px" }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <MuiLink component={Link} to="/" underline="none" color="inherit">
                Inicio
              </MuiLink>
              <Typography color="text.primary">Opciones de pago</Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Métodos de pago */}
        <Typography variant="h6" gutterBottom align="center">
          Métodos disponibles
        </Typography>

        <Grid
          container
          spacing={1}
          justifyContent="center"
          sx={{ mt: 2, mb: 4, maxWidth: 600, mx: "auto" }}
        >
          {/* Transferencia bancaria */}
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              {/* Fila 1: Ícono y título */}
              <Box display="flex" alignItems="center" gap={1}>
                <AccountBalanceIcon fontSize="large" color="primary" />
                <Typography variant="subtitle1" gutterBottom>
                  Transferencia bancaria
                </Typography>
              </Box>
              {/* Fila 2: Detalles debajo del ícono */}
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                ml={0.5}
                mt={1}
                sx={{ position: "relative", left: 0 }}
              >
                <Typography variant="caption" display="block" gutterBottom>
                  Banco: {banco}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Cuenta: {bancoCuenta}
                </Typography>
                <Typography variant="caption" display="block">
                  Titular: {bancoTitular}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Mercado Pago */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1}
            >
              <CreditCardIcon fontSize="large" color="primary" />
              <Typography>Mercado Pago</Typography>
            </Box>
          </Grid>

          {/* Efectivo */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1}
            >
              <AttachMoneyIcon fontSize="large" color="primary" />
              <Typography>Efectivo</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Información de pagos y envíos */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph align="center">
            Los pagos se procesan únicamente en{" "}
            <Box component="span" fontWeight="bold">
              días hábiles
            </Box>{" "}
            y en{" "}
            <Box component="span" fontWeight="bold">
              horario comercial
            </Box>
            , sin excepción.
          </Typography>

          <Typography variant="body1" paragraph align="center">
            Los envíos se despachan el{" "}
            <Box component="span" fontWeight="bold">
              mismo día
            </Box>{" "}
            si el pago se confirma antes de las{" "}
            <Box component="span" fontWeight="bold">
              16:00 horas
            </Box>
            . De lo contrario, el envío se realizará el{" "}
            <Box component="span" fontWeight="bold">
              día hábil siguiente
            </Box>
            , luego de confirmado el pago.
          </Typography>

          <Typography variant="body1" paragraph align="center">
            El{" "}
            <Box component="span" fontWeight="bold">
              costo del envío
            </Box>{" "}
            corre por cuenta del comprador y se envia por{" "}
            <Box component="span" fontWeight="bold">
              agencia de su preferencia
            </Box>
            , siempre{" "}
            <Box component="span" fontWeight="bold">
              previo depósito y confirmación del pago{" "}
            </Box>
            .
          </Typography>
        </Box>

        {/* Contacto */}
        <Typography variant="h6" gutterBottom align="center">
          ¿Tenés dudas?
        </Typography>
        <Stack spacing={2} alignItems="center" mt={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ContactMailIcon color="action" />
            <MuiLink component={Link} to="/contact" underline="hover">
              Formulario de contacto
            </MuiLink>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon color="action" />
            <a href={`tel:+5980${nroContacto}`}>+598 0{nroContacto}</a>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon color="action" />
            <a href={`mailto:${emailNotificationComercio}`}>
              {emailNotificationComercio}
            </a>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default OpcionesPago;
