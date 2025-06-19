import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Tooltip from "@mui/material/Tooltip";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const urlPublicFrontEnv = import.meta.env.VITE_URL_Public_Frontend;
  const urlPublicBackEnv = import.meta.env.VITE_URL_Public_Backend;
  const direccion_1 = import.meta.env.VITE_Direccion_local_1;
  const direccion_2 = import.meta.env.VITE_Direccion_local_2;
  const horario_1 = import.meta.env.VITE_Dias_horarios_1 + " - " + import.meta.env.VITE_Dias_horarios_1_;
  const horario_2 = import.meta.env.VITE_Dias_horarios_2 + " - " + import.meta.env.VITE_Dias_horarios_2_;
  const NroContacto = import.meta.env.VITE_Nro_contacto;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiUrlBack = urlPublicBackEnv
        ? `${urlPublicBackEnv}/send-email-contact`
        : "http://localhost:8081/send-email-contact";

      const response = await axios.post(apiUrlBack, formData);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "¡Mensaje enviado!",
          text: "Nos pondremos en contacto contigo pronto.",
          confirmButtonColor: "#1e1e1e",
        });

        // Limpiar el formulario
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.",
        confirmButtonColor: "#1e1e1e",
      });
    }
  };

  return (
    <Box sx={{ paddingTop: "20px" }}>
      

      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          py: 2,
          px: { xs: 4, sm: 6, md: 8 },
          width: "100%",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "40px",
            }}
          >
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <MuiLink component={Link} to="/" underline="none" color="inherit">
                Inicio
              </MuiLink>
              <Typography color="text.primary">Contacto</Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ mt: 4, mb: 4, px: { xs: 4, sm: 6, md: 8 } }}
      >
        <Typography variant="h4" component="h2" align="center" sx={{ mb: 4 }}>
          ¡Estemos en contacto!
        </Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          Para obtener más información sobre nuestros productos no dudes en
          enviarnos un mensaje. Nos pondremos en contacto contigo lo
          antes posible.
        </Typography>
      </Container>

      <Container
        maxWidth="lg"
        sx={{
          mb: 8,
          px: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Grid container spacing={4}>
          {/* Columna izquierda - Información de contacto */}
          <Grid item xs={12} md={5}>
            <Box sx={{ maxWidth: "300px" }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: "bold", fontSize: "1rem" }}
              >
                Dirección
              </Typography>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {direccion_1}, Uruguay
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: "1.2rem", color: "text.secondary" }} />
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {direccion_2}, Uruguay
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, maxWidth: "300px" }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: "bold", fontSize: "1rem" }}
              >
                Teléfono
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Tooltip title="Envianos un whatsapp">
                  <MuiLink
                    href={`https://api.whatsapp.com/send?phone=598${NroContacto}&text=Hola%20Kuka%20Store,%20me%20gustaría%20consultar%20sobre...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <WhatsAppIcon
                      sx={{ mr: 1, fontSize: "1.2rem", color: "black" }}
                    />
                  </MuiLink>
                </Tooltip>

                <Typography sx={{ fontSize: "0.9rem" }}>
                  Whatsapp: +598 0{NroContacto}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, maxWidth: "300px" }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: "bold", fontSize: "1rem" }}
              >
                Horario de atención
              </Typography>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                <Box>
                  <Typography sx={{ fontSize: "0.9rem" }}>{horario_1}</Typography>                  
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1, fontSize: "1.2rem", color: "text.secondary" }} />
                <Box>                  
                  <Typography sx={{ fontSize: "0.9rem" }}>{horario_2}</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Columna derecha - Formulario */}
          <Grid item xs={12} md={7}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tu nombre"
                    variant="outlined"
                    placeholder="Manuela"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    size="small"
                    sx={{
                      maxWidth: "400px",
                      "& .MuiInputBase-input": {
                        fontSize: "0.9rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tu correo electrónico"
                    variant="outlined"
                    type="email"
                    placeholder="manuela@gmail.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    size="small"
                    sx={{
                      maxWidth: "400px",
                      "& .MuiInputBase-input": {
                        fontSize: "0.9rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mensaje"
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Hola! Me gustaría consultar sobre..."
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    sx={{
                      maxWidth: "400px",
                      "& .MuiInputBase-input": {
                        fontSize: "0.9rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    sx={{
                      bgcolor: "#1e1e1e",
                      "&:hover": {
                        bgcolor: "#333",
                      },
                      fontSize: "0.9rem",
                    }}
                  >
                    Enviar
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
