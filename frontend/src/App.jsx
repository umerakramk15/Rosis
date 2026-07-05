import { Routes, Route } from "react-router-dom";

// layouts
import MainLayout from "./layouts/MainLayout";

// user pages
import About from "./pages/About";

import GirlyShop from "./pages/Home2";
import ProductListingPage from "./pages/ProductListing";
import ProductDetailPage from "./pages/Product";
import SearchResultsPage from "./pages/SearchResults";
import AuthPage from "./pages/Auth";

import InventoryForecastPage from "./pages/InvesntoryForecast";
import WishlistPage from "./pages/WishList";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import Dashboard from "./pages/CustomerDashboard2";
import MerchantDashboard from "./pages/MerchantDashboard";
import ProductManagementPage from "./pages/ProductManagement";
import OrdersManagementPage from "./pages/OrderManagement";
import MerchantSettings from "./pages/MerchantSettings";
import MerchantCoachingPage from "./pages/MerchantCoaching";
import MerchantCompliancePage from "./pages/MerchantCompliance";
import DynamicPricingPage from "./pages/DynamicPricing";
import ReturnRiskPage from "./pages/ReturnRisk";

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<GirlyShop />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/search/visual" element={<SearchResultsPage />} />
        <Route path="/about" element={<About />} />

        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/search/smart" element={<SearchResultsPage />} />
      </Route>
      <Route path="/customer/dashboard" element={<Dashboard />} />

      {/* --- ADD Merchant ROUTES HERE --- */}
      <Route>
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        <Route path="/merchant/products" element={<ProductManagementPage />} />
        <Route path="/merchant/inventory" element={<InventoryForecastPage />} />
        <Route path="/merchant/orders" element={<OrdersManagementPage />} />
        <Route path="/merchant/settings" element={<MerchantSettings />} />
        <Route path="/merchant/coaching" element={<MerchantCoachingPage />} />
        <Route path="/merchant/pricing" element={<DynamicPricingPage />} />
        <Route path="/merchant/returns" element={<ReturnRiskPage />} />
        <Route
          path="/merchant/compliance"
          element={<MerchantCompliancePage />}
        />
      </Route>
    </Routes>
  );
};

export default App;
