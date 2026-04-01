require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleAdsApi } = require('google-ads-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Habilitamos CORS para que tu web se pueda conectar
app.use(cors());
app.use(express.json());

// ==============================
// CONFIG GOOGLE ADS
// ==============================

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

// ==============================
// CONFIG GEMINI
// ==============================

// Inicializamos el SDK con la variable de entorno de Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==============================
// TEST
// ==============================

app.get('/', (req, res) => {
  res.send('G-Ads AI funcionando con Gemini 🚀');
});

// ==============================
// TRAER CAMPAÑAS
// ==============================

app.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status
      FROM campaign
      LIMIT 10
    `);

    res.json(campaigns);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ==============================
// ANALIZAR CAMPAÑAS CON GEMINI
// ==============================

app.get('/analyze', async (req, res) => {
  try {
    // 1. Traemos la data cruda de Google Ads
    const campaigns = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status
      FROM campaign
      LIMIT 10
    `);

    // 2. Preparamos el contexto para Gemini
    const promptData = campaigns.map(c => `Campaña: ${c.campaign.name} | Estado: ${c.campaign.status}`).join('\n');

    // 3. Configuramos el modelo de Gemini con el System Instruction estricto
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", 
      systemInstruction: "Eres un estratega experto en Paid Media. Tu objetivo es analizar la estructura de campañas de Google Ads. Mantén un tono estrictamente profesional, creíble y objetivo. Enfócate en sugerir optimizaciones basadas en conceptos de alta rentabilidad, intención de búsqueda y estructuración lógica. Está terminantemente prohibido utilizar lenguaje sensacionalista, promesas irreales, o incluir proyecciones con números de ROAS específicos en tu análisis."
    });

    // 4. Armamos el prompt y generamos el contenido
    const prompt = `Por favor, analiza la siguiente lista de campañas y dame 3 recomendaciones estratégicas para optimizar la estructura general:\n\n${promptData}`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 5. Devolvemos la respuesta al frontend
    res.json({
      original_data: campaigns,
      ai_analysis: responseText
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// ==============================
// PUERTO
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
