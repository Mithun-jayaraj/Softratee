const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
const { notFound, errorHandler } = require('./middleware/error-middleware');
app.use('/api/auth', require('./routes/auth-routes'));
app.use('/api/products', require('./routes/product-routes'));
app.use('/api/upload', require('./routes/upload-routes'));
app.use('/api/orders', require('./routes/order-routes'));
app.use('/api/coupons', require('./routes/coupon-routes'));
app.use('/api/designs', require('./routes/design-routes'));
app.use('/api/banners', require('./routes/banner-routes'));
app.use('/api/categories', require('./routes/category-routes'));
app.use('/api/payment/razorpay', require('./routes/razorpay-routes'));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('--- SMTP Configuration Check ---');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST ? 'configured' : 'missing'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT ? 'configured' : 'missing'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER ? 'configured' : 'missing'}`);
  console.log(`SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? 'configured' : 'missing'}`);
  console.log(`SMTP_FROM_EMAIL: ${process.env.SMTP_FROM_EMAIL ? 'configured' : 'missing'}`);
  console.log('--------------------------------');
});
