// Rule-based pricing engine
// Runs BEFORE Groq — provides structured suggestion
// Groq then adds human-readable reasoning on top

const applyRules = (product, competitorPrice) => {
  const { price, stock } = product;

  // Rule A: High stock + competitor is significantly cheaper → reduce price
  if (stock > 150 && competitorPrice < price * 0.9) {
    return {
      rule: 'RULE_A: High stock + cheaper competitor',
      suggestedPrice: parseFloat((price * 0.95).toFixed(0)), // 5% reduction
    };
  }

  // Rule B: Very low stock → increase price (scarcity)
  if (stock < 20) {
    return {
      rule: 'RULE_B: Low stock scarcity pricing',
      suggestedPrice: parseFloat((price * 1.08).toFixed(0)), // 8% increase
    };
  }

  // Rule C: Competitor is much cheaper + stock is moderate → match competitor
  if (competitorPrice < price * 0.85 && stock > 50) {
    return {
      rule: 'RULE_C: Competitor undercut — match price',
      suggestedPrice: parseFloat((competitorPrice * 1.02).toFixed(0)), // 2% above competitor
    };
  }

  // Rule D: We are much cheaper than competitor → slight increase
  if (price < competitorPrice * 0.8) {
    return {
      rule: 'RULE_D: Underpriced vs competitor',
      suggestedPrice: parseFloat((price * 1.05).toFixed(0)), // 5% increase
    };
  }

  // No rule applies — keep current price
  return {
    rule: 'RULE_NONE: Price is optimal',
    suggestedPrice: price,
  };
};

module.exports = { applyRules };
