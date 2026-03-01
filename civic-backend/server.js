const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const prisma = require('./config/db');

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */

app.use(helmet());

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.MOBILE_URL,
    'https://witless-gregg-acaulescent.ngrok-free.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8086',
    'http://localhost:8086',
    'http://10.55.135.30:3000',
    'http://10.55.135.30:3001',
    'http://10.55.135.30:5000',
    'http://10.55.135.30:8081',
    'http://192.168.1.11:3001',
    'http://192.168.1.11:5000'
  ],
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000
});

app.use('/api/', limiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* -------------------- ROUTES -------------------- */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/whatsapp', require('./whatsapp/whatsapp.routes'));
app.use('/api/chat', require('./routes/chat'));

/* -------------------- HEALTH CHECK -------------------- */
// Routes - Note: These currently use Mongoose controllers and will need updating
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const ivrRoutes = require('./routes/ivr');

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ivr', ivrRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

/* -------------------- ERROR HANDLING -------------------- */

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* -------------------- SERVER START -------------------- */

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;