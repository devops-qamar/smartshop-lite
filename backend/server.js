require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(morgan('dev'));

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, mobile apps, same-origin) and any
      // origin explicitly whitelisted in CLIENT_ORIGIN.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
  })
);

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'smartshop-lite-backend', time: new Date().toISOString() });
});

app.use('/api/products', productRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start server ---
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`SmartShop Lite API running on http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
