import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, db } from "../../../fireBaseConfig";
import { setDoc, doc } from "firebase/firestore";
import "./Register.css";

import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";

import { alpha } from "@mui/material/styles";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [mostrarTextoCompleto, setMostrarTextoCompleto] = useState(false);
  const [aceptarPoliticas, setAceptarPoliticas] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const customBlack = alpha("#000", 0.8);

  let initialValues = {
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("El nombre es obligatorio"),
    lastname: Yup.string().required("El apellido es obligatorio"),
    email: Yup.string()
      .required("El email es obligatorio")
      .email("Ingresa un email válido"),
    password: Yup.string()
      .required("La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: Yup.string()
      .required("La confirmación de contraseña es obligatoria")
      .equals([Yup.ref("password")], "Las contraseñas deben coincidir"),
  });

  const handleSubmit = async (value) => {
    try {
      const res = await register({
        email: value.email,
        password: value.password,
      });

      if (res && res.user) {
        await setDoc(doc(db, "users", res.user.uid), {
          rol: "user",
          email: res.user.email,

          name: value.name,
          lastname: value.lastname,
          // phone: usuario.phone, ESTE DATO Y EL CODIGO DE AREA LO GUARDO EN EL PASO PREVIO AL CHECKOUT
        });
        // dar aviso de registro exitoso con sweetalert2 y enviar un correo de confirmación
        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Te enviamos un correo de confirmación a tu casilla de email",
        });

        await sendEmail(value.email);
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El usuario no pudo ser registrado",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendEmail = async (email) => {
    console.log("Enviando correo electrónico a:", email);
    try {
      const response = await axios.post(
        "https://indiacuerosback.vercel.app/send-email-register",
        {
      // const response = await axios.post(
      //   "http://localhost:8081/send-email-register",
      //   {
          to: email,
          subject: "Confirmación de registro en eCommerce2",
          text: "Gracias por registrarte en nuestro sitio.",
        }
      );

      console.log(response.data.message);
    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
    }
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
                name="name"
                label="Nombre"
                fullWidth
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={10} md={12}>
              <TextField
                name="lastname"
                label="Apellido"
                fullWidth
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastname}
                error={
                  formik.touched.lastname && Boolean(formik.errors.lastname)
                }
                helperText={formik.touched.lastname && formik.errors.lastname}
              />
            </Grid>

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
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
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
            <Grid item xs={10} md={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password">
                  Confirmar contraseña
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
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
                  label="Confirmar contraseña"
                />
              </FormControl>
            </Grid>

            <Grid item xs={10} md={12}>
              <Typography>
                {mostrarTextoCompleto ? (
                  <div className="politicas">
                    <p>
                      {`Política de privacidad.
        En este sitio web, respetamos su información personal y en vista de cumplir con las políticas de seguridad respectivas concernientes a todo sitio web, que deberían ser obligatorias, informamos lo siguiente...`}
                    </p>
                    <p>
                      {`Privacidad de los datos personales
        Sus datos personales le corresponden solo a usted y este sitio web es responsable de no revelar ninguna clase de información que le pertenezca (como email, telefono, etc.), salvo su expresa autorización o fuerzas de naturaleza mayor de tipo legal que lo involucren, como hackeos o suplantaciones.`}
                    </p>
                    <p>
                      {`Seguridad de su información personal
        Este sitio web se hace responsable de velar por su seguridad, por la privacidad de su información y por el respeto a sus datos, de acuerdo con las limitaciones que la actual Internet nos provee, siendo conscientes que no estamos excluídos de sufrir algún ataque por parte de crackers o usuarios malintencionados que ejerzan la delincuencia informática.`}
                    </p>
                    <p>
                      {`Obtención de su información
        Todos sus datos personales consignados en este sitio son suministrados por usted mismo, haciendo uso entero de su libertad. La información aquí almacenada sólo comprende datos básicos ingresados mediante formularios de contacto, comentarios u otros similares.`}
                    </p>
                    <p>
                      {`Uso de la información
        Al proporcionarnos sus datos personales, estando de acuerdo con la Política de Privacidad aquí consignada, nos autoriza para el siguiente uso de su información: a) para el fin mismo por lo cual se ha suministrado; b) para considerarlo dentro de nuestras estadísticas de tráfico; c) las informaciones atinentes a medios de pago consistentes en claves personales para las transacciones electrónicas, en este sitio no se mantiene ningún acceso directo ni indirecto ni conocimiento de claves personales ni de códigos, los que son dirigidos exclusivamente al proveedor del medio de pago, ya sea VISA, MASTERCARD, AMERICAN EXPRESS, u otro que se emplee a traves de Mercado Pago.`}
                    </p>
                    <p>
                      {`Modificaciones a nuestras Políticas de Privacidad
        El sitio web se reserva el derecho de modificar, rectificar, alterar, agregar o eliminar cualquier punto del presente escrito en cualquier momento y sin previo aviso, siendo su responsabilidad el mantenerse informado del mismo para una adecuada administración de su información.`}
                    </p>
                    <p>
                      {`Una vez realizada la compra se dará por entendida y validada la aceptación de los TÉRMINOS Y CONDICIONES expresadas en este sitio.`}
                    </p>
                  </div>
                ) : (
                  <div className="politicas">
                    <p>
                      {`La política de privacidad en este sitio web...`}
                      {!mostrarTextoCompleto && (
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => setMostrarTextoCompleto(true)}
                          style={{
                            color: "steelblue",
                            fontSize: "0.8rem",
                            alignSelf: "center",
                          }}
                        >
                          {" "}
                          leer más
                        </Link>
                      )}
                    </p>
                  </div>
                )}
              </Typography>
            </Grid>

            <Grid item xs={10} md={12}>
              <FormControlLabel
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                control={
                  <Checkbox
                    checked={aceptarPoliticas}
                    onChange={(e) => setAceptarPoliticas(e.target.checked)}
                    name="aceptarPoliticas"
                    color="primary"
                  />
                }
                label="Acepto las políticas de seguridad del sitio"
              />
            </Grid>

            <Grid container justifyContent="center" spacing={3} mt={2}>
              <Grid item xs={10} md={7}>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={!aceptarPoliticas}
                  sx={{
                    color: "white",
                    backgroundColor: customBlack,
                    textTransform: "none",
                    textShadow: "2px 2px 2px grey",
                  }}
                >
                  Registrarme
                </Button>
              </Grid>
              <Grid item xs={10} md={7}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/login")}
                  type="button"
                  sx={{backgroundColor: customBlack}}
                >
                  Regresar
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
};

export default Register;
