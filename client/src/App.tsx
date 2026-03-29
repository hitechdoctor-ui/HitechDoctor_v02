import { Switch, Route, useLocation } from "wouter";
import { useEffect, Fragment, Suspense, Component } from "react";
import { queryClient } from "./lib/queryClient";
import { lazyWithReload } from "./lib/lazy-with-reload";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

// Global UI Components (always needed — keep eager)
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { CookieBanner } from "@/components/cookie-banner";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { FloatingActionStack } from "@/components/floating-action-stack";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { cn } from "@/lib/utils";

// Public Pages — lazy loaded (reload on stale chunk after deploy — see lazy-with-reload.ts)
const Home = lazyWithReload(() => import("./pages/home"));
const Services = lazyWithReload(() => import("./pages/services"));
const ServiceMobile = lazyWithReload(() => import("./pages/service-mobile"));
const ServiceIphone = lazyWithReload(() => import("./pages/service-iphone"));
const IPhoneRepairDetail = lazyWithReload(() => import("./pages/iphone-repair-detail"));
const IPhoneRepairAlt = lazyWithReload(() => import("./pages/iphone-repair-alt"));
const ServiceSamsung = lazyWithReload(() => import("./pages/service-samsung"));
const SamsungRepairDetail = lazyWithReload(() => import("./pages/samsung-repair-detail"));
const ServiceXiaomi = lazyWithReload(() => import("./pages/service-xiaomi"));
const XiaomiRepairDetail = lazyWithReload(() => import("./pages/xiaomi-repair-detail"));
const ServiceHuawei = lazyWithReload(() => import("./pages/service-huawei"));
const HuaweiRepairDetail = lazyWithReload(() => import("./pages/huawei-repair-detail"));
const ServiceOnePlus = lazyWithReload(() => import("./pages/service-oneplus"));
const OnePlusRepairDetail = lazyWithReload(() => import("./pages/oneplus-repair-detail"));
const ServiceLaptop = lazyWithReload(() => import("./pages/service-laptop"));
const LaptopRepairDetail = lazyWithReload(() => import("./pages/laptop-repair-detail"));
const ServiceTablet = lazyWithReload(() => import("./pages/service-tablet"));
const TabletRepairDetail = lazyWithReload(() => import("./pages/tablet-repair-detail"));
const ServiceDesktop = lazyWithReload(() => import("./pages/service-desktop"));
const DesktopRepairDetail = lazyWithReload(() => import("./pages/desktop-repair-detail"));
const ServiceAppleWatch = lazyWithReload(() => import("./pages/service-apple-watch"));
const ServicePlayStation = lazyWithReload(() => import("./pages/service-playstation"));
const IpswDownload = lazyWithReload(() => import("./pages/ipsw-download"));
const ImeiCheck = lazyWithReload(() => import("./pages/imei-check"));
const DeviceShipping = lazyWithReload(() => import("./pages/device-shipping"));
const AppleService = lazyWithReload(() => import("./pages/apple-service"));
const WebDesigner = lazyWithReload(() => import("./pages/web-designer"));
const PortfolioHydrofix = lazyWithReload(() => import("./pages/portfolio-hydrofix"));
const PortfolioRegalo = lazyWithReload(() => import("./pages/portfolio-regalo"));
const PortfolioLouloudotopos = lazyWithReload(() => import("./pages/portfolio-louloudotopos"));
const PortfolioBsNaomi = lazyWithReload(() => import("./pages/portfolio-bsnaomi"));
const PortfolioTheatreHood = lazyWithReload(() => import("./pages/portfolio-theatrehood"));
const PortfolioAthEcs = lazyWithReload(() => import("./pages/portfolio-athecs"));
const PortfolioNikosapost = lazyWithReload(() => import("./pages/portfolio-nikosapost"));
const PortfolioMetamorfosi = lazyWithReload(() => import("./pages/portfolio-metamorfosi"));
const EShop = lazyWithReload(() => import("./pages/eshop"));
const ProductDetail = lazyWithReload(() => import("./pages/product-detail"));
const Checkout = lazyWithReload(() => import("./pages/checkout"));
const CheckStatusPage = lazyWithReload(() => import("./pages/check-status"));
const Terms = lazyWithReload(() => import("./pages/terms"));
const Contact = lazyWithReload(() => import("./pages/contact"));
const Blog = lazyWithReload(() => import("./pages/blog"));
const BlogPost = lazyWithReload(() => import("./pages/blog-post"));
const About = lazyWithReload(() => import("./pages/about"));
const FAQ = lazyWithReload(() => import("./pages/faq"));
const PaymentMethods = lazyWithReload(() => import("./pages/payment-methods"));
const CookiesPolicy = lazyWithReload(() => import("./pages/cookies-policy"));
const AccessibilityStatement = lazyWithReload(() => import("./pages/accessibility-statement"));
const NotFound = lazyWithReload(() => import("./pages/not-found"));

// Admin Pages — lazy loaded (biggest win: never loaded for public visitors)
const AdminDashboard = lazyWithReload(() => import("./pages/admin/dashboard"));
const AdminProducts = lazyWithReload(() => import("./pages/admin/products"));
const AdminOrders = lazyWithReload(() => import("./pages/admin/orders"));
const AdminCustomers = lazyWithReload(() => import("./pages/admin/customers"));
const AdminCustomerDetail = lazyWithReload(() => import("./pages/admin/customer-detail"));
const AdminRepairRequests = lazyWithReload(() => import("./pages/admin/repair-requests"));
const AdminOikonomika = lazyWithReload(() => import("./pages/admin/oikonomika"));
const AdminAntivirusSubscriptions = lazyWithReload(() => import("./pages/admin/antivirus-subscriptions"));
const AdminWebsiteSubscriptions = lazyWithReload(() => import("./pages/admin/website-subscriptions"));
const AdminWebsiteInquiries = lazyWithReload(() => import("./pages/admin/website-inquiries"));
const AdminUsersPage = lazyWithReload(() => import("./pages/admin/admin-users"));
const AdminIpswDownloads = lazyWithReload(() => import("./pages/admin/ipsw-downloads"));
const AdminProductOfferInterests = lazyWithReload(() => import("./pages/admin/product-offer-interests"));
const AdminSupplierSync = lazyWithReload(() => import("./pages/admin/supplier-sync"));
const AdminRepairPriceOverrides = lazyWithReload(() => import("./pages/admin/repair-price-overrides"));
const AdminHubspotContacts = lazyWithReload(() => import("./pages/admin/hubspot-contacts"));

function PageLoader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #0891b2", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// Error boundary to catch render errors in production
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: "monospace", color: "red", background: "#fff" }}>
          <b>Error:</b>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
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
      <ExitIntentPopup />
      <FloatingActionStack />
      <MobileBottomNav />
    </Fragment>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  return (
    <Fragment>
      <ScrollToTop />
      <GlobalComponents />
      <div
        className={cn(
          !isAdmin && "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
        )}
      >
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
          <Route path="/services/ipsw-download" component={IpswDownload} />
          <Route path="/services/imei-check" component={ImeiCheck} />
          <Route path="/services/apostoli-syskevis" component={DeviceShipping} />
          <Route path="/apple-service" component={AppleService} />
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
          <Route path="/check-status" component={CheckStatusPage} />
          <Route path="/oroi-episkeuis" component={Terms} />
          <Route path="/contact" component={Contact} />
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
          <Route path="/admin/hubspot" component={AdminHubspotContacts} />
          <Route path="/admin/customers/:id" component={AdminCustomerDetail} />
          <Route path="/admin/oikonomika" component={AdminOikonomika} />
          <Route path="/admin/users" component={AdminUsersPage} />
          <Route path="/admin/ipsw-downloads" component={AdminIpswDownloads} />
          <Route path="/admin/product-offer-interests" component={AdminProductOfferInterests} />
          <Route path="/admin/sync" component={AdminSupplierSync} />
          <Route path="/admin/repair-price-overrides" component={AdminRepairPriceOverrides} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      </div>
    </Fragment>
  );
}

function App() {
  useAutoTheme();
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
