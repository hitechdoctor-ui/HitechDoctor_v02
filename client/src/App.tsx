import { Switch, Route, useLocation } from "wouter";
import { useEffect, Fragment } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "@/pages/not-found";

// Global UI Components
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { CookieBanner } from "@/components/cookie-banner";
import { AccessibilityButton } from "@/components/accessibility-button";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { SosButton } from "@/components/sos-button";

// Public Pages
import Home from "./pages/home";
import Services from "./pages/services";
import ServiceMobile from "./pages/service-mobile";
import ServiceIphone from "./pages/service-iphone";
import IPhoneRepairDetail from "./pages/iphone-repair-detail";
import IPhoneRepairAlt from "./pages/iphone-repair-alt";
import ServiceSamsung from "./pages/service-samsung";
import SamsungRepairDetail from "./pages/samsung-repair-detail";
import ServiceXiaomi from "./pages/service-xiaomi";
import XiaomiRepairDetail from "./pages/xiaomi-repair-detail";
import ServiceHuawei from "./pages/service-huawei";
import HuaweiRepairDetail from "./pages/huawei-repair-detail";
import ServiceOnePlus from "./pages/service-oneplus";
import OnePlusRepairDetail from "./pages/oneplus-repair-detail";
import ServiceLaptop from "./pages/service-laptop";
import LaptopRepairDetail from "./pages/laptop-repair-detail";
import ServiceTablet from "./pages/service-tablet";
import TabletRepairDetail from "./pages/tablet-repair-detail";
import ServiceDesktop from "./pages/service-desktop";
import DesktopRepairDetail from "./pages/desktop-repair-detail";
import ServiceAppleWatch from "./pages/service-apple-watch";
import ServicePlayStation from "./pages/service-playstation";
import WebDesigner from "./pages/web-designer";
import PortfolioHydrofix from "./pages/portfolio-hydrofix";
import PortfolioRegalo from "./pages/portfolio-regalo";
import PortfolioLouloudotopos from "./pages/portfolio-louloudotopos";
import PortfolioBsNaomi from "./pages/portfolio-bsnaomi";
import PortfolioTheatreHood from "./pages/portfolio-theatrehood";
import EShop from "./pages/eshop";
import ProductDetail from "./pages/product-detail";
import Checkout from "./pages/checkout";
import Terms from "./pages/terms";
import Contact from "./pages/contact";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog-post";
import About from "./pages/about";
import FAQ from "./pages/faq";
import PaymentMethods from "./pages/payment-methods";
import CookiesPolicy from "./pages/cookies-policy";
import AccessibilityStatement from "./pages/accessibility-statement";

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/orders";
import AdminCustomers from "./pages/admin/customers";
import AdminCustomerDetail from "./pages/admin/customer-detail";
import AdminRepairRequests from "./pages/admin/repair-requests";
import AdminOikonomika from "./pages/admin/oikonomika";

function useAutoTheme() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
    };
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function GlobalComponents() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  if (isAdmin) return null;
  return (
    <Fragment>
      <ScrollProgressBar />
      <CookieBanner />
      <AccessibilityButton />
      <ExitIntentPopup />
      <SosButton />
    </Fragment>
  );
}

function Router() {
  return (
    <Fragment>
      <ScrollToTop />
      <GlobalComponents />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/services/episkeui-kiniton" component={ServiceMobile} />
        <Route path="/services/episkeui-iphone" component={ServiceIphone} />
        <Route path="/episkevi-iphone/:slug" component={IPhoneRepairDetail} />
        <Route path="/episkevi-v2-iphone/:slug" component={IPhoneRepairAlt} />
        <Route path="/services/episkeui-samsung" component={ServiceSamsung} />
        <Route path="/episkevi-samsung/:slug" component={SamsungRepairDetail} />
        <Route path="/services/episkeui-xiaomi" component={ServiceXiaomi} />
        <Route path="/episkevi-xiaomi/:slug" component={XiaomiRepairDetail} />
        <Route path="/services/episkeui-huawei" component={ServiceHuawei} />
        <Route path="/episkevi-huawei/:slug" component={HuaweiRepairDetail} />
        <Route path="/services/episkeui-oneplus" component={ServiceOnePlus} />
        <Route path="/episkevi-oneplus/:slug" component={OnePlusRepairDetail} />
        <Route path="/services/episkeui-laptop" component={ServiceLaptop} />
        <Route path="/episkevi-laptop/:slug" component={LaptopRepairDetail} />
        <Route path="/services/episkeui-apple-watch" component={ServiceAppleWatch} />
        <Route path="/services/episkeui-playstation" component={ServicePlayStation} />
        <Route path="/web-designer" component={WebDesigner} />
        <Route path="/portfolio/hydrofix-gr" component={PortfolioHydrofix} />
        <Route path="/portfolio/regalo-gr" component={PortfolioRegalo} />
        <Route path="/portfolio/louloudotopos" component={PortfolioLouloudotopos} />
        <Route path="/portfolio/bsnaomi-gr" component={PortfolioBsNaomi} />
        <Route path="/portfolio/theatrehood-gr" component={PortfolioTheatreHood} />
        <Route path="/services/episkeui-desktop" component={ServiceDesktop} />
        <Route path="/episkevi-desktop/:slug" component={DesktopRepairDetail} />
        <Route path="/services/episkeui-tablet" component={ServiceTablet} />
        <Route path="/episkevi-tablet/:slug" component={TabletRepairDetail} />
        <Route path="/eshop" component={EShop} />
        <Route path="/eshop/:slug" component={ProductDetail} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/oroi-episkeuis" component={Terms} />
        <Route path="/epikoinonia" component={Contact} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/sxetika-me-mas" component={About} />
        <Route path="/faq" component={FAQ} />
        <Route path="/tropoi-pliromis" component={PaymentMethods} />
        <Route path="/politiki-cookies" component={CookiesPolicy} />
        <Route path="/prosvassimotita" component={AccessibilityStatement} />
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
  useAutoTheme();
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
