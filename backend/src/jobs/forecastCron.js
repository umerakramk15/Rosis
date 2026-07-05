const cron = require('node-cron');
const Product = require('../models/Product');
const aiService = require('../services/aiService');

// Runs every night at midnight — refresh forecasts for all active products
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 [Cron] Running nightly forecast refresh...');
  try {
    const products = await Product.find({ isActive: true }).select('_id');
    let updated = 0;

    for (const product of products) {
      const forecast = await aiService.getForecast(product._id.toString(), 7);
      await Product.findByIdAndUpdate(product._id, {
        forecastData: forecast,
        forecastUpdatedAt: new Date(),
      });
      updated++;
    }

    console.log(`✅ [Cron] Forecast refreshed for ${updated} products`);
  } catch (err) {
    console.error('❌ [Cron] Forecast refresh failed:', err.message);
  }
});
