import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../../config/firebase";
import { useState } from "react";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      Swal.fire({
        icon: 'success',
        title: 'Email enviado',
        text: 'Revisa tu correo para restablecer tu contraseña',
        confirmButtonColor: '#1e1e1e'
      });
      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al enviar el email',
        confirmButtonColor: '#1e1e1e'
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        ¿Olvidaste tu contraseña?
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{ maxWidth: "400px" }}
        >
          <Grid item xs={12}>
            <TextField
              type="email"
              variant="outlined"
              label="Email"
              fullWidth
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ bgcolor: "background.paper" }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#1e1e1e',
                color: 'white',
                '&:hover': {
                  bgcolor: '#333'
                }
              }}
            >
              Recuperar
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/login")}
              sx={{
                color: '#1e1e1e',
                borderColor: '#1e1e1e',
                '&:hover': {
                  borderColor: '#333',
                  bgcolor: 'transparent'
                }
              }}
            >
              Regresar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ForgotPassword;
