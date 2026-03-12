import { Switch, Route, useLocation } from "wouter";
import { useEffect, Fragment, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

// Global UI Components (always needed — keep eager)
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { CookieBanner } from "@/components/cookie-banner";
import { AccessibilityButton } from "@/components/accessibility-button";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { SosButton } from "@/components/sos-button";

// Public Pages — lazy loaded
const Home = lazy(() => import("./pages/home"));
const Services = lazy(() => import("./pages/services"));
const ServiceMobile = lazy(() => import("./pages/service-mobile"));
const ServiceIphone = lazy(() => import("./pages/service-iphone"));
const IPhoneRepairDetail = lazy(() => import("./pages/iphone-repair-detail"));
const IPhoneRepairAlt = lazy(() => import("./pages/iphone-repair-alt"));
const ServiceSamsung = lazy(() => import("./pages/service-samsung"));
const SamsungRepairDetail = lazy(() => import("./pages/samsung-repair-detail"));
const ServiceXiaomi = lazy(() => import("./pages/service-xiaomi"));
const XiaomiRepairDetail = lazy(() => import("./pages/xiaomi-repair-detail"));
const ServiceHuawei = lazy(() => import("./pages/service-huawei"));
const HuaweiRepairDetail = lazy(() => import("./pages/huawei-repair-detail"));
const ServiceOnePlus = lazy(() => import("./pages/service-oneplus"));
const OnePlusRepairDetail = lazy(() => import("./pages/oneplus-repair-detail"));
const ServiceLaptop = lazy(() => import("./pages/service-laptop"));
const LaptopRepairDetail = lazy(() => import("./pages/laptop-repair-detail"));
const ServiceTablet = lazy(() => import("./pages/service-tablet"));
const TabletRepairDetail = lazy(() => import("./pages/tablet-repair-detail"));
const ServiceDesktop = lazy(() => import("./pages/service-desktop"));
const DesktopRepairDetail = lazy(() => import("./pages/desktop-repair-detail"));
const ServiceAppleWatch = lazy(() => import("./pages/service-apple-watch"));
const ServicePlayStation = lazy(() => import("./pages/service-playstation"));
const WebDesigner = lazy(() => import("./pages/web-designer"));
const PortfolioHydrofix = lazy(() => import("./pages/portfolio-hydrofix"));
const PortfolioRegalo = lazy(() => import("./pages/portfolio-regalo"));
const PortfolioLouloudotopos = lazy(() => import("./pages/portfolio-louloudotopos"));
const PortfolioBsNaomi = lazy(() => import("./pages/portfolio-bsnaomi"));
const PortfolioTheatreHood = lazy(() => import("./pages/portfolio-theatrehood"));
const PortfolioAthEcs = lazy(() => import("./pages/portfolio-athecs"));
const PortfolioNikosapost = lazy(() => import("./pages/portfolio-nikosapost"));
const PortfolioMetamorfosi = lazy(() => import("./pages/portfolio-metamorfosi"));
const EShop = lazy(() => import("./pages/eshop"));
const ProductDetail = lazy(() => import("./pages/product-detail"));
const Checkout = lazy(() => import("./pages/checkout"));
const Terms = lazy(() => import("./pages/terms"));
const Contact = lazy(() => import("./pages/contact"));
const Blog = lazy(() => import("./pages/blog"));
const BlogPost = lazy(() => import("./pages/blog-post"));
const About = lazy(() => import("./pages/about"));
const FAQ = lazy(() => import("./pages/faq"));
const PaymentMethods = lazy(() => import("./pages/payment-methods"));
const CookiesPolicy = lazy(() => import("./pages/cookies-policy"));
const AccessibilityStatement = lazy(() => import("./pages/accessibility-statement"));
const NotFound = lazy(() => import("./pages/not-found"));

// Admin Pages — lazy loaded (biggest win: never loaded for public visitors)
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/products"));
const AdminOrders = lazy(() => import("./pages/admin/orders"));
const AdminCustomers = lazy(() => import("./pages/admin/customers"));
const AdminCustomerDetail = lazy(() => import("./pages/admin/customer-detail"));
const AdminRepairRequests = lazy(() => import("./pages/admin/repair-requests"));
const AdminOikonomika = lazy(() => import("./pages/admin/oikonomika"));
const AdminAntivirusSubscriptions = lazy(() => import("./pages/admin/antivirus-subscriptions"));
const AdminWebsiteSubscriptions = lazy(() => import("./pages/admin/website-subscriptions"));
const AdminWebsiteInquiries = lazy(() => import("./pages/admin/website-inquiries"));
const AdminUsersPage = lazy(() => import("./pages/admin/admin-users"));

function PageLoader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #0891b2", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/portfolio/ath-ecs-gr" component={PortfolioAthEcs} />
          <Route path="/portfolio/nikosapost-gr" component={PortfolioNikosapost} />
          <Route path="/portfolio/metamorfosi-moschato-gr" component={PortfolioMetamorfosi} />
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
          <Route path="/admin/website-inquiries" component={AdminWebsiteInquiries} />
          <Route path="/admin/antivirus-subscriptions" component={AdminAntivirusSubscriptions} />
          <Route path="/admin/website-subscriptions" component={AdminWebsiteSubscriptions} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/customers" component={AdminCustomers} />
          <Route path="/admin/customers/:id" component={AdminCustomerDetail} />
          <Route path="/admin/oikonomika" component={AdminOikonomika} />
          <Route path="/admin/users" component={AdminUsersPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
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
