import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useContext, useState } from "react";
import { db, login, loginGoogle } from "../../../fireBaseConfig";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";

import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import { alpha } from "@mui/material/styles";

const Login = () => {
  const { handleLogin } = useContext(AuthContext);
  const rolAdmin = import.meta.env.VITE_ROLADMIN;

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const customBlack = alpha("#000", 0.8); //color

  // const idArticuloRedirigido = localStorage.getItem("originalArticleId");

  let initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("El email es obligatorio")
      .email("Ingresa un email válido"),
    password: Yup.string()
      .required("La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  });

  const handleSubmit = async (values) => {
    try {
      const res = await login({
        email: values.email,
        password: values.password,
      });

      if (res && res.user) {
        const userCollection = collection(db, "users");
        const userRef = doc(userCollection, res.user.uid);
        const userDoc = await getDoc(userRef);

        let finalyUser = {
          email: res.user.email,
          id: res.user.uid,
          name: userDoc.data().name,
          lastname: userDoc.data().lastname,
          rol: userDoc.data().rol,
        };

        handleLogin(finalyUser);

        //esto lo usaba antes cuando era obligatorio loguearse para usar el e-commerce
        // if (idArticuloRedirigido) {
        //   navigate(`/itemDetail/${idArticuloRedirigido}`);
        // } else {
        // }
        if (finalyUser.rol === rolAdmin) {
          navigate("/dashboard");
        } else {
          navigate("/cart");
        }

      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El usuario no existe, por favor registrate",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginGoogle = async () => {
    try {
      const res = await loginGoogle();
      let name = res.user.displayName.split(" ");
      let finalyUser = {
        email: res.user.email,
        id: res.user.uid,
        name: name[0],
        lastname: name[1],
        rol: "user",
      };

      handleLogin(finalyUser);

      try {
        await registerUserGoogle(finalyUser);
      } catch (error) {
        console.log(error);
      }

      // if (idArticuloRedirigido) {
      //   navigate(`/itemDetail/${idArticuloRedirigido}`);
      // } else {
      // }
      navigate("/cart");
    } catch (error) {
      console.log(error);
    }
  };

  const registerUserGoogle = async (user) => {
    const userCollection = collection(db, "users");
    const userRef = doc(userCollection, user.id);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // el usuario ya existe, no hago nada
      return;
    }
    // el usuario no existe, lo creo
    let newUser = {
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      rol: user.rol,
    };
    await setDoc(userRef, newUser);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "30em",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          // backgroundColor: theme.palette.secondary.main,
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            rowSpacing={2}
            // alignItems="center"
            justifyContent={"center"}
          >
            <Grid item xs={10} md={12}>
              <TextField
                name="email"
                label="Correo electrónico"
                fullWidth
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={10} md={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password">
                  Contraseña
                </InputLabel>
                <OutlinedInput
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ color: customBlack }} />
                        ) : (
                          <Visibility sx={{ color: customBlack }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Contraseña"
                />
              </FormControl>
            </Grid>
            <Link
              to="/forgot-password"
              style={{ color: "black", marginTop: "10px" }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <Grid container justifyContent="center" spacing={3} mt={2}>
              <Grid item xs={10} md={5}>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  sx={{
                    color: "white",
                    backgroundColor: customBlack,
                    textTransform: "none",
                    textShadow: "2px 2px 2px grey",
                  }}
                >
                  Ingresar
                </Button>
              </Grid>
              <Grid item xs={10} md={5}>
                <Tooltip title="ingresa con google">
                  <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleLoginGoogle}
                    type="button"
                    fullWidth
                    sx={{
                      color: "white",
                      backgroundColor: customBlack,
                      textTransform: "none",
                      textShadow: "2px 2px 2px grey",
                    }}
                  >
                    Ingresa con google
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={10} md={8}>
                <Typography
                  color={"secondary.primary"}
                  variant={"h6"}
                  mt={1}
                  align="center"
                >
                  ¿Aun no tienes cuenta?
                </Typography>
              </Grid>
              <Grid item xs={10} md={5}>
                <Tooltip title="Solo te tomará 1 minuto">
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/register")}
                    type="button"
                    sx={{
                      color: "white",
                      backgroundColor: customBlack,
                      textTransform: "none",
                      textShadow: "2px 2px 2px grey",
                    }}
                  >
                    Registrate
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
};

export default Login;
