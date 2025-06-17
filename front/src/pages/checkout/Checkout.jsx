import "../../styles/pages/Checkout.css";

import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";

import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  Button,
  TextField,
  FormControl,
  Grid,
  Typography,
  Paper,
  MenuItem,
  Select,
  TableCell,
  TableBody,
  TableRow,
  Table,
  TableHead,
  InputLabel,
  IconButton,
  Box,
  Container,
  Breadcrumbs,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  CircularProgress,
} from "@mui/material";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";

import { NavigateNext } from "@mui/icons-material";
import { Link as MuiLink } from "@mui/material";
import confetti from "canvas-confetti";

//para mercadopago
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

// Configurar axios para manejar CORS
axios.defaults.withCredentials = true;

const Checkout = () => {
  const {
    cart,
    getTotalPrice,
    getTotalWithShipment,
    getFormatCurrency,
    orderData: cartOrderData,
    getSubtotal,
    updateOrderData,
    clearAll,
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  //para mercadopago
  initMercadoPago(import.meta.env.VITE_PUBLICKEY, {
    locale: "es-UY",
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramValue = queryParams.get("status");
  const [preferenceId, setPreferenceId] = useState(null);
  const [shippingData, setShippingData] = useState(null);

  // Lista de países más comunes (para carga inicial rápida)
  const commonCountries = [
    { code: "UY", name: "Uruguay" },
    // { code: 'AR', name: 'Argentina' },
    // { code: 'BR', name: 'Brasil' },
    // Puedes agregar más países comunes
  ];  

  // Solo una declaración de countries
  const [countries, setCountries] = useState(commonCountries);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const urlPublicFrontEnv = import.meta.env.VITE_URL_Public_Frontend;
  const urlPublicBackEnv = import.meta.env.VITE_URL_Public_Backend; 
  const emailNotificationFromEcommerce = import.meta.env.VITE_EMAIL_Notification_From_eCommerce;
  const emailNotificationComercio = import.meta.env.VITE_EMAIL_Notification_Comercio;
  const banco = import.meta.env.VITE_Banco;
  const bancoCuenta = import.meta.env.VITE_Banco_Cuenta;
  const bancoTitular = import.meta.env.VITE_Banco_Titular;
  const nroContacto = import.meta.env.VITE_Nro_contacto;

  // Obtener datos del pedido del localStorage
  const [orderData] = useState(() => {
    const data = localStorage.getItem("orderData");
    return data ? JSON.parse(data) : { shippingMethod: "", shippingCost: 0 };
  });

  // Usar el orderData del contexto para el costo de envío
  const { shippingMethod } = orderData;

  // Estado para controlar si los datos de ubicación están cargados
  const [locationDataLoaded, setLocationDataLoaded] = useState(false);

  // Mover la función handlePayment antes de usarla en formik
  const handlePayment = async () => {
    // Marcar todos los campos como tocados para mostrar errores
    const requiredFields = [
      "nombre",
      "apellido",
      "email",
      "celular",
      "pais",
      "ciudad",
      "localidad",
      "codigoPostal",
    ];

    requiredFields.forEach((field) => {
      formik.setFieldTouched(field, true);
    });

    // Validar el formulario
    const errors = await formik.validateForm();

    if (Object.keys(errors).length === 0) {
      // Verificar que haya productos en el carrito
      if (!cart || cart.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Carrito vacío",
          text: "No hay productos en el carrito para realizar la compra",
        });
        return;
      }

      // Verificar que se haya seleccionado un método de pago
      if (!paymentMethod) {
        Swal.fire({
          icon: "error",
          title: "Método de pago no seleccionado",
          text: "Por favor, seleccione un método de pago para continuar",
        });
        return;
      }

      setIsProcessing(true);

      const newOrderData = JSON.parse(
        localStorage.getItem("orderData") || "{}"
      );

      try {
        updateOrderData({
          items: cart,
          customerData: formik.values,
          paymentMethod: paymentMethod,
          shippingMethod: newOrderData.shippingMethod || null,

          guiaID: newOrderData.guiaID || null,
          tracking_web: newOrderData.tracking_web || null,
          agenciaData: newOrderData.agenciaData || null,

          totals: {
            subtotal: getTotalPrice(),
            shipping: newOrderData.shippingCost || 0,
            total: getTotalWithShipment(),
          },
        });

        await createOrder();
      } catch (error) {
        console.error("Error:", error);
        setIsProcessing(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al procesar tu orden",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "Por favor complete todos los campos requeridos",
      });
    }
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es obligatorio"),
    apellido: Yup.string().required("El apellido es obligatorio"),
    email: Yup.string()
      .email("Email inválido")
      .required("El email es obligatorio"),
    celular: Yup.string()
      .matches(/^\d+$/, "Solo se permiten números")
      .required("El celular es obligatorio"),
    pais: Yup.string().required("El país es obligatorio"),
    ciudad: Yup.string().required("La ciudad es obligatoria"),
    localidad: Yup.string().required("La localidad es obligatoria"),
    codigoPostal: Yup.string()
      .matches(/^\d+$/, "Solo se permiten números")
      .required("El código postal es obligatorio"),
  });

  const formik = useFormik({
    initialValues: {
      nombre: "",
      apellido: "",
      email: user?.email || "",
      celular: "",
      pais: "",
      ciudad: "",
      localidad: "",
      codigoPostal: "",
      informacionAdicional: "",
    },
    validationSchema,
    onSubmit: handlePayment,
  });

  // carga los tipos de envios
  useEffect(() => {
    let shipmentCollection = collection(db, "shipment");

    const fetchData = async () => {
      try {
        const res = await getDocs(shipmentCollection);
        const docData = res.docs.map((doc) => doc.data());
        const defaultOption = docData.length > 0 ? docData[0] : null;
        console.log(docData);
        setShipmentOptions(docData);
        setSelectedOption(defaultOption);
      } catch (error) {
        console.log(error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Cargar países con caché
  useEffect(() => {
    const getCountries = async () => {
      try {
        // Intentar obtener países del caché
        const cachedCountries = localStorage.getItem("countries");
        if (cachedCountries) {
          setCountries(JSON.parse(cachedCountries));
          setIsLoading(false);
          return;
        }

        // Si no hay caché, hacer la llamada a la API

        const apiUrlBack = urlPublicBackEnv
            ? `${urlPublicBackEnv}/api/countries`
            : "http://localhost:8081/api/countries";

        const response = await axios.get(apiUrlBack);
        setCountries(response.data);

        // Guardar en caché
        localStorage.setItem("countries", JSON.stringify(response.data));

        // Actualizar cada 24 horas
        localStorage.setItem("countriesTimestamp", Date.now());
      } catch (error) {
        console.error("Error al obtener países:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Verificar si necesitamos actualizar el caché
    const timestamp = localStorage.getItem("countriesTimestamp");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (!timestamp || now - timestamp > oneDay) {
      getCountries();
    } else {
      // Usar caché existente
      const cachedCountries = localStorage.getItem("countries");
      if (cachedCountries) {
        setCountries(JSON.parse(cachedCountries));
      }
      setIsLoading(false);
    }
  }, []);

  // Cargar datos de envío y ubicación al inicio
  useEffect(() => {
    const shippingDatas = JSON.parse(
      localStorage.getItem("shippingData") || "{}"
    );
    setShippingData(shippingDatas);

    // Si hay datos de ubicación, seleccionar Uruguay por defecto
    if (shippingDatas.departamento || shippingDatas.localidad) {
      const uruguay = commonCountries.find(country => country.code === "UY");
      if (uruguay) {
        formik.setFieldValue("pais", uruguay.name);
        handleCountryChange(uruguay);
      }
    }
  }, []);

  // Efecto para cargar departamentos cuando se selecciona Uruguay
  useEffect(() => {
    const fetchLocations = async () => {

      const apiUrlBack = urlPublicBackEnv
            ? `${urlPublicBackEnv}/api/ues/locations`
            : "http://localhost:8081/api/ues/locations";

      try {
        const response = await axios.get(apiUrlBack);
        setStates(response.data);
        
        // Si hay datos de envío guardados, seleccionar el departamento
        if (shippingData?.departamento) {
          const selectedState = response.data.find(
            state => state.nombre === shippingData.departamento
          );
          if (selectedState) {
            formik.setFieldValue("ciudad", selectedState.nombre);
            setCities(selectedState.localidades || []);
            
            // Si hay localidad guardada, seleccionarla
            if (shippingData.localidad) {
              const selectedCity = selectedState.localidades?.find(
                city => city.nombre === shippingData.localidad
              );
              if (selectedCity) {
                formik.setFieldValue("localidad", selectedCity.nombre);
                // Actualizar el código postal si existe
                if (selectedCity.codigo_postal) {
                  formik.setFieldValue("codigoPostal", selectedCity.codigo_postal);
                }
              }
            }
          }
        }
        setLocationDataLoaded(true);
      } catch (error) {
        console.error("Error al cargar las localidades:", error);
      }
    };

    if (formik.values.pais === "Uruguay") {
      fetchLocations();
    }
  }, [formik.values.pais, shippingData]);

  // Modificar handleCountryChange para manejar la selección de Uruguay
  const handleCountryChange = async (selectedCountry) => {
    if (selectedCountry) {
      try {
        //si el pais es uruguay, apunto a la API de UES
        ///api/ues/locations

        const apiUrlBack = urlPublicBackEnv
            ? `${urlPublicBackEnv}/api/ues/locations`
            : "http://localhost:8081/api/ues/locations";

        if (selectedCountry.code === "UY") {
          const response = await axios.get(apiUrlBack);
          setStates(response.data);
          
          // Si hay datos de envío guardados, seleccionar el departamento
          if (shippingData?.departamento) {
            const selectedState = response.data.find(
              state => state.nombre === shippingData.departamento
            );
            if (selectedState) {
              formik.setFieldValue("ciudad", selectedState.nombre);
              setCities(selectedState.localidades || []);
              
              // Si hay localidad guardada, seleccionarla
              if (shippingData.localidad) {
                const selectedCity = selectedState.localidades?.find(
                  city => city.nombre === shippingData.localidad
                );
                if (selectedCity) {
                  formik.setFieldValue("localidad", selectedCity.nombre);
                  // Actualizar el código postal si existe
                  if (selectedCity.codigo_postal) {
                    formik.setFieldValue("codigoPostal", selectedCity.codigo_postal);
                  }
                }
              }
            }
          }
        } else {
          const selectedState = states.find((state) => state.name === cityName);
          if (selectedState) {

            const apiUrlBack = urlPublicBackEnv
            ? `${urlPublicBackEnv}/api/cities/${selectedCountry.code}/${selectedState.iso2}`
            : `http://localhost:8081/api/cities/${selectedCountry.code}/${selectedState.iso2}`;

            const response = await axios.get(apiUrlBack);
            setCities(response.data);
          }
        }
      } catch (error) {
        console.error("Error al obtener localidades:", error);
        setCities(commonCities);
      }
    }
  };

  const handleShipmentOptionChange = (selectedOption) => {
    setShipmentOptions((prevOptions) => {
      const updatedOptions = prevOptions.map((opt) => ({
        ...opt,
        selected: opt.name === selectedOption.name,
      }));

      setShipmentCost(selectedOption.cost);
      setSelectedOption(selectedOption);
      setSelectedOptionDescription(selectedOption.description);

      return updatedOptions;
    });
  };

  // Primero agregamos la función para calcular el precio con descuento
  const calculateDiscountedPrice = (item) => {
    if (item.discount) {
      return item.unit_price - item.unit_price * (item.discount / 100);
    }
    return item.unit_price;
  };

  // Cuando se selecciona el método de pago
  const handlePaymentMethodChange = (event) => {
    const method = event.target.value;
    setPaymentMethod(method);

    

    // Guardar todo en orderData
    localStorage.setItem(
      "orderData",
      JSON.stringify({
        customerData: formik.values,
        paymentMethod: method,
        shippingMethod: shippingData.shippingMethod || shippingMethod,
        shippingCost:
          shippingData.shippingCost || cartOrderData.shippingCost || 0,
        guiaID: shippingData.guiaID || null,
        tracking_web: shippingData.tracking_web || null,
        agenciaData: shippingData.agenciaData || null,
      })
    );

    // Ya no necesitamos shippingData separado
    localStorage.removeItem("shippingData");
  };

  // Al cargar el componente
  useEffect(() => {
    const savedOrderData = JSON.parse(
      localStorage.getItem("orderData") || "{}"
    );
    if (savedOrderData.paymentMethod) {
      setPaymentMethod(savedOrderData.paymentMethod);
    }
  }, []);

  // Al cargar el componente, verificar el estado del pago de Mercado Pago
  useEffect(() => {
    // Si hay un paramValue (retornamos de Mercado Pago)
    if (paramValue) {
      console.log("Retorno de Mercado Pago con estado:", paramValue);

      // Si el pago fue aprobado, completar la compra automáticamente
      if (paramValue === "approved") {
        // Establecer método de pago
        setPaymentMethod("mercadopago");

        // Recuperar datos guardados
        const savedOrderData = JSON.parse(
          localStorage.getItem("orderData") || "{}"
        );
        console.log(
          "LÍNEA NUEVA - Datos recuperados de orderData:",
          savedOrderData
        );

        // Recuperar carrito guardado
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        console.log("LÍNEA NUEVA - Carrito recuperado:", savedCart);

        // Restaurar los datos del formulario si existen
        if (savedOrderData.customerData) {
          console.log(
            "Recuperando datos del cliente:",
            savedOrderData.customerData
          );

          // Llenar TODOS los campos del formulario explícitamente
          formik.setFieldValue(
            "nombre",
            savedOrderData.customerData.nombre || ""
          );
          formik.setFieldValue(
            "apellido",
            savedOrderData.customerData.apellido || ""
          );
          formik.setFieldValue(
            "email",
            savedOrderData.customerData.email || user?.email || ""
          );
          formik.setFieldValue(
            "celular",
            savedOrderData.customerData.celular || ""
          );
          formik.setFieldValue("pais", savedOrderData.customerData.pais || "");
          formik.setFieldValue(
            "ciudad",
            savedOrderData.customerData.ciudad || ""
          );
          formik.setFieldValue(
            "localidad",
            savedOrderData.customerData.localidad || ""
          );
          formik.setFieldValue(
            "codigoPostal",
            savedOrderData.customerData.codigoPostal || ""
          );
          formik.setFieldValue(
            "informacionAdicional",
            savedOrderData.customerData.informacionAdicional || ""
          );

          // Procesar la orden con un pequeño retraso para asegurar que se actualicen los estados
          setTimeout(() => {
            console.log(
              "Procesando orden después de pago aprobado con datos:",
              formik.values
            );
            createOrder();
          }, 2000);
        } else {
          console.error("No se encontraron datos del cliente guardados");
        }
      } else if (paramValue === "failure") {
        // Si el pago falló, mostrar mensaje de error
        Swal.fire({
          icon: "error",
          title: "Pago rechazado",
          text: "El pago a través de Mercado Pago no fue aprobado. Por favor intenta con otro método de pago.",
        });
      }
    }
  }, [paramValue]);

  // Cargar datos del usuario logueado
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Actualizar todos los campos del formulario
            formik.setValues({
              ...formik.values,
              nombre: userData.nombre || "",
              apellido: userData.apellido || "",
              email: user.email,

              direccion: userData.direccion || "",
              celular: userData.celular || "",
              informacionAdicional: userData.informacionAdicional || "",
            });

            if (userData.pais) {
              formik.setFieldValue("pais", userData.pais);
              await handleCountryChange({ target: { value: userData.pais } });
              await new Promise((resolve) => setTimeout(resolve, 10));

              // Cargar ciudad y esperar que se carguen las localidades
              if (userData.ciudad) {
                formik.setFieldValue("ciudad", userData.ciudad);
                await handleStateChange({ target: { value: userData.ciudad } });
                await new Promise((resolve) => setTimeout(resolve, 100));

                if (userData.localidad) {
                  formik.setFieldValue("localidad", userData.localidad);
                }
                if (userData.codigoPostal) {
                  formik.setFieldValue("codigoPostal", userData.codigoPostal);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
        }
      }
    };

    loadUserData();
  }, [user]);

  const createOrder = async () => {
    try {
      console.log("Iniciando createOrder con método de pago:", paymentMethod);
      console.log("Status de Mercado Pago:", paramValue);
      setIsProcessing(true);

      // FORZAR MERCADOPAGO si hay paramValue === 'approved'
      if (paramValue === "approved") {
        console.log("FORZANDO MÉTODO DE PAGO MERCADOPAGO");
        setPaymentMethod("mercadopago");
      }

      // Obtener cartFromStorage siempre
      const cartFromStorage = JSON.parse(localStorage.getItem("cart") || "[]");

      // Obtener todos los datos del localStorage en un solo lugar
      const orderDataFromStorage = JSON.parse(
        localStorage.getItem("orderData") || "{}"
      );

      // Determinar qué items usar para la orden - USAR SIEMPRE LOCALSTORAGE SI EXISTE
      const itemsToUse = cartFromStorage.length > 0 ? cartFromStorage : cart;

      // CASO 1: Si el método de pago es Mercado Pago
      if (paymentMethod === "mercadopago") {
        // Si no hay paramValue y no estamos regresando de MP, iniciar flujo
        if (!paramValue) {
          // Calcular subtotal y total antes de redirigir y guardarlos
          const subtotalToSave = getTotalPrice();
          const totalToSave = getTotalWithShipment();

          // Guardar datos del cliente para recuperarlos después
          localStorage.setItem(
            "orderData",
            JSON.stringify({
              customerData: formik.values,
              paymentMethod: "mercadopago",
              shippingMethod: orderDataFromStorage.shippingMethod || "",
              shippingCost: orderDataFromStorage.shippingCost || 0,
              guiaID: orderDataFromStorage.guiaID || null,
              tracking_web: orderDataFromStorage.tracking_web || null,
              subtotal: subtotalToSave,
              total: totalToSave,
            })
          );

          // Crear preferencia para mostrar wallet
          const id = await createPreference();
          if (id) {
            setPreferenceId(id);
            return; // No crear orden todavía, esperar respuesta de MP
          } else {
            throw new Error("No se pudo crear la preferencia de pago");
          }
        }
        // Si hay paramValue pero no es approved, mostrar error
        else if (paramValue !== "approved") {
          throw new Error("El pago no fue aprobado por Mercado Pago");
        }
      }

      // FORZAR el estado "Pagado" si es Mercado Pago aprobado
      let estadoCompraFinal = "En espera";
      if (paramValue === "approved") {
        estadoCompraFinal = "Pagado";
        console.log("FORZANDO ESTADO DE COMPRA: Pagado");
      }

      // Usar valores guardados de subtotal y total si existen (para MP aprobado)
      const finalSubtotal =
        paramValue === "approved" && orderDataFromStorage.subtotal
          ? orderDataFromStorage.subtotal
          : getTotalPrice();

      const finalTotal =
        paramValue === "approved" && orderDataFromStorage.total
          ? orderDataFromStorage.total
          : getTotalWithShipment();

      // Preparar datos para la orden
      const orderData = {
        customerData: orderDataFromStorage.customerData,
        items: itemsToUse,
        total: finalTotal,
        subtotal: finalSubtotal,
        shippingCost: orderDataFromStorage.shippingCost || 0,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        //si shippingMethod es retiro, entrega es retiro, sino es en espera
        entrega:
          orderDataFromStorage.shippingMethod === "retiro"
            ? "Retiro"
            : "En espera",
        estadoCompra: estadoCompraFinal,
        paymentMethod: orderDataFromStorage.paymentMethod,
        shippingMethod: orderDataFromStorage.shippingMethod || "retiro",
        guiaID: orderDataFromStorage.guiaID || null,
        tracking_web: orderDataFromStorage.tracking_web || null,
      };

      console.log("Datos de orden a guardar:", JSON.stringify(orderData));

      // Guardar la orden en Firebase
      let orderRef;
      try {
        orderRef = await addDoc(collection(db, "orders"), orderData);
        console.log("Orden guardada con ID:", orderRef.id);
      } catch (firebaseError) {
        console.error("Error al guardar en Firebase:", firebaseError);
        throw new Error("Error al guardar la orden en la base de datos");
      }

      // Actualizar stock
      try {
        for (const item of itemsToUse) {
          const productRef = doc(db, "products", item.id);
          const productDoc = await getDoc(productRef); // Obtener el producto

          if (productDoc.exists()) {
            const productData = productDoc.data();

            // Verificar si es un producto con variantes y el item tiene SKU
            if (item.sku && Array.isArray(productData.variants) && productData.variants.length > 0) {
              // Es una variante
              const updatedVariants = productData.variants.map(variant => {
                if (variant.sku === item.sku) {
                  return { ...variant, stock: Math.max(0, (variant.stock || 0) - item.quantity) }; // Asegurar que el stock no sea negativo
                }
                return variant;
              });
              await updateDoc(productRef, { variants: updatedVariants });
              console.log(`Stock de variante actualizado para SKU: ${item.sku}, Producto ID: ${item.id}`);
            } else {
              // Es un producto simple (o un item sin SKU, fallback a lógica anterior)
              await updateDoc(productRef, {
                stock: increment(-item.quantity),
              });
              console.log(`Stock global actualizado para Producto ID: ${item.id}`);
            }
          } else {
            console.warn(`Producto no encontrado para actualizar stock: ID ${item.id}`);
          }
        }
        console.log("Stock actualizado correctamente (frontend)");
      } catch (stockError) {
        console.error("Error al actualizar stock (frontend):", stockError);
        // Continuamos a pesar del error en stock, pero lo logueamos
      }

      // Enviar emails
      try {
        const apiUrlBack = urlPublicBackEnv
            ? `${urlPublicBackEnv}/send-email-checkout`
            : `http://localhost:8081/send-email-checkout`;

        await axios.post(apiUrlBack, {
          to: emailNotificationComercio,
          subject: "Nueva venta realizada",
          order: {
            orderId: orderRef.id,
            ...orderDataFromStorage.customerData,
              total: finalTotal, //getTotalWithShipment(),
              paymentMethod: orderDataFromStorage.paymentMethod,
              estadoCompra: estadoCompraFinal,
            },
          }
        );

        const apiUrlBackUser = urlPublicBackEnv
            ? `${urlPublicBackEnv}/send-email-checkout-user`
            : `http://localhost:8081/send-email-checkout-user`;

        await axios.post(apiUrlBackUser, {
          to: orderDataFromStorage.customerData.email,
          subject: "Confirmación de compra - Kuka Store",
          customerName: `${orderDataFromStorage.customerData.nombre} ${orderDataFromStorage.customerData.apellido}`,
          orderId: orderRef.id,
          orderDetails: {
            items: itemsToUse.map((item) => ({
                ...item,
                price: item.unit_price,
                priceWithDiscount: item.discount
                  ? item.unit_price - (item.unit_price * item.discount) / 100
                  : item.unit_price,
                subtotal: item.discount
                  ? (item.unit_price -
                      (item.unit_price * item.discount) / 100) *
                    item.quantity
                  : item.unit_price * item.quantity,
              })),
              subtotal: finalSubtotal, //getTotalPrice(),
              shippingCost: orderDataFromStorage.shippingCost || 0,
              totalConEnvio: finalTotal, //getTotalWithShipment(),
              paymentMethod: orderDataFromStorage.paymentMethod,
              estadoCompra: estadoCompraFinal,
              shippingMethod: orderDataFromStorage.shippingMethod || "retiro",
              guiaID: orderDataFromStorage.guiaID || null,
              tracking_web: orderDataFromStorage.tracking_web || null,
            },
          }
        );

        console.log("Emails enviados correctamente");
      } catch (emailError) {
        console.error("Error al enviar emails:", emailError);
        // Continuamos a pesar del error en emails
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "¡Compra realizada con éxito!",
        text: "Gracias por tu compra",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Disparar confeti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      //actualizo los datos del cliente con los datos de customerData en firebase
      //si existe el usuario actualizo sus datos sino no hago nada
      if (user?.id) {
        await updateDoc(doc(db, "users", user.id), {
          ...orderDataFromStorage.customerData,

          direccion: orderDataFromStorage.customerData.direccion,
          celular: orderDataFromStorage.customerData.celular,
          informacionAdicional:
            orderDataFromStorage.customerData.informacionAdicional,
          pais: orderDataFromStorage.customerData.pais,
          ciudad: orderDataFromStorage.customerData.ciudad,
          localidad: orderDataFromStorage.customerData.localidad,
          codigoPostal: orderDataFromStorage.customerData.codigoPostal,
        });
      }

      // Esperar un poco antes de limpiar y navegar
      setTimeout(() => {
        // Navegar a la página de confirmación
        navigate("/compra-finalizada", {
          state: {
            orderData: {
              ...orderData,
              orderId: orderRef.id,
            },
          },
        });

        // COMENTADO: No limpiar localStorage por ahora
        // setTimeout(() => {
        //   clearAll();
        //   localStorage.removeItem('orderData');
        // }, 500);
      }, 2000);
    } catch (error) {
      console.error("Error detallado al crear la orden:", error);
      setIsProcessing(false);

      // Mostrar mensaje de error específico
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al procesar tu orden",
      });
    }
  };

  const createPreference = async () => {
    const items = cart.map((product) => {
      return {
        title: product.title,
        unit_price: product.unit_price,
        quantity: product.quantity,
      };
    });

    console.log("Enviando orden al server...");

    const apiUrlBackUser = urlPublicBackEnv
            ? `${urlPublicBackEnv}/create_preference`
            : `http://localhost:8081/create_preference`;

    try {
      let response = await axios.post(
        apiUrlBackUser,
        {
          items: items,
          shipment_cost: parseFloat(orderData.shippingCost || 0),
          // shipment_options: "default", //ver si en el caso de UES es necesario
        }
      );
      console.log("Respuesta del servidor:", response.data);

      const { id } = response.data;
      return id;
    } catch (error) {
      console.log("Error al enviar solicitud al servidor:", error);

      throw error;
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        py: 4,
      }}
    >
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
          Facturación
        </Typography>

        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 4 }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Inicio
          </Link>
          <Typography color="text.primary">Detalle de facturación</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Columna de formulario */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>
              Detalles de facturación
            </Typography>

            <Box sx={{ maxWidth: "600px" }}>
              {/* Nombre y Apellido en la misma fila con espacio específico */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  label="Nombre"
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Apellido"
                  name="apellido"
                  value={formik.values.apellido}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.apellido && Boolean(formik.errors.apellido)
                  }
                  helperText={formik.touched.apellido && formik.errors.apellido}
                  sx={{ flex: 1 }}
                />
              </Box>

              <TextField
                size="small"
                fullWidth
                label="Dirección"
                name="direccion"
                value={formik.values.direccion}
                onChange={formik.handleChange}
                error={
                  formik.touched.direccion && Boolean(formik.errors.direccion)
                }
                helperText={formik.touched.direccion && formik.errors.direccion}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              {/* Resto de campos en columna */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>País</InputLabel>
                <Select
                  value={formik.values.pais}
                  onChange={(e) => {
                    const countryName = e.target.value;
                    const selectedCountry = countries.find(
                      (country) => country.name === countryName
                    );
                    formik.setFieldValue("pais", countryName);
                    formik.setFieldValue("ciudad", "");
                    formik.setFieldValue("localidad", "");
                    formik.setFieldValue("codigoPostal", "");
                    setStates([]);
                    setCities([]);
                    if (selectedCountry) {
                      handleCountryChange(selectedCountry);
                    }
                  }}
                  label="País"
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Ciudad</InputLabel>
                <Select
                  value={formik.values.ciudad}
                  onChange={(e) => {
                    const cityName = e.target.value;
                    const selectedCountry = countries.find(
                      (country) => country.name === formik.values.pais
                    );
                    formik.setFieldValue("ciudad", cityName);
                    formik.setFieldValue("localidad", "");
                    if (selectedCountry) {
                      const selectedState = states.find(
                        (state) => state.nombre === cityName
                      );
                      if (selectedState) {
                        setCities(selectedState.localidades || []);
                      }
                    }
                  }}
                  label="Ciudad"
                  disabled={!formik.values.pais || !locationDataLoaded}
                >
                  {states.map((state) => (
                    <MenuItem key={state.id} value={state.nombre}>
                      {state.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {!locationDataLoaded && formik.values.pais === "Uruguay" && (
                  <FormHelperText>Cargando departamentos...</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Localidad</InputLabel>
                <Select
                  value={formik.values.localidad}
                  onChange={(e) => {
                    formik.setFieldValue("localidad", e.target.value);
                    // Actualizar el código postal cuando se selecciona una localidad
                    const selectedCity = cities.find(
                      city => city.nombre === e.target.value
                    );
                    if (selectedCity && selectedCity.codigo_postal) {
                      formik.setFieldValue("codigoPostal", selectedCity.codigo_postal);
                    }
                  }}
                  label="Localidad"
                  disabled={!formik.values.ciudad || cities.length === 0}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.nombre}>
                      {city.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {formik.values.ciudad && cities.length === 0 && (
                  <FormHelperText>Cargando localidades...</FormHelperText>
                )}
              </FormControl>

              <TextField
                size="small"
                fullWidth
                label="Código Postal"
                name="codigoPostal"
                value={formik.values.codigoPostal}
                onChange={formik.handleChange}
                error={
                  formik.touched.codigoPostal &&
                  Boolean(formik.errors.codigoPostal)
                }
                helperText={
                  formik.touched.codigoPostal && formik.errors.codigoPostal
                }
                sx={{ mb: 2 }}
              />

              <TextField
                size="small"
                fullWidth
                label="Celular"
                name="celular"
                value={formik.values.celular}
                onChange={formik.handleChange}
                error={formik.touched.celular && Boolean(formik.errors.celular)}
                helperText={formik.touched.celular && formik.errors.celular}
                sx={{ mb: 2 }}
              />

              <TextField
                size="small"
                fullWidth
                label="Correo electrónico"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
              />

              <TextField
                size="small"
                fullWidth
                multiline
                rows={3}
                label="Información adicional"
                name="informacionAdicional"
                value={formik.values.informacionAdicional}
                onChange={formik.handleChange}
                placeholder="Notas sobre tu pedido, por ejemplo, notas especiales para la entrega"
                sx={{ mb: 2 }}
              />
            </Box>
          </Grid>

          {/* Columna de resumen */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 3,
                mb: 4, // Agregamos margen inferior
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Artículos en el carrito
              </Typography>
              {cart.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography>
                      {item.title} x {item.quantity}
                    </Typography>
                    {(item.size || item.color) && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95em', opacity: 0.7 }}>
                        {item.size && `Talle: ${item.size} `}
                        {item.size && item.color ? '- ' : ''}
                        {item.color && `Color: ${item.color}`}
                      </Typography>
                    )}
                    {item.sku && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', opacity: 0.5, fontStyle: 'italic', mt: 0.2 }}>
                        SKU: {item.sku}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    {item.discount > 0 ? (
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: "line-through",
                            color: "text.secondary",
                          }}
                        >
                          {getFormatCurrency(item.unit_price * item.quantity)}
                        </Typography>
                        <Typography color="error">
                          {getFormatCurrency(
                            calculateDiscountedPrice(item) * item.quantity
                          )}
                        </Typography>
                      </>
                    ) : (
                      <Typography>
                        {getFormatCurrency(item.unit_price * item.quantity)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />

              {/* Mostramos el subtotal original si hay descuentos */}
              {cart.some((item) => item.discount > 0) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography>Subtotal</Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {getFormatCurrency(
                      cart.reduce(
                        (total, item) =>
                          total + item.unit_price * item.quantity,
                        0
                      )
                    )}
                  </Typography>
                </Box>
              )}

              {/* Mostramos el descuento total si hay descuentos */}
              {cart.some((item) => item.discount > 0) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography color="error">Descuento</Typography>
                  <Typography color="error">
                    -
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
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>Costo de envío</Typography>
                <Typography>
                  {getFormatCurrency(cartOrderData.shippingCost || 0)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {getFormatCurrency(getTotalWithShipment())}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Medio de pago
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel
                    value="transferencia"
                    control={<Radio />}
                    label="Transferencia bancaria"
                  />
                  {paymentMethod === "transferencia" && (
                    <Box
                      sx={{
                        ml: 4,
                        mb: 2,
                        bgcolor: "grey.100",
                        p: 2,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Datos bancarios:
                      </Typography>
                      <Typography variant="body2">Banco: {banco}</Typography>
                      <Typography variant="body2">
                        Cuenta: {bancoCuenta}
                      </Typography>
                      <Typography variant="body2">
                        Titular: {bancoTitular}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "text.secondary" }}
                      >
                        Una vez realizada la transferencia, enviar el
                        comprobante a {emailNotificationComercio}, o 
                        al whatsapp 0{nroContacto}
                      </Typography>
                    </Box>
                  )}
                  <FormControlLabel
                    value="mercadopago"
                    control={<Radio />}
                    label="Mercado Pago"
                  />

                  {shippingData && shippingData.shippingMethod === "retiro" && (
                  <FormControlLabel
                    value="efectivo"
                    control={<Radio />}
                    label="Efectivo en la entrega"
                  />
                  )}

                </RadioGroup>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                onClick={handlePayment}
                disabled={!paymentMethod || cart.length === 0 || isProcessing}
                sx={{
                  mt: 3,
                  bgcolor: "#1e1e1e",
                  color: "white",
                  position: "relative",
                  "&:hover": {
                    bgcolor: "#333",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#cccccc",
                    color: "#666666",
                  },
                }}
              >
                {isProcessing ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        color: "white",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: "-12px",
                        marginLeft: "-12px",
                      }}
                    />
                    Procesando...
                  </>
                ) : (
                  "Pagar"
                )}
              </Button>

              {/* Boton de mercadopago */}

              {preferenceId && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    "& .mercadopago-button": {
                      backgroundColor: "#1e1e1e !important",
                      color: "white !important",
                      fontFamily: "inherit !important",
                      borderRadius: "4px !important",
                      height: "48px !important",
                      fontSize: "16px !important",
                      fontWeight: "500 !important",
                      boxShadow: "none !important",
                      border: "none !important",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: "bold", color: "#333" }}
                  >
                    Pagar con Mercado Pago
                  </Typography>
                  <Wallet
                    initialization={{ preferenceId, redirectMode: "self" }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;
