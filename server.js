// Importa las dependencias necesarias
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:8100',  // Cambia '*' por 'http://localhost:8100' si quieres restringir los orígenes.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Inicializa Firebase Admin con tu archivo de credenciales
const serviceAccount = require('./conoce-eldeporte-firebase-adminsdk-hn7cw-4a3b3c6d53.json'); // Cambia la ruta al archivo de tu cuenta de servicio

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware para procesar los datos en JSON
app.use(bodyParser.json());

// Ruta para enviar notificación push
app.post('/send-notification', async (req, res) => {
  const { tokens, Notification } = req.body;

  // Validar que tokens es un array no vacío
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !Notification) {
    return res.status(400).send('Faltan datos necesarios para enviar la notificación');
  }

  // Crear la carga útil de la notificación


  try {
    // Enviar la notificación como mensaje multicast
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokens,
      notification: {
        title: Notification.title,
        body: Notification.body,
      }
    });
    
    console.log('Notificación enviada:', response);
    res.status(200).send('Notificación enviada');
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
    res.status(500).send('Error al enviar la notificación');
  }
});

// Escuchar en el puerto definido
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
