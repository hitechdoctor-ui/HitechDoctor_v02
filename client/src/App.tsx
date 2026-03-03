import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "./pages/home";
import Services from "./pages/services";
import ServiceMobile from "./pages/service-mobile";
import ServiceIphone from "./pages/service-iphone";
import EShop from "./pages/eshop";
import ProductDetail from "./pages/product-detail";
import Checkout from "./pages/checkout";

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/orders";
import AdminCustomers from "./pages/admin/customers";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/services/episkeui-kiniton" component={ServiceMobile} />
      <Route path="/services/episkeui-iphone" component={ServiceIphone} />
      <Route path="/eshop" component={EShop} />
      <Route path="/eshop/:slug" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/customers" component={AdminCustomers} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
