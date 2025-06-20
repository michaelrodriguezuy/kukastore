const express = require("express");
const cors = require("cors");
const app = express();
const mercadopago = require("mercadopago");
require("dotenv").config();


const nodemailer = require('nodemailer');
//const { google } = require('googleapis');
//const OAuth2 = google.auth.OAuth2;
const cron = require('node-cron');

//const accountTransport = require('./account_transport.json');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API KEY para obtener ciudades y estados
const API_KEY = process.env.API_KEY;

// Primero agregar las variables de entorno
const UES_CLIENT = process.env.UES_CLIENT;
const UES_TOKEN = process.env.UES_TOKEN;
const UES_USER = process.env.UES_USER;
const UES_PASSWORD = process.env.UES_PASSWORD;

const urlPublicFrontEnv = process.env.URL_Public_Frontend;
const urlPublicBackEnv = process.env.URL_Public_Backend;

const emailNotificationFromEcommerce = process.env.EMAIL_Notification_From_eCommerce;
const emailNotificationComercio = process.env.EMAIL_Notification_Comercio;

const banco = process.env.Banco;
const bancoCuenta = process.env.Banco_Cuenta;
const bancoTitular = process.env.Banco_Titular;
const nroContacto = process.env.Nro_contacto;
const direccionLocal = process.env.Direccion_local_1;
const diasHorarios = process.env.Dias_horarios_1 + ' ' + process.env.Dias_horarios_1_;
const horasLiberacionCompras = process.env.Horas_Liberacion_Ordenes;

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN
});

app.use(express.json());

// Configuración de CORS solo para pruebas
app.use((req, res, next) => {

  console.log('Middleware CORS ejecutado para:', req.method, req.url);


  const allowedOrigins = [    
    urlPublicFrontEnv || 'http://localhost:5173',
  ].filter(Boolean);

  const origin = req.headers.origin;

  console.log('Origen de la solicitud:', origin);
  console.log('Orígenes permitidos:', allowedOrigins);

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Configuración del transporter usando contraseña de aplicación desde .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'kukastore.tyt@gmail.com',
        pass: process.env.EMAIL_PASS // Contraseña de aplicación desde .env
    }
});

// Verificar la conexión al iniciar el servidor
transporter.verify(function (error, success) {
    if (error) {
        console.log("Error al configurar el servidor de correo:", error);
    } else {
        console.log("Servidor de correo listo para enviar mensajes");
    }
});

// Función simplificada para enviar correos
const sendMail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `kukastore <${emailNotificationFromEcommerce}>`, // Cambiar a la dirección de envío
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw error;
    }
};

// Función para obtener productos destacados de Firebase
const getDestacadosProducts = async () => {
    try {
        const snapshot = await admin.firestore()
            .collection('products')
            .where('destacado', '==', true)  // Asegurarnos que sea booleano true
            .get();

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('Productos destacados encontrados:', products.length); // Para debug
        return products;
    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        return [];
    }
};

// Función para obtener suscriptores de Firebase
const getSubscribers = async () => {
    const snapshot = await admin.firestore()
        .collection('newsletter')
        .get();

    return snapshot.docs.map(doc => doc.data().email);
};

// Función para convertir imagen a base64
const getLogoBase64 = () => {
    try {
        const logoPath = path.join(__dirname, '../front/src/assets/logo/', 'logo.png');
        const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
        return `data:image/png;base64,${logoBase64}`;
    } catch (error) {
        console.error('Error al cargar el logo:', error);
        return '';
    }
};

// Función para generar token de desuscripción
const generateUnsubscribeToken = (email) => {
    return Buffer.from(email).toString('base64');
};

// Función para verificar token de desuscripción
const verifyUnsubscribeToken = (token) => {
    return Buffer.from(token, 'base64').toString('ascii');
};

app.get("/", (req, res) => {
    res.send('Todo ok!! soy tu backend!');
});

//esta alternativa es usando ouath2 en lugar de la contraseña de aplicación
/* const mail_rover = async (callback) => {

    // Definir ruta para enviar correos electrónicos
    // Crear un objeto OAuth2 con los datos de la cuenta de transporte
    const oauth2Client = new OAuth2(
        accountTransport.auth.clientId,
        accountTransport.auth.clientSecret,
        "https://developers.google.com/oauthplayground", // Redirect URL
    );

    // Configurar credenciales de acceso
    oauth2Client.setCredentials({
        refresh_token: accountTransport.auth.refreshToken,
        tls: {
            rejectUnauthorized: false
        }
    });

    // Obtener un nuevo token de acceso
    oauth2Client.getAccessToken((err, token) => {

        if (err) {
            return console.log('Error al obtener token de acceso:', err);;
        }
        accountTransport.auth.accessToken = token;
        callback(nodemailer.createTransport(accountTransport));
    })
} */


// Crear un transportador SMTP con OAuth2
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         type: "OAuth2",
//         user: accountTransport.auth.user,
//         clientId: accountTransport.auth.clientId,
//         clientSecret: accountTransport.auth.clientSecret,
//         refreshToken: accountTransport.auth.refreshToken
//     }
// });

// Función para enviar correos electrónicos, con oauth2
/* function send(idAplicativo, to, text, subject, callback) {
    var id = 0;
    let _ID_APP_1;
    try {
        var id = parseInt(idAplicativo);
    } catch (error) {
        console.log(`error parse idAplicativo feedback.js ${error}`)
    }
    mail_rover(function (emailTransporter) {
        let json = {};
        switch (id) {
            case _ID_APP_1:
                json = {
                    mail: emailTransporter, app: 'CHECK', from: 'eCommerce <info@ecommerce.com>',
                    to,
                    subject,
                    text
                };
                break;
            default:
                json = {
                    mail: emailTransporter, app: 'CHECK', from: 'eCommerce <info@ecommerce.com>',
                    to,
                    subject,
                    text
                };
                break;
        }
        callback(json);
    });
} */

// aviso al usuario de registro
app.post('/send-email-register', async (req, res) => {
    const { to, text, subject } = req.body;
    await sendMail(to, subject, `
    <div style="text-align: center;">
      <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
    </div>
    <p>BIENVENID@</p>
    <p>${text}</p>
   
    <p><a href="${urlPublicFrontEnv || 'http://localhost:5173'}">Visita nuestra tienda</a></p>

    `);
    res.json({ message: 'Email enviado con éxito' });
});

//aviso al usuario de despachado
app.post('/send-email-despachado', async (req, res) => {
  const { to, subject, orderId, customerData } = req.body;
  await sendMail(to, subject, `
    <div style="text-align: center;">
      <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
    </div>
    <h2>¡Tu pedido ha sido despachado!</h2>
    <p>Tu número de orden es: ${orderId}</p>
    <p>Gracias por tu compra.</p>

    <p>¡Que disfrutes tu producto!</p>
    <p>Si tienes alguna pregunta, no dudes en <a href="${urlPublicFrontEnv || 'http://localhost:5173'}/contact">contactarnos</a>.</p>
    `);
  res.json({ message: 'Email de aviso de despachado enviado con éxito' });
});

//aviso al comercio
app.post('/send-email-checkout', async (req, res) => {
    const { to, subject, text, order } = req.body; // Agregamos order para recibir los datos de la compra
  await sendMail(to, subject, `
    <div style="text-align: center;">
      <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
    </div>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">¡Nueva Venta Realizada!</h2>
      
      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #1e1e1e; margin-bottom: 15px;">Detalles de la venta:</h3>
        <p><strong>ID de la orden:</strong> ${order.orderId}</p>
        <p><strong>Cliente:</strong> ${order.nombre} ${order.apellido}</p>
        <p><strong>Teléfono:</strong> ${order.celular}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
        <p><strong>Estado de la compra:</strong> ${order.estadoCompra}</p>
        <p><strong>Total: $</strong> ${order.total}</p>
      </div>

     <div style="background-color: #1e1e1e; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        
        <a href="${urlPublicFrontEnv || 'http://localhost:5173'}/login" 
           style="color: white; text-decoration: none; display: block;">
          Acceder al panel de control
        </a>
      </div>

      <p style="text-align: center; margin-top: 20px; color: #666;">
        Este es un correo automático, por favor no responder.
      </p>
    </div>
    `);
  res.json({ message: 'Email enviado con éxito' });
});

app.post('/send-email-checkout-user', async (req, res) => {
    const { to, subject, customerName, orderId, orderDetails } = req.body;

  // Función para obtener el mensaje según el método de pago
  const getPaymentInstructions = (paymentMethod) => {
    switch (paymentMethod) {
      case 'transferencia':
        return `
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffeeba;">
              <h4 style="color: #856404; margin-top: 0;">Datos bancarios para la transferencia:</h4>
              <p style="margin: 5px 0;">Banco: ${banco}</p>
              <p style="margin: 5px 0;">Cuenta: ${bancoCuenta}</p>
              <p style="margin: 5px 0;">Titular: ${bancoTitular}</p>

              <div style="margin-top: 15px;">
                <p style="color: #dc3545; font-weight: bold;">IMPORTANTE:</p>
                <p>1. Realice la transferencia al número de cuenta mencionado arriba</p>
                <p>2. Envíe el comprobante de transferencia a ${emailNotificationComercio} o al whatsapp 0${nroContacto}</p>

                <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
                  <p style="margin: 5px 0;"><strong>Dirección:</strong> ${direccionLocal}</p>
                  <p style="margin: 5px 0;"><strong>Horario:</strong> ${diasHorarios}</p>
                </div>

                <p style="color: #dc3545;">Si no realiza estos pasos dentro de las próximas ${horasLiberacionCompras} horas hábiles, 
                la compra será cancelada automáticamente y los productos serán liberados.</p>
              </div>
            </div>
          `;
      case 'efectivo':
        return `
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffeeba;">
              <h4 style="color: #856404; margin-top: 0;">Instrucciones para el pago en efectivo:</h4>
              <p>Debe realizar el pago en nuestro local dentro de las próximas ${horasLiberacionCompras} horas hábiles.</p>

              <div style="margin-top: 15px;">
                <p style="color: #dc3545; font-weight: bold;">IMPORTANTE:</p>
                <p>De no efectuar el pago en el plazo establecido, la compra será cancelada 
                automáticamente y los productos serán liberados.</p>
                
                <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
                  <p style="margin: 5px 0;"><strong>Dirección:</strong> ${direccionLocal}</p>
                  <p style="margin: 5px 0;"><strong>Horario:</strong> ${diasHorarios}</p>
                </div>
              </div>
            </div>
          `;
      default:
        return '';
    }
  };

  const emailContent = `
    <div style="text-align: center;">
      <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
    </div>
    <h2>¡Gracias por tu compra, ${customerName}!</h2>
    <p>Tu número de orden es: ${orderId}</p>
    
    ${getPaymentInstructions(orderDetails.paymentMethod)}
    
    <h3>Detalles de tu pedido:</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f8f9fa;">
        <th style="padding: 10px; text-align: left;">Producto</th>
        <th style="padding: 10px; text-align: center;">Color</th>
        <th style="padding: 10px; text-align: center;">Talle</th>
        <th style="padding: 10px; text-align: center;">Cantidad</th>
        <th style="padding: 10px; text-align: right;">Precio</th>
        <th style="padding: 10px; text-align: right;">Subtotal</th>
      </tr>
      ${orderDetails.items.map(item => `
        <tr>
          <td style="padding: 10px; border-top: 1px solid #dee2e6;">
            ${item.title}
            ${item.discount > 0 ? `
              <br>
              <span style="color: #dc3545; font-size: 0.9em;">
                ${item.discount}% OFF
              </span>
            ` : ''}
          </td>
          <td style="padding: 10px; border-top: 1px solid #dee2e6; text-align: center;">
            ${getColorByHex(item.color)}
          </td>
          <td style="padding: 10px; border-top: 1px solid #dee2e6; text-align: center;">
            ${item.size || '-'}
          </td>
          <td style="padding: 10px; border-top: 1px solid #dee2e6; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-top: 1px solid #dee2e6; text-align: right;">
            ${item.discount > 0 ? `
              <span style="text-decoration: line-through; color: #6c757d;">
                $ ${item.price}
              </span>
              <br>
              <span style="color: #dc3545;">
                $ ${item.priceWithDiscount}
              </span>
            ` : `$ ${item.price}`}
          </td>
          <td style="padding: 10px; border-top: 1px solid #dee2e6; text-align: right;">
            $ ${item.subtotal}
          </td>
        </tr>
      `).join('')}
    </table>

    <div style="margin-top: 20px; text-align: right;">
      <p><strong>Subtotal:</strong> $ ${orderDetails.subtotal}</p>
      <p><strong>Costo de envío:</strong> $ ${orderDetails.shippingCost}</p>
      <p style="font-size: 1.2em;"><strong>Total:</strong> $ ${orderDetails.totalConEnvio}</p>
    </div>

    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
      <h4>Estado de tu pedido: ${orderDetails.estadoCompra}</h4>
      <p>Método de pago: ${orderDetails.paymentMethod}</p>
      <p>Método de envío: ${orderDetails.shippingMethod}</p>
      ${orderDetails.shippingMethod.includes('UES') && orderDetails.guiaID ? `
        <div style="margin-top: 15px; padding: 10px; background-color: #e9ecef; border-radius: 5px;">
          <p><strong>Número de rastreo UES:</strong> ${orderDetails.guiaID}</p>
          <p>Puedes hacer seguimiento de tu envío en: 
            <a href="${orderDetails.tracking_web}" target="_blank">Seguimiento UES</a>
          </p>
          ${orderDetails.shippingMethod === 'UES Agencia' && orderDetails.agenciaData ? `
            <p><strong>Dirección de la agencia:</strong> ${orderDetails.agenciaData.direccion.calle} ${orderDetails.agenciaData.direccion.nro}</p>
          ` : ''}
        </div>
      ` : ''}
    </div>

    <p style="margin-top: 20px;">
      
      <a href="${urlPublicFrontEnv || 'http://localhost:5173'}" style="color: #007bff; text-decoration: none;">Visita nuestra tienda</a>
    </p>
    `;

  await sendMail(to, subject, emailContent);
  res.json({ message: 'Email enviado con éxito' });
});

app.post("/create_preference", (req, res) => {    
    let preference = {
        items: req.body.items,
        back_urls: {
            success: `${urlPublicFrontEnv || 'http://localhost:5173'}/checkout`,
            failure: `${urlPublicFrontEnv || 'http://localhost:5173'}/checkout`,
            pending: ""
        },
        auto_return: "approved",
        shipments: {
            cost: req.body.shipment_cost,
            mode: "not_specified"
        },
    };
    console.log("Recibida solicitud para crear preferencia:", req.body);
    mercadopago.preferences
        .create(preference)
        .then(function (response) {
            // console.log("Recibida solicitud para crear preferencia:", response.body);
            res.json({ id: response.body.id });
        })
        .catch(function (error) {
            console.log("Error al crear preferencia en MercadoPago:", error);
            res.status(500).json({ error: 'Error al crear la preferencia en MercadoPago' });
        });
});

// Ruta del newsletter
app.post('/send-weekly-newsletter', async (req, res) => {
  try {
    const products = await getDestacadosProducts();
    console.log('Productos obtenidos:', products); // Para debug

    if (products.length === 0) {
      return res.status(400).json({ message: 'No hay productos destacados para enviar' });
    }

    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No hay suscriptores en la lista' });
    }

    let emailsSent = 0;
    let emailErrors = 0;
    const errors = [];

    for (const email of subscribers) {
      try {
        const newsletterHTML = generateNewsletterHTML(products, email);

        await sendMail(email, 'Productos Destacados de la Semana', newsletterHTML);
        emailsSent++;

        // Registrar envío exitoso
        await admin.firestore().collection('newsletterLog').add({
          email,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          productsIncluded: products.map(p => p.id),
          status: 'sent'
        });

      } catch (error) {
        console.error(`Error enviando a ${email}:`, error);
        emailErrors++;
        errors.push({ email, error: error.message });
      }
    }

    res.json({
      message: `Newsletter procesado: ${emailsSent} enviados, ${emailErrors} errores`,
      success: emailsSent,
      errors: emailErrors,
      errorDetails: errors
    });

  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({
      error: 'Error al enviar newsletter',
      details: error.message
    });
  }
});

// Función para escribir logs
const writeToLog = async (message, type = 'info') => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const logDir = path.join(__dirname, 'logs');
    const logFile = path.join(logDir, `${dateStr}.log`);

    // Crear directorio de logs si no existe
    await fs.promises.mkdir(logDir, { recursive: true });

    const logEntry = `[${timeStr}] [${type}] ${message}\n`;
    await fs.promises.appendFile(logFile, logEntry);
  } catch (error) {
    console.error('Error escribiendo log:', error);
  }
};

// Función para verificar y cancelar órdenes vencidas
const checkExpiredOrders = async () => {
  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const nowDate = now.toDate();

    await writeToLog('Iniciando verificación de órdenes vencidas en días hábiles');
    await writeToLog(`Fecha actual: ${now.toDate()}`);

    try {
      const snapshot = await db.collection('orders')
        .where('estadoCompra', '==', 'En espera')        
        .get();
      
      let vencidas = 0;

      for (const doc of snapshot.docs) {
        const orderData = doc.data();
        const fechaCreacion = orderData.fechaCreacion?.toDate();

        if (!fechaCreacion) continue;

        const horasTranscurridas = getBusinessHoursDiff(fechaCreacion, nowDate);

        if (horasTranscurridas >= horasLiberacionCompras) {
          vencidas++;

        await writeToLog(`Procesando cancelación de orden ID: ${doc.id}`);
        await writeToLog(`Detalles de la orden: Cliente: ${orderData.customerData?.nombre}, Email: ${orderData.customerData?.email}, Horas hábiles transcurridas: ${horasTranscurridas}`);

        // Restaurar stock para cada item
        for (const item of orderData.items || []) {
          try {
            const productRef = db.collection('products').doc(item.id);
            const productDoc = await productRef.get();

            if (productDoc.exists) {
              const productData = productDoc.data();

              // Verificar si el item de la orden tiene SKU y el producto tiene variantes
              if (item.sku && Array.isArray(productData.variants) && productData.variants.length > 0) {
                // Es una variante
                const updatedVariants = productData.variants.map(variant => {
                  if (variant.sku === item.sku) {
                    // Sumar la cantidad de vuelta al stock de la variante
                    return { ...variant, stock: (variant.stock || 0) + item.quantity };
                  }
                  return variant;
                });
                await productRef.update({ variants: updatedVariants });
                await writeToLog(`Orden ${doc.id}: Stock de variante RESTAURADO - SKU: ${item.sku}, Producto ID: ${item.id}, Cantidad: ${item.quantity}`);
              } else {
                // Es un producto simple (o un item sin SKU, fallback a lógica anterior)
                await productRef.update({
                  stock: admin.firestore.FieldValue.increment(item.quantity)
                });
                await writeToLog(`Orden ${doc.id}: Stock global RESTAURADO - Producto ID: ${item.id}, Título: ${item.title}, Cantidad: ${item.quantity}`);
              }
            } else {
              await writeToLog(`Orden ${doc.id}: Producto no encontrado para restaurar stock - ID: ${item.id}`, 'error');
            }
          } catch (stockError) {
            await writeToLog(`Error al restaurar stock para producto ${item.id} en orden ${doc.id}: ${stockError.message}`, 'error');
          }
        }

        // Actualizar estado de la orden
        await doc.ref.update({
          estadoCompra: 'Cancelado',
          fechaCancelacion: admin.firestore.FieldValue.serverTimestamp(),
          fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
          motivoCancelacion: `Pago no realizado dentro de las ${horasLiberacionCompras} horas hábiles`
        });

        // Enviar email de cancelación
        try {
          await sendMail(
            orderData.customerData.email,
            'Orden cancelada - Pago no recibido',
            `
              <div style="text-align: center;">
                <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
              </div>
              <h2>Orden Cancelada</h2>
              <p>Estimado/a ${orderData.customerData.nombre},</p>
              <p>Su orden #${doc.id} ha sido cancelada automáticamente debido a que no se recibió el pago dentro del plazo establecido de ${horasLiberacionCompras} horas hábiles.</p>
              <p>Los productos han sido liberados.</p>
              <p>Si aún desea realizar la compra, por favor realice un nuevo pedido.</p>
              <p>Gracias por su comprensión.</p>
            `
          );
          await writeToLog(`Orden ${doc.id}: Email de cancelación enviado a ${orderData.customerData.email}`);
        } catch (emailError) {
          await writeToLog(`Orden ${doc.id}: Error al enviar email de cancelación - ${emailError.message}`, 'error');
        }
      }
    }
      await writeToLog(`Proceso de cancelación completado. ${vencidas} órdenes canceladas por exceder las horas hábiles.`);

    } catch (error) {
      await writeToLog(`Error en el proceso de cancelación: ${error.message}`, 'error');
      console.error('Error:', error);
    }
  } catch (error) {
    await writeToLog(`Error general en checkExpiredOrders: ${error.message}`, 'error');
    console.error('Error al procesar órdenes vencidas:', error);
  }
};

//calculo la diferencia de horas hábiles entre dos fechas
const getBusinessHoursDiff = (startDate, endDate) => {
  let current = new Date(startDate);
  let hours = 0;

  while (current < endDate) {
    const day = current.getDay();
    // lunes a viernes
    if (day >= 1 && day <= 5) {
      hours++;
    }
    current.setHours(current.getHours() + 1);
  }

  return hours;
};

// Ejecutar inmediatamente al iniciar el servidor
checkExpiredOrders();

// Programar la tarea para que se ejecute cada hora
cron.schedule('0 * * * *', () => {
  checkExpiredOrders();
});

// Nuevo cron para newsletter (todos los jueves a las 9am)
cron.schedule('0 9 * * 4', async () => {
  //cron.schedule('* * * * *', async () => { //envia cada minuto, para pruebas
  try {
    console.log('Iniciando envío programado de newsletter');
    await writeToLog('Iniciando envío programado de newsletter');
    
    const response = await axios.post(`${urlPublicBackEnv || 'http://localhost:8081'}/send-weekly-newsletter`);

    await writeToLog(`Newsletter enviado: ${response.data.success} exitosos, ${response.data.errors} errores`);
    console.log('Newsletter enviado exitosamente');
  } catch (error) {
    console.error('Error en envío programado de newsletter:', error);
    await writeToLog(`Error en envío programado de newsletter: ${error.message}`, 'error');
  }
});

// Ruta para desuscripción
app.get('/unsubscribe', async (req, res) => {
  const { token } = req.query;

  try {
    const email = verifyUnsubscribeToken(token);

    // Eliminar email de la colección newsletter
    const snapshot = await admin.firestore()
      .collection('newsletter')
      .where('email', '==', email)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.delete();

      // Registrar la desuscripción
      await admin.firestore()
        .collection('newsletterUnsubscribe')
        .add({
          email,
          unsubscribedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      res.send(`
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                padding: 50px;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Te has desuscrito exitosamente</h1>
                            <p>Ya no recibirás más newsletters de Kuka Store.</p>
                            <p>Si deseas volver a suscribirte, puedes hacerlo desde nuestra web.</p>
                            <p><a href="${urlPublicFrontEnv || 'http://localhost:5173'}">Volver a la tienda</a></p>
                        </div>
                    </body>
                </html>
            `);
    } else {
      res.status(404).send('Email no encontrado en la lista de suscriptores');
    }
  } catch (error) {
    console.error('Error al desuscribir:', error);
    res.status(500).send('Error al procesar la desuscripción');
  }
});

// Modificar la generación del HTML del newsletter para incluir el link de desuscripción
const generateNewsletterHTML = (products, email) => {
  const unsubscribeToken = generateUnsubscribeToken(email);
  const logoSrc = getLogoBase64();

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Newsletter Kuka Store</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <!-- Logo -->
                <div style="margin: 0; padding: 0;">
                    <img src="${logoSrc}" alt="kuka store" style="width: 80px; height: auto;" />
                </div>

                <!-- Título separado -->
                <div style="margin: 40px 0 20px 0; text-align: center;">
                    <h2 style="margin: 0; color: #333;">Productos Destacados de la Semana</h2>
                </div>

                <!-- Productos -->
                ${products.map(product => `
                    <div style="margin-bottom: 30px; text-align: center;">
                        <img src="${product.image}" alt="${product.title}" style="max-width: 200px; height: auto;"/>
                        <h3 style="color: #333;">${product.title}</h3>
                        <p>${product.description || ''}</p>
                        <p style="font-size: 20px; font-weight: bold;">Precio: $${product.unit_price}</p>
                        
                        <a href="${urlPublicFrontEnv || 'http://localhost:5173'}/itemDetail/${product.id}" 
                           style="background-color: #1e1e1e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Ver producto
                        </a>
                    </div>
                `).join('')}

                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    
                    <a href="${urlPublicFrontEnv || 'http://localhost:5173'}" style="color: #1e1e1e; text-decoration: none;">
                        Visita nuestra tienda
                    </a>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        Si no deseas recibir más correos como este, puedes
                        <a href="${urlPublicBackEnv || 'http://localhost:8081'}/unsubscribe?token=${unsubscribeToken}" style="color: #1e1e1e;">
                            darte de baja aquí
                        </a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Ruta para el formulario de contacto
app.post('/send-email-contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await sendMail(
      emailNotificationComercio, // email destino (correo cliente de micha)
      'Tienes un mensaje desde tu eCommerce',
      `
            <div style="text-align: center;">
              <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
            </div>
            <h2>Nuevo mensaje de contacto desde tu eCommerce</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${message}</p>
            `
    );

    // Enviar copia al usuario
    await sendMail(
      email,
      'Hemos recibido tu mensaje',
      `
            <div style="text-align: center;">
              <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
            </div>
            <h2>¡Gracias por contactarnos!</h2>
            <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.</p>
            <p>Este es una copia de tu mensaje:</p>
            <p>${message}</p>
           
            <p><a href="${urlPublicFrontEnv || 'http://localhost:5173'}">Visita nuestra tienda</a></p>
            `
    );

    res.json({ message: 'Email enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ error: 'Error al enviar el email' });
  }
});

// Endpoint para obtener países
app.get('/api/countries', async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2');
    const sortedCountries = response.data
      .sort((a, b) => a.name.common.localeCompare(b.name.common))
      .map(country => ({
        name: country.name.common,
        code: country.cca2
      }));
    res.json(sortedCountries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Error al obtener países' });
  }
});


// la uso solo cuando no es UY, caso contrario uso la API de UES
app.get('/api/states/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${countryCode}/states`,
      {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      }
    );
    const sortedStates = response.data.sort((a, b) =>
      a.name.localeCompare(b.name, 'es')
    );
    res.json(sortedStates);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Error al obtener estados' });
  }
});

// Endpoint para obtener ciudades por país y estado, la uso solo si el pais es NO uruguay, sino uso la API de UES
app.get('/api/cities/:countryCode/:stateCode', async (req, res) => {
  try {
    const { countryCode, stateCode } = req.params;

    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`,

      {

        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      }
    );
    const sortedCities = response.data.sort((a, b) =>
      a.name.localeCompare(b.name, 'es')
    );
    res.json(sortedCities);

  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }

});


// Endpoint para obtener departamentos y localidades de UES
app.get('/api/ues/locations', async (req, res) => {
  try {
    const response = await axios.get('https://sge.ues.com.uy:9443/UES_Paqueteria/DeptoYLocalidad');

    // Eliminar duplicados y ordenar departamentos
    const uniqueDepartamentos = response.data.departamentos.reduce((acc, current) => {
      const exists = acc.find(item => item.nombre === current.nombre);
      if (!exists) {
        acc.push({
          id: current.id,
          nombre: current.nombre,
          localidades: current.localidades.map(loc => ({
            ...loc,
            codigoPostal: loc.codigo_postal || current.codigo_postal
          })),
        });
      } else {
        // Si el departamento ya existe, concatenamos las localidades
        exists.localidades = [...exists.localidades, ...current.localidades.map(loc => ({
          ...loc,
          codigoPostal: loc.codigo_postal || current.codigo_postal // Usar el código postal de la localidad si existe, si no, usar el del departamento
        }))];
      }
      return acc;
    }, []);

    // Ordenar departamentos alfabéticamente
    const sortedDepartamentos = uniqueDepartamentos.sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es')
    );

    // Ordenar y eliminar duplicados de localidades dentro de cada departamento
    sortedDepartamentos.forEach(depto => {
      const uniqueLocalidades = depto.localidades.reduce((acc, current) => {
        if (!acc.find(item => item.nombre === current.nombre)) {
          acc.push(current);
        }
        return acc;
      }, []);

      depto.localidades = uniqueLocalidades.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es')
      );
    });

    res.json(sortedDepartamentos);
  } catch (error) {
    console.error('Error fetching UES locations:', error);
    res.status(500).json({ error: 'Error al obtener localidades de UES' });
  }
});

// Función para crear el header de autenticación
const getUESAuthHeader = () => {
  if (!UES_USER || !UES_PASSWORD) {
    throw new Error('Faltan credenciales de UES');
  }
  const auth = Buffer.from(`${UES_USER}:${UES_PASSWORD}`).toString('base64');
  return `Basic ${auth}`;
};

// Endpoint de cálculo de envío
app.post('/api/shipping/calculate', async (req, res) => {
  try {
    const {
      Departamento,
      BarrioLocalidad,
      Calle,
      Nro,
      CodPo,
      tipoEnvio,
      Peso,
      UMP,
      ValorMonetario,
      EmailRecibe,
      TelefonoContacto
    } = req.body;

    // Modificar la validación según el tipo de envío
    if (!Departamento || !BarrioLocalidad || !tipoEnvio || !Peso) {
      return res.status(400).json({
        error: 'Faltan datos requeridos',
        message: 'Los campos básicos son obligatorios'
      });
    }

    // Validar campos de dirección solo si es envío a domicilio
    if (tipoEnvio === 'DOMICILIO' && (!Calle || !Nro || !CodPo)) {
      return res.status(400).json({
        error: 'Faltan datos requeridos',
        message: 'Los campos de dirección son obligatorios para envío a domicilio'
      });
    }

    // Formato según documentación UES
    const requestData = {
      Cliente: UES_CLIENT,
      Tocken: UES_TOKEN,
      CentroCliente: "F",
      NroPedido: "TEST12345",
      //NroPedido: `OT${Date.now()}`,
      //Entrega: `ENV${Date.now()}`,
      Entrega: "TEST54321",
      TipoServicio: "31443", // 31443 es el código para "Envío normal" a Treinta y Tres
      PesoTotal: Peso.toString(),
      UMP: UMP,
      ValorMonetario: (Number(ValorMonetario) || 0).toString(),
      BarrioLocalidad: BarrioLocalidad,
      Departamento: Departamento,
      TelefonoContacto: TelefonoContacto || "",
      EmailRecibe: EmailRecibe || "",
      Calle: Calle,
      Nro: Nro,
      CodPo: CodPo
    };

    console.log('Datos enviados a UES:', requestData);

    const response = await axios.post(
      'https://sge.ues.com.uy:9443/ues_commerce/UES_InsertEnvio',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': getUESAuthHeader(),

        }
      }
    );

    console.log('Respuesta de UES:', response.data);

    // La respuesta tiene una estructura diferente
    // Los datos están en response.data.guias[0] y en response.data
    const guiaData = response.data.guias[0];
    const trackingWeb = guiaData.tracking_web || response.data.trackingWeb;
    const guiaID = guiaData.guiaId || response.data.guiaId;

    if (!guiaID || !trackingWeb) {
      throw new Error('Respuesta incompleta de UES');
    }

    res.json({
      costo: 0, // Forzar costo 0 por ahora
      guiaID: guiaID,
      tracking_web: trackingWeb
    });

  } catch (error) {
    console.error('Error detallado:', error.response?.data || error.message);
    res.status(500).json({
      error: true,
      message: 'Error al calcular el envío',
      details: error.message
    });
  }
});

// Endpoint para enviar email de cancelación (manual o automática)
app.post('/send-email-cancel', async (req, res) => {
  try {
    const { to, orderId, customerData } = req.body;

    const html = `
      <div style="text-align: center;">
        <img src="${getLogoBase64()}" alt="kuka store" style="width: 150px; height: auto; margin-bottom: 20px;" />
      </div>
      <h2>Orden Cancelada</h2>
      <p>Estimado/a ${customerData.nombre},</p>
      <p>Su orden #${orderId} ha sido cancelada.</p>
      <p>Los productos han sido liberados.</p>
      <p>Si aún desea realizar la compra, por favor realice un nuevo pedido.</p>
      <p>Gracias por su comprensión.</p>
    `;

    await sendMail(
      to,
      'Orden cancelada',
      html
    );

    await writeToLog(`Email de cancelación enviado para la orden ${orderId} a ${to}`);
    res.status(200).send('Email enviado correctamente');
  } catch (error) {
    console.error('Error enviando email de cancelación:', error);
    await writeToLog(`Error enviando email de cancelación para la orden ${req.body.orderId}: ${error.message}`, 'error');
    res.status(500).send('Error enviando email');
  }
});

// Copiar la función getColorByHex del frontend
const getColorByHex = (colorHex) => {
  if (!colorHex) return "No especificado";

  const colorMap = {
    "#FF0000": "rojo",
    "#0000FF": "azul",
    "#00FF00": "verde",
    "#FFFF00": "amarillo",
    "#FFA500": "naranja",
    "#EE82EE": "violeta",
    "#FFC0CB": "rosa",
    "#8B4513": "marrón",
    "#808080": "gris",
    "#000000": "negro",
    "#FFFFFF": "blanco",
  };

  return colorMap[colorHex] || colorHex;
};

// Endpoint para obtener agencias
app.get('/api/ues/agencias', async (req, res) => {
  try {
    const response = await axios.get('https://meli.ues.com.uy:9443/UES_Paqueteria/agencias');
    res.json(response.data.agencias);
  } catch (error) {
    console.error('Error fetching UES agencies:', error);
    res.status(500).json({ error: 'Error al obtener agencias de UES' });
  }
});

// Endpoint para obtener agencia por departamento y localidad
app.get('/api/ues/agencia/:departamento/:localidad', async (req, res) => {
  try {
    const { departamento, localidad } = req.params;
    const response = await axios.get('https://meli.ues.com.uy:9443/UES_Paqueteria/agencias');

    const agencia = response.data.agencias.find(a =>
      a.direccion.departamento.nombre.toUpperCase() === departamento.toUpperCase() &&
      a.direccion.localidad.nombre.toUpperCase() === localidad.toUpperCase()
    );

    if (!agencia) {
      return res.status(404).json({
        error: 'No hay agencia disponible',
        message: 'No existe agencia UES en esta localidad. Por favor seleccione envío a domicilio.'
      });
    }

    res.json({
      id: agencia.id,
      nombre: agencia.nombre,
      direccion: {
        calle: agencia.direccion.calle,
        nro: agencia.direccion.nro_puerta,
        codPo: agencia.direccion.zip_code
      }
    });
  } catch (error) {
    console.error('Error buscando agencia:', error);
    res.status(500).json({ error: 'Error al buscar agencia' });
  }
});

// Iniciar servidor
app.listen(8081, () => {
    console.log('Server running on port 8081');
});

