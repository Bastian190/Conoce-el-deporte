const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*',  // Cambia '*' por 'http://localhost:8100' si quieres restringir los orígenes.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Inicializa Firebase Admin con tu archivo de credenciales
const serviceAccount = require('./conoce-eldeporte-firebase-adminsdk-hn7cw-97d5400561.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware para procesar los datos en JSON
app.use(bodyParser.json());

// Ruta para guardar el token recibido del cliente
app.post('/save-token', (req, res) => {
  const { token } = req.body;

  // Verifica que el token no esté vacío
  if (!token) {
    return res.status(400).send('Token no proporcionado');
  }

  // Supongamos que tienes una base de datos de usuarios y quieres guardar el token de un usuario
  const userId = "user_id_example"; // Este ID lo puedes obtener del usuario que envía el token

  // Aquí debes actualizar el token en la base de datos para este usuario (por ejemplo, usando MongoDB o SQL)
  // Aquí usamos un ejemplo para hacerlo con una base de datos ficticia.
  const db = {};  // Simulando base de datos

  // Si el usuario ya tiene un token, lo reemplazamos. Si no, lo agregamos.
  db[userId] = db[userId] || {};
  db[userId].token = token;

  res.status(200).send('Token guardado');
});

// Ruta para enviar una notificación
app.post('/send-notification', async (req, res) => {
  const { tokens, Notification } = req.body;

  // Verifica que los tokens estén presentes y no estén vacíos
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !Notification) {
    return res.status(400).send('Faltan datos necesarios para enviar la notificación');
  }

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokens,
      notification: {
        title: Notification.title,
        body: Notification.body,
      },
    });

    console.log('Notificación enviada:', response);
    res.status(200).send('Notificación enviada');
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
    res.status(500).send('Error al enviar la notificación');
  }
});

// Escuchar en el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
