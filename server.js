require('dotenv').config();

const express = require('express');
const cors = require('cors'); // <-- Importamos cors
const { GoogleAdsApi } = require('google-ads-api');

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
// TEST
// ==============================

app.get('/', (req, res) => {
  res.send('G-Ads AI funcionando 🚀');
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
// PUERTO
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
