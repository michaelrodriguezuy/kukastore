import {
  Container,
  Typography,
  Box,
  Link as MuiLink,
  Paper,
} from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import logo from "../../assets/logo/logo.png";

const About = () => {
  return (
    <Box sx={{ paddingTop: "20px" }}>
      

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

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Paper
          elevation={3}
          sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, textAlign: "center" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <img
              src={logo}
              alt="Logo Kuka"
              style={{ width: 100, marginBottom: 16 }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{ fontSize: { xs: "1rem", md: "1.2rem" }, color: "#444" }}
          >
            Kuka es una empresa familiar que apunta al público de chic@s
            adolescentes y pre adolescentes.
            <br />
            Nuestra principal premisa es entender y escuchar a un público
            sumamente exigente y cambiante que siempre busca lo último en moda y
            tendencias en vestimenta y accesorios.
            <br />
            {/* Frase en quote */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 2,
              }}
            >
              <FormatQuoteIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontStyle: "italic",

                  fontWeight: 500,
                }}
              >
                El leitmotiv de nuestra marca es: <b>La moda en tus manos</b>.
              </Typography>
              <FormatQuoteIcon
                sx={{ fontSize: 32, ml: 1, transform: "scaleX(-1)" }}
              />
            </Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;
