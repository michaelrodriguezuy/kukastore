import { Container, Typography, Box, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const About = () => {
  return (
    <Box sx={{ paddingTop: "20px" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            fontWeight: 500,
            mb: 2,
          }}
        >
          Sobre nosotros
        </Typography>
      </Container>

      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          py: 2,
          px: 2,
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
              <Typography color="text.primary">Sobre nosotros</Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, textAlign: "center" }}>
        <Typography variant="body1" paragraph>
          Somos una empresa dedicada a la venta de productos de alta calidad y
          durabilidad.
        </Typography>
        <Typography variant="body1" paragraph>
          Nuestro objetivo es ofrecer productos que sean duraderos y de alta
          calidad, para que nuestros clientes puedan disfrutar de ellos por
          mucho tiempo.
        </Typography>
      </Container>
    </Box>
  );
};

export default About;
