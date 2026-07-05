require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/envConfig');

// Import cron jobs
require('./jobs/pricingCron');
require('./jobs/forecastCron');

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
