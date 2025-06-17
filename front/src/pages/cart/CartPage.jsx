import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link, useNavigate } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Swal from "sweetalert2";
import axios from "axios";
import {
  getDocs,
  query,
  where,
  collection,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../config/firebase/index";

// Constantes para medidas de prendas
const PRENDA_DEFAULT = {
  peso: 1, // 1000 gramos
  alto: 5, // 5 cm
  ancho: 30, // 30 cm
  largo: 40, // 40 cm
};

const CartPage = () => {
  const {
    cart,
    getTotalPrice,
    getTotalWithShipment,
    getFormatCurrency,
    orderData,
    updateOrderData,
    clearCart,
    deleteById,
  } = useContext(CartContext);
  const [shippingMethod, setShippingMethod] = useState("");
  const [shippingType, setShippingType] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [shippingData, setShippingData] = useState({
    city: "",
    address: "",
    postalCode: "",
    agencyName: "",
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [selectedLocalidad, setSelectedLocalidad] = useState("");
  const [uesDeliveryType, setUesDeliveryType] = useState("");
  const [otherDeliveryType, setOtherDeliveryType] = useState(""); // Nuevo estado para otros envíos
  const [shipmentRates, setShipmentRates] = useState(null); // Para almacenar las tarifas de envío
  const [agenciaData, setAgenciaData] = useState(null); // Para datos de la agencia UES
  const [showUesOption, setShowUesOption] = useState(false); // Estado para controlar si mostrar la opción UES

  const urlPublicFrontEnv = import.meta.env.VITE_URL_Public_Frontend;
  const urlPublicBackEnv = import.meta.env.VITE_URL_Public_Backend;

  const navigate = useNavigate();

  // Cargar configuración de UES desde Firebase
  useEffect(() => {
    const fetchUesConfig = async () => {
      try {
        const configDocRef = doc(db, "Config", "shipmentConfig");
        const configDoc = await getDoc(configDocRef);
        if (configDoc.exists()) {
          setShowUesOption(configDoc.data().isUES || false);
        } else {
          setShowUesOption(false);
        }
      } catch (error) {
        console.error("Error al cargar la configuración UES:", error);
        setShowUesOption(false);
      }
    };

    fetchUesConfig();
  }, []);

  const calculateDiscountedPrice = (item) => {
    if (item.discount) {
      return item.unit_price - item.unit_price * (item.discount / 100);
    }
    return item.unit_price;
  };

  // Cargar tarifas de envío desde Firebase para otro servicio distinto a UES
  useEffect(() => {
    const fetchShipmentRates = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "shipment"), where("name", "==", "agencia"))
        );

        if (!querySnapshot.empty) {
          setShipmentRates(querySnapshot.docs[0].data().cost);
          console.log("Tarifas cargadas:", querySnapshot.docs[0].data()); // Para debug
        }
      } catch (error) {
        console.error("Error al cargar tarifas de envío:", error);
      }
    };

    if (shippingMethod === "envio" && shippingType === "agencia") {
      fetchShipmentRates();
    }
  }, [shippingMethod, shippingType]);

  const handleShippingMethodChange = (method) => {
    setShippingMethod(method);
    setShippingType("");
    setOtherDeliveryType("");
    setUesDeliveryType("");
    setShippingCalculated(method === "retiro");
    setShippingCost(method === "retiro" ? 0 : shippingCost);

    // Limpiar datos de localidad al cambiar método
    setSelectedDepartamento("");
    setSelectedLocalidad("");
    setShippingData({
      city: "",
      address: "",
      postalCode: "",
      agencyName: "",
    });

    // Guardar datos de envío en localStorage
    const shippingData = {
      shippingMethod: method,
      shippingCost: method === "retiro" ? 0 : shippingCost,
    };
    localStorage.setItem("shippingData", JSON.stringify(shippingData));

    // Actualizar orderData usando updateOrderData del contexto
    updateOrderData({
      shippingMethod: method,
      shippingCost: method === "retiro" ? 0 : shippingCost,
    });
  };

  const handleShippingTypeChange = (type) => {
    setShippingType(type);
    setShippingCalculated(false);
    setOtherDeliveryType("");
    setUesDeliveryType("");
    setShippingCost(0); // Resetear el costo de envío

    // Actualizar orderData con el costo de envío reseteado
    updateOrderData({
      shippingMethod: "",
      shippingCost: 0,
    });

    // Actualizar shippingData en localStorage
    const shippingData = {
      shippingMethod: "",
      shippingCost: 0,
    };
    localStorage.setItem("shippingData", JSON.stringify(shippingData));
  };

  const handleOtherDeliveryTypeChange = (event) => {
    setOtherDeliveryType(event.target.value);
    setShippingCalculated(false);
  };

  const calculateOtherShippingCost = () => {
    if (!shipmentRates) {
      console.error("No se encontraron tarifas de envío");
      return 0;
    }

    // Verificar si el envío es dentro de Treinta y Tres
    const isLocalDelivery = selectedDepartamento === "TREINTA Y TRES";

    // Usar la tarifa de agencia para ambos tipos de envío (agencia o domicilio)
    const rate = shipmentRates;
    console.log("Tarifa calculada:", rate); // Para debug
    return rate;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setShippingCalculated(false);
  };

  const handleCalculateShipping = async () => {
    try {
      // Para envíos UES
      if (shippingMethod === "envio" && shippingType === "ues") {
        // Establecer costo 0 inmediatamente
        setShippingCost(0);
        setShippingCalculated(true);

        const addressParts = shippingData.address
          ? shippingData.address.split(" ")
          : ["", ""];
        const streetNumber = addressParts[addressParts.length - 1].match(/\d+/)
          ? addressParts.pop()
          : "";
        const streetName = addressParts.join(" ");

        // Verificar si tenemos los datos de la agencia cuando es necesario
        if (uesDeliveryType === "agencia" && !agenciaData) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No hay agencia disponible en esta localidad",
          });
          return;
        }

        const shippingRequest = {
          Departamento: selectedDepartamento,
          BarrioLocalidad: selectedLocalidad,
          Calle:
            uesDeliveryType === "agencia"
              ? agenciaData.direccion.calle
              : streetName,
          Nro:
            uesDeliveryType === "agencia"
              ? agenciaData.direccion.nro
              : streetNumber,
          CodPo:
            uesDeliveryType === "agencia"
              ? agenciaData.direccion.codPo
              : shippingData.postalCode || "00000",
          tipoEnvio: uesDeliveryType === "agencia" ? "AGENCIA" : "DOMICILIO",
          Peso: "1",
          UMP: "Kg",
          ValorMonetario: getTotalPrice().toString(),
          EmailRecibe: orderData?.customerData?.email || "",
          TelefonoContacto: orderData?.customerData?.celular || "",
        };

        try {
          const apiUrlBack = urlPublicBackEnv
            ? `${urlPublicBackEnv}/api/shipping/calculate`
            : "http://localhost:8081/api/shipping/calculate";
          const response = await axios.post(apiUrlBack, shippingRequest);

          console.log("Respuesta del servidor:", response.data);

          // Guardar datos del envío (siempre con costo 0)
          const shippingData = {
            shippingMethod:
              uesDeliveryType === "agencia" ? "UES Agencia" : "UES Domicilio",
            shippingCost: 0,
            guiaID: response.data.guiaID,
            tracking_web: response.data.tracking_web,
            tipoEnvio: uesDeliveryType,
            agenciaData: uesDeliveryType === "agencia" ? agenciaData : null,
          };

          console.log("Guardando datos de envío:", shippingData);
          localStorage.setItem("shippingData", JSON.stringify(shippingData));

          // Actualizar orderData con los datos de envío
          updateOrderData({
            shippingMethod: shippingData.shippingMethod,
            shippingCost: shippingData.shippingCost,
          });
        } catch (error) {
          console.error("Error completo:", error);
          throw error;
        }
      }

      // Para envíos por otra agencia distinta a UES
      if (shippingMethod === "envio" && shippingType === "agencia") {
        if (!selectedDepartamento || !selectedLocalidad || !otherDeliveryType) {
          throw new Error("Por favor complete todos los campos requeridos");
        }

        const cost = calculateOtherShippingCost();
        if (cost === 0) {
          throw new Error("No se pudieron obtener las tarifas de envío");
        }

        setShippingCost(cost);
        setShippingCalculated(true);

        // Guardar datos del envío
        const shippingDataToSave = {
          shippingMethod:
            otherDeliveryType === "agencia"
              ? `${shippingData.agencyName}`
              : `${shippingData.agencyName} Domicilio`,
          shippingCost: cost,
          tipoEnvio: otherDeliveryType,
          agencyName: shippingData.agencyName || "",
          address: shippingData.address || "",
          departamento: selectedDepartamento,
          localidad: selectedLocalidad,
        };

        localStorage.setItem(
          "shippingData",
          JSON.stringify(shippingDataToSave)
        );

        // Actualizar orderData con los datos de envío
        updateOrderData({
          shippingMethod: shippingDataToSave.shippingMethod,
          shippingCost: cost,
        });
      }

      // Para retiro en local
      if (shippingMethod === "retiro") {
        const cost = 0;
        setShippingCost(cost);
        setShippingCalculated(true);

        const shippingDataToSave = {
          shippingMethod: "retiro",
          shippingCost: cost,
        };

        localStorage.setItem(
          "shippingData",
          JSON.stringify(shippingDataToSave)
        );

        // Actualizar orderData con los datos de envío
        updateOrderData({
          shippingMethod: "retiro",
          shippingCost: 0,
        });
      }
    } catch (error) {
      console.error("Error calculando envío:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo calcular el costo del envío",
      });
      setShippingCalculated(false);
      setShippingCost(0);

      // Actualizar orderData con costo 0 en caso de error
      updateOrderData({
        shippingMethod: "",
        shippingCost: 0,
      });
    }
  };

  const handleUesDeliveryTypeChange = (event) => {
    const newType = event.target.value;
    console.log("Nuevo tipo de envío:", newType); // Para debug
    setUesDeliveryType(newType);
    setShippingCalculated(false);

    if (newType === "agencia") {
      setShippingData((prev) => ({
        ...prev,
        address: "",
      }));
    }
  };

  const isFormValid = () => {
    if (shippingMethod === "retiro") return true;

    if (shippingType === "ues") {
      // Validación básica de departamento y localidad
      if (!selectedDepartamento || !selectedLocalidad) return false;

      // Solo validar dirección si es envío a domicilio
      if (uesDeliveryType === "domicilio" && !shippingData.address)
        return false;

      return true;
    }

    if (shippingType === "agencia") {
      // Validación básica de departamento y localidad
      if (!selectedDepartamento || !selectedLocalidad) return false;

      // Validar según el tipo de envío
      if (otherDeliveryType === "domicilio" && !shippingData.address)
        return false;
      if (otherDeliveryType === "agencia" && !shippingData.agencyName)
        return false;

      return true;
    }

    return false;
  };

  const handleCheckout = () => {
    if (!shippingMethod) {
      Swal.fire({
        icon: "error",
        title: "Método de envío no seleccionado",
        text: "Por favor, seleccione un método de envío antes de continuar",
      });
      return;
    }

    // Si hay método de envío seleccionado, continuar al checkout
    navigate("/checkout");
  };

  // Cargar departamentos al inicio
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        console.log("localidades: ", urlPublicBackEnv);
        const apiUrlBack = urlPublicBackEnv
          ? `${urlPublicBackEnv}/api/ues/locations`
          : "http://localhost:8081/api/ues/locations";

        const response = await axios.get(apiUrlBack);
        console.log("Departamentos cargados:", response.data); // Para debug
        setDepartamentos(response.data);
      } catch (error) {
        console.error("Error al cargar las localidades:", error);
      }
    };

    if (shippingMethod === "envio") {
      fetchLocations();
    }
  }, [shippingMethod]);

  // Actualizar localidades cuando cambia el departamento
  const handleDepartamentoChange = (event) => {
    const deptoNombre = event.target.value;
    setSelectedDepartamento(deptoNombre);

    const depto = departamentos.find((d) => d.nombre === deptoNombre);

    if (depto) {
      setLocalidades(depto.localidades || []);
      setSelectedLocalidad("");
      setShippingCalculated(false);
      setShippingData((prev) => ({
        ...prev,
        city: depto.nombre,
        postalCode: "",
      }));
    }
  };

  // Actualizar código postal cuando cambia la localidad
  const handleLocalidadChange = (event) => {
    const localidadNombre = event.target.value;
    const localidad = localidades.find((l) => l.nombre === localidadNombre);

    if (localidad) {
      setSelectedLocalidad(localidadNombre);
      setShippingData((prev) => ({
        ...prev,
        postalCode: localidad.codigo_postal || "",
      }));
      setShippingCalculated(false);
    }
  };

  // Cuando cambia la localidad o el tipo de envío
  useEffect(() => {
    const checkAgenciaDisponible = async () => {
      if (
        uesDeliveryType === "agencia" &&
        selectedDepartamento &&
        selectedLocalidad
      ) {
        try {
          const apiUrlBack = urlPublicBackEnv
            ? `${urlPublicBackEnv}/api/ues/agencia/${selectedDepartamento}/${selectedLocalidad}`
            : `http://localhost:8081/api/ues/agencia/${selectedDepartamento}/${selectedLocalidad}`;

          const response = await axios.get(apiUrlBack);

          const agenciaData = {
            id: response.data.id,
            direccion: response.data.direccion,
          };

          setAgenciaData(agenciaData);
        } catch (error) {
          if (error.response?.status === 404) {
            // No hay agencia disponible
            Swal.fire({
              icon: "warning",
              title: "Agencia no disponible",
              html: `No hay agencia UES en ${selectedLocalidad}.<br><br>
                    Puede elegir entre:<br>
                    - Envío a domicilio<br>
                    - Seleccionar otra localidad para retirar en agencia`,
              showCancelButton: true,
              confirmButtonText: "Cambiar a domicilio",
              cancelButtonText: "Elegir otra localidad",
            }).then((result) => {
              if (result.isConfirmed) {
                setUesDeliveryType("domicilio");
              } else {
                // Resetear localidad para que el usuario elija otra
                setSelectedLocalidad("");
                setUesDeliveryType("agencia");
              }
            });
          }
          setAgenciaData(null);
        }
      }
    };

    checkAgenciaDisponible();
  }, [selectedDepartamento, selectedLocalidad, uesDeliveryType]);

  useEffect(() => {
    // Consolidar datos de shippingData en orderData
    const shippingDatas = JSON.parse(
      localStorage.getItem("shippingData") || "{}"
    );
    setShippingData(shippingDatas);

    // Actualizar orderData con los datos de envío
    if (shippingDatas) {
      updateOrderData({
        shippingMethod: shippingDatas.shippingMethod || "",
        shippingCost: shippingDatas.shippingCost || 0,
      });
    }
  }, []);

  return (
    <Box>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            fontWeight: 500,
            mb: 2,
            pt: 3,
          }}
        >
          Carrito
        </Typography>
      </Container>

      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          py: 2,
          px: 2,
          width: "100%",
          mb: 4,
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
              <Typography color="text.primary">Carrito</Typography>
            </Breadcrumbs>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container sx={{ mb: 2, p: 1 }} alignItems="center">
                <Grid item xs={6}>
                  <Typography>Producto</Typography>
                </Grid>
                <Grid item xs={2} align="center">
                  <Typography>Cantidad</Typography>
                </Grid>
                <Grid item xs={2} align="center">
                  <Typography>Subtotal</Typography>
                </Grid>
              </Grid>
              <Divider />

              {cart.map((item) => (
                <Grid container key={item.id} sx={{ p: 2 }} alignItems="center">
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginRight: "16px",
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {item.title}
                        </Typography>
                        {(item.size || item.color) && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.95em", opacity: 0.7 }}
                          >
                            {item.size && `Talle: ${item.size} `}
                            {item.size && item.color ? "- " : ""}
                            {item.color && `Color: ${item.color}`}
                          </Typography>
                        )}
                        {item.sku && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              opacity: 0.5,
                              fontStyle: "italic",
                              mt: 0.2,
                            }}
                          >
                            SKU: {item.sku}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Typography>{item.quantity}</Typography>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Typography>
                      ${" "}
                      {(calculateDiscountedPrice(item) * item.quantity).toFixed(
                        2
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Button onClick={() => deleteById(item.id)} color="error">
                      <DeleteOutlineIcon />
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ mt: 2 }} />
                  </Grid>
                </Grid>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{ p: 3, bgcolor: "rgba(0, 0, 0, 0.02)", borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                sx={{ mb: 3 }}
              >
                Total del carrito
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>Subtotal</Typography>
                <Typography>
                  {getFormatCurrency(
                    cart.reduce(
                      (total, item) => total + item.unit_price * item.quantity,
                      0
                    )
                  )}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>Descuento</Typography>
                <Typography>
                  {getFormatCurrency(
                    cart.reduce((total, item) => {
                      if (item.discount) {
                        const descuento =
                          item.unit_price * item.quantity -
                          calculateDiscountedPrice(item) * item.quantity;
                        return total + descuento;
                      }
                      return total;
                    }, 0)
                  )}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {getFormatCurrency(getTotalPrice())}
                </Typography>
              </Box>
            </Paper>

            <Paper
              sx={{
                p: 3,
                mt: 3,
                bgcolor: "rgba(0, 0, 0, 0.02)",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Envío
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={shippingMethod}
                  onChange={(e) => handleShippingMethodChange(e.target.value)}
                >
                  <FormControlLabel
                    value="retiro"
                    control={<Radio />}
                    label="Retiro en el local"
                  />

                  <FormControlLabel
                    value="envio"
                    control={<Radio />}
                    label="Envío por encomienda"
                  />
                </RadioGroup>

                {shippingMethod === "envio" && (
                  <Box sx={{ ml: 4, mt: 1 }}>
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={shippingType}
                        onChange={(e) =>
                          handleShippingTypeChange(e.target.value)
                        }
                      >
                        {showUesOption && (
                          <FormControlLabel
                            value="ues"
                            control={<Radio />}
                            label="UES"
                          />
                        )}
                        <FormControlLabel
                          value="agencia"
                          control={<Radio />}
                          label="Agencia"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                )}

                {shippingMethod === "envio" && shippingType === "ues" && (
                  <Box sx={{ ml: 4, mt: 1 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Departamento</InputLabel>
                      <Select
                        value={selectedDepartamento}
                        onChange={handleDepartamentoChange}
                        label="Ciudad"
                        disabled={!departamentos || departamentos.length === 0}
                      >
                        <MenuItem value="">Seleccione un departamento</MenuItem>
                        {departamentos &&
                          departamentos.map((depto) => (
                            <MenuItem key={depto.id} value={depto.nombre}>
                              {depto.nombre}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Localidad</InputLabel>
                      <Select
                        value={selectedLocalidad}
                        onChange={handleLocalidadChange}
                        label="Localidad"
                        disabled={!selectedDepartamento}
                      >
                        {localidades.map((localidad) => (
                          <MenuItem key={localidad.id} value={localidad.nombre}>
                            {localidad.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedLocalidad && (
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          value={uesDeliveryType}
                          onChange={handleUesDeliveryTypeChange}
                        >
                          <FormControlLabel
                            value="domicilio"
                            control={<Radio />}
                            label="Envío a domicilio"
                          />
                          {uesDeliveryType === "domicilio" && (
                            <Box sx={{ pl: 4, pr: 4, width: "100%" }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Dirección"
                                variant="outlined"
                                name="address"
                                value={shippingData.address || ""}
                                onChange={(e) => {
                                  setShippingData((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                  }));
                                  setShippingCalculated(false);
                                }}
                                sx={{ mb: 2 }}
                              />
                            </Box>
                          )}
                          <FormControlLabel
                            value="agencia"
                            control={<Radio />}
                            label="Retiro en agencia UES"
                          />
                        </RadioGroup>
                      </FormControl>
                    )}

                    {selectedLocalidad && (
                      <TextField
                        fullWidth
                        label="Código postal"
                        variant="outlined"
                        size="small"
                        name="postalCode"
                        value={shippingData.postalCode}
                        onChange={handleInputChange}
                        sx={{ mt: 2, mb: 3 }}
                      />
                    )}
                  </Box>
                )}

                {shippingMethod === "envio" && shippingType === "agencia" && (
                  <Box sx={{ ml: 4, mt: 1 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Departamento</InputLabel>
                      <Select
                        value={selectedDepartamento}
                        onChange={handleDepartamentoChange}
                        label="Ciudad"
                      >
                        <MenuItem value="">Seleccione un departamento</MenuItem>
                        {departamentos.map((depto) => (
                          <MenuItem key={depto.id} value={depto.nombre}>
                            {depto.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Localidad</InputLabel>
                      <Select
                        value={selectedLocalidad}
                        onChange={handleLocalidadChange}
                        label="Localidad"
                        disabled={!selectedDepartamento}
                      >
                        {localidades.map((localidad) => (
                          <MenuItem key={localidad.id} value={localidad.nombre}>
                            {localidad.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                      <RadioGroup
                        value={otherDeliveryType}
                        onChange={handleOtherDeliveryTypeChange}
                      >
                        <FormControlLabel
                          value="domicilio"
                          control={<Radio />}
                          label="Envío a domicilio"
                        />
                        {otherDeliveryType === "domicilio" && (
                          <Box sx={{ pl: 4, pr: 4, width: "100%" }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nombre de la agencia"
                              variant="outlined"
                              name="agencyName"
                              value={shippingData.agencyName || ""}
                              onChange={handleInputChange}
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              fullWidth
                              size="small"
                              label="Dirección"
                              variant="outlined"
                              name="address"
                              value={shippingData.address || ""}
                              onChange={handleInputChange}
                              sx={{ mb: 2 }}
                            />
                          </Box>
                        )}
                        <FormControlLabel
                          value="agencia"
                          control={<Radio />}
                          label="Retiro en agencia"
                        />
                        {otherDeliveryType === "agencia" && (
                          <Box sx={{ pl: 4, pr: 4, width: "100%" }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nombre de la agencia"
                              variant="outlined"
                              name="agencyName"
                              value={shippingData.agencyName || ""}
                              onChange={handleInputChange}
                              sx={{ mb: 2 }}
                            />
                          </Box>
                        )}
                      </RadioGroup>
                    </FormControl>
                  </Box>
                )}
              </FormControl>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>Costo de envío</Typography>
                <Typography>
                  {shippingMethod === "retiro" ? "$ 0" : `$ ${shippingCost}`}
                </Typography>
              </Box>

              {shippingMethod === "envio" &&
                (shippingType === "ues" || shippingType === "agencia") && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCalculateShipping}
                    disabled={!isFormValid()}
                    sx={{
                      bgcolor: "#1e1e1e",
                      "&:hover": {
                        bgcolor: "#333",
                      },
                      mb: 2,
                    }}
                  >
                    Calcular envío
                  </Button>
                )}
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={handleCheckout}
              disabled={shippingType === "ues" && !shippingCalculated}
              sx={{
                mt: 3,
                bgcolor: "#1e1e1e",
                "&:hover": {
                  bgcolor: "#333",
                },
                "&.Mui-disabled": {
                  bgcolor: "#cccccc",
                  color: "#666666",
                },
              }}
            >
              Finalizar compra
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPage;
