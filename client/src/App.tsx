import { Switch, Route, useLocation } from "wouter";
import { useEffect, Fragment } from "react";
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
import Terms from "./pages/terms";

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/orders";
import AdminCustomers from "./pages/admin/customers";
import AdminCustomerDetail from "./pages/admin/customer-detail";
import AdminRepairRequests from "./pages/admin/repair-requests";
import AdminOikonomika from "./pages/admin/oikonomika";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Fragment>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/services/episkeui-kiniton" component={ServiceMobile} />
        <Route path="/services/episkeui-iphone" component={ServiceIphone} />
        <Route path="/eshop" component={EShop} />
        <Route path="/eshop/:slug" component={ProductDetail} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/oroi-episkeuis" component={Terms} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/repair-requests" component={AdminRepairRequests} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/customers/:id" component={AdminCustomerDetail} />
        <Route path="/admin/oikonomika" component={AdminOikonomika} />
        <Route component={NotFound} />
      </Switch>
    </Fragment>
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
