const cron = require('node-cron');
const Product = require('../models/Product');
const CompetitorPrices = require('../models/CompetitorPrices');
const aiService = require('../services/aiService');
const pricingService = require('../services/pricingService');

// Runs every 6 hours — update suggested prices for all active products
cron.schedule('0 */6 * * *', async () => {
  console.log('🔄 [Cron] Running pricing update...');
  try {
    const products = await Product.find({ isActive: true });
    let updated = 0;

    for (const product of products) {
      const competitor = await CompetitorPrices.findOne({ productId: product._id })
        .sort({ fetchedAt: -1 });

      const competitorPrice = competitor?.competitorPrice || product.price;
      const ruleResult = pricingService.applyRules(product, competitorPrice);
      const aiResult = await aiService.getPricingSuggestion(product, competitorPrice);

      await Product.findByIdAndUpdate(product._id, {
        suggestedPrice: ruleResult.suggestedPrice || aiResult.suggested_price,
        pricingReasoning: aiResult.reasoning,
      });

      updated++;
    }

    console.log(`✅ [Cron] Pricing updated for ${updated} products`);
  } catch (err) {
    console.error('❌ [Cron] Pricing update failed:', err.message);
  }
});
