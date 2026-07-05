import MerchantLayout from "./layouts/MerchantLayout";

// In your Routes, wrap merchant routes:
<Route element={<MerchantLayout />}>
  <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
  <Route path="/merchant/products" element={<ProductManagementPage />} />
  <Route path="/merchant/orders" element={<OrdersManagementPage />} />
  <Route path="/merchant/settings" element={<MerchantSettings />} />
  <Route path="/merchant/inventory" element={<InventoryForecastPage />} />
  <Route path="/merchant/pricing" element={<DynamicPricingPage />} />
  <Route path="/merchant/returns" element={<ReturnRiskPage />} />
  <Route path="/merchant/coaching" element={<MerchantCoachingPage />} />
  <Route path="/merchant/compliance" element={<CompliancePage />} />
</Route>;
