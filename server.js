require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
// Definimos el puerto. Render asignará uno automáticamente mediante process.env.PORT
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares
// Por ahora dejamos CORS abierto para facilitar las pruebas. 
// Más adelante lo restringiremos a la URL de tu web.
app.use(cors()); 

// Middleware para que el servidor pueda interpretar los datos JSON que le enviaremos desde el frontend
app.use(express.json());

// Ruta principal de prueba para verificar que el backend está vivo
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'Servidor Backend Activo y conectado correctamente',
        estado: 'OK',
        version: '1.0.0'
    });
});

// Inicialización del servidor
app.listen(PORT, () => {
    console.log(`El servidor se está ejecutando en el puerto ${PORT}`);
});