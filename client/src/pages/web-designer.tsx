import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fragment } from "react";
import {
  Globe, Code2, Smartphone, Zap, Search, ShoppingCart,
  ArrowRight, ExternalLink, CheckCircle2, Star, Palette,
  Monitor, Phone, Mail, ChevronRight, Layers, Shield, Gauge,
  Lock, Server,
} from "lucide-react";
import screenshotHydrofix from "@assets/Screenshot_2026-03-11_at_13.11.57_1773227593503.png";
import screenshotRegalo   from "@assets/Screenshot_2026-03-11_at_13.18.39_1773228083914.png";

// ── Portfolio projects ───────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: "techstore",
    title: "TechStore GR",
    category: "E-Commerce",
    categoryColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    desc: "Ολοκληρωμένο e-shop ηλεκτρονικών ειδών με κατηγοριοποίηση προϊόντων, καλάθι αγορών, διαχείριση αποθέματος και ενσωμάτωση πληρωμών Stripe.",
    tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
    accent: "#3b82f6",
    bg: ["#0d1a3a", "#1e3a8a", "#0a1628"],
    preview: {
      bar: "#1e3a8a",
      blocks: [
        { x: 8, y: 14, w: 84, h: 12, r: 4, fill: "#2563eb" },
        { x: 8, y: 30, w: 40, h: 7, r: 3, fill: "#1e3a8a" },
        { x: 8, y: 42, w: 55, h: 7, r: 3, fill: "#1e3a8a" },
        { x: 8, y: 57, w: 25, h: 25, r: 4, fill: "#1d4ed8" },
        { x: 38, y: 57, w: 25, h: 25, r: 4, fill: "#1d4ed8" },
        { x: 68, y: 57, w: 25, h: 25, r: 4, fill: "#1d4ed8" },
        { x: 8, y: 87, w: 40, h: 7, r: 3, fill: "#1e3a8a" },
      ],
    },
    features: ["Responsive design", "Ταχύτητα <2s", "SEO βελτιστοποιημένο"],
  },
  {
    id: "elaionas",
    title: "Ελαιώνας Κρήτης",
    category: "Εταιρικό",
    categoryColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    desc: "Εταιρικό site παραγωγού ελαιολάδου με πολυγλωσσική υποστήριξη (ΕΛ/EN), gallery προϊόντων, ιστορία παραγωγής και φόρμα επικοινωνίας B2B.",
    tech: ["Next.js", "Tailwind CSS", "i18n", "Netlify"],
    accent: "#10b981",
    bg: ["#0a1a10", "#064e3b", "#052e16"],
    preview: {
      bar: "#064e3b",
      blocks: [
        { x: 8, y: 14, w: 84, h: 28, r: 4, fill: "#065f46" },
        { x: 8, y: 46, w: 55, h: 6, r: 3, fill: "#047857" },
        { x: 8, y: 56, w: 40, h: 5, r: 3, fill: "#047857" },
        { x: 8, y: 67, w: 22, h: 7, r: 3, fill: "#10b981" },
        { x: 8, y: 80, w: 28, h: 14, r: 4, fill: "#064e3b" },
        { x: 40, y: 80, w: 28, h: 14, r: 4, fill: "#064e3b" },
        { x: 64, y: 80, w: 28, h: 14, r: 4, fill: "#064e3b" },
      ],
    },
    features: ["Πολυγλωσσικό", "B2B contact forms", "Γρήγορη φόρτωση"],
  },
  {
    id: "dental",
    title: "Dental Care Athens",
    category: "Κλινική",
    categoryColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    desc: "Σύγχρονη ιστοσελίδα οδοντιατρικής κλινικής με online κράτηση ραντεβού, παρουσίαση υπηρεσιών, ιατρικό τιμολόγιο και Google Reviews integration.",
    tech: ["React", "Calendly API", "Google Maps", "Vercel"],
    accent: "#0ea5e9",
    bg: ["#0c1a2e", "#0c4a6e", "#082f49"],
    preview: {
      bar: "#0c4a6e",
      blocks: [
        { x: 8, y: 14, w: 50, h: 8, r: 3, fill: "#0284c7" },
        { x: 8, y: 26, w: 35, h: 5, r: 2, fill: "#0369a1" },
        { x: 8, y: 35, w: 20, h: 8, r: 3, fill: "#0ea5e9" },
        { x: 8, y: 48, w: 84, h: 18, r: 4, fill: "#0c4a6e" },
        { x: 8, y: 71, w: 26, h: 20, r: 4, fill: "#075985" },
        { x: 38, y: 71, w: 26, h: 20, r: 4, fill: "#075985" },
        { x: 68, y: 71, w: 24, h: 20, r: 4, fill: "#075985" },
      ],
    },
    features: ["Online booking", "Google Reviews", "GDPR compliant"],
  },
  {
    id: "rooftop",
    title: "Athens Rooftop Bar",
    category: "Εστίαση",
    categoryColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    desc: "Luxury website για rooftop bar με ατμοσφαιρικό design, digital menu, event calendar, φόρμα κράτησης τραπεζιού και Instagram gallery integration.",
    tech: ["Vite", "GSAP animations", "Instagram API", "EmailJS"],
    accent: "#f59e0b",
    bg: ["#1c0f00", "#431407", "#1c0a00"],
    preview: {
      bar: "#431407",
      blocks: [
        { x: 8, y: 14, w: 84, h: 32, r: 4, fill: "#7c2d12" },
        { x: 8, y: 50, w: 60, h: 7, r: 3, fill: "#9a3412" },
        { x: 8, y: 61, w: 42, h: 5, r: 2, fill: "#7c2d12" },
        { x: 8, y: 70, w: 24, h: 8, r: 3, fill: "#f59e0b" },
        { x: 8, y: 83, w: 20, h: 12, r: 3, fill: "#92400e" },
        { x: 32, y: 83, w: 20, h: 12, r: 3, fill: "#92400e" },
        { x: 56, y: 83, w: 20, h: 12, r: 3, fill: "#92400e" },
        { x: 79, y: 83, w: 13, h: 12, r: 3, fill: "#92400e" },
      ],
    },
    features: ["Animations", "Digital menu", "Event booking"],
  },
  {
    id: "autoparts",
    title: "AutoParts Pro",
    category: "E-Commerce",
    categoryColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    desc: "Μεγάλο e-shop ανταλλακτικών αυτοκινήτων με φίλτρα ανά μάρκα/μοντέλο/έτος, σύστημα αναζήτησης OEM κωδικών και ενσωμάτωση ERP logistics.",
    tech: ["React", "TypeScript", "Elasticsearch", "WooCommerce API"],
    accent: "#f97316",
    bg: ["#1c0a00", "#431407", "#1a0500"],
    preview: {
      bar: "#7c2d12",
      blocks: [
        { x: 8, y: 14, w: 84, h: 10, r: 3, fill: "#ea580c" },
        { x: 8, y: 28, w: 24, h: 60, r: 4, fill: "#9a3412" },
        { x: 36, y: 28, w: 56, h: 28, r: 4, fill: "#7c2d12" },
        { x: 36, y: 60, w: 27, h: 14, r: 3, fill: "#7c2d12" },
        { x: 65, y: 60, w: 27, h: 14, r: 3, fill: "#7c2d12" },
        { x: 36, y: 78, w: 56, h: 10, r: 3, fill: "#9a3412" },
      ],
    },
    features: ["Αναζήτηση OEM", "ERP integration", "1000+ προϊόντα"],
  },
  {
    id: "architect",
    title: "Studio Papadopoulos",
    category: "Portfolio",
    categoryColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    desc: "Minimalist portfolio αρχιτεκτονικού γραφείου με project gallery full-screen, 3D tour ενσωμάτωση, PDF downloads μελετών και multilingual υποστήριξη.",
    tech: ["Next.js", "Framer Motion", "Sanity CMS", "Vercel"],
    accent: "#a855f7",
    bg: ["#0f0a1a", "#2e1065", "#0a0514"],
    preview: {
      bar: "#2e1065",
      blocks: [
        { x: 8, y: 14, w: 84, h: 40, r: 4, fill: "#4c1d95" },
        { x: 8, y: 58, w: 40, h: 7, r: 3, fill: "#3b0764" },
        { x: 8, y: 69, w: 28, h: 5, r: 2, fill: "#3b0764" },
        { x: 8, y: 78, w: 18, h: 8, r: 3, fill: "#a855f7" },
        { x: 62, y: 58, w: 30, h: 30, r: 4, fill: "#3b0764" },
      ],
    },
    features: ["Framer animations", "CMS", "PDF exports"],
  },
];

// ── Skills / stack ────────────────────────────────────────────────────────────
const STACK = [
  { name: "React / Next.js",    color: "text-sky-400",     desc: "SPA & SSR apps" },
  { name: "TypeScript",         color: "text-blue-400",    desc: "Type-safe code" },
  { name: "Tailwind CSS",       color: "text-primary",     desc: "Modern styling" },
  { name: "Node.js / Express",  color: "text-emerald-400", desc: "Backend APIs" },
  { name: "PostgreSQL",         color: "text-violet-400",  desc: "Databases" },
  { name: "Stripe / PayPal",    color: "text-amber-400",   desc: "Payments" },
  { name: "SEO & Performance",  color: "text-orange-400",  desc: "Core Web Vitals" },
  { name: "Figma / Design",     color: "text-pink-400",    desc: "UI/UX design" },
];

// ── What's included ───────────────────────────────────────────────────────────
const SERVICES_LIST = [
  { icon: Globe,        title: "Εταιρική Ιστοσελίδα",   desc: "Παρουσίαση επιχείρησης με SEO, φόρμες επικοινωνίας, Google Maps" },
  { icon: ShoppingCart, title: "E-Commerce Shop",        desc: "Πλήρες e-shop με καλάθι, πληρωμές, διαχείριση αποθέματος" },
  { icon: Smartphone,   title: "Mobile-First Design",    desc: "100% responsive σε κινητά, tablet και desktop" },
  { icon: Search,       title: "SEO Βελτιστοποίηση",    desc: "Schema markup, meta tags, sitemap, Google Search Console" },
  { icon: Zap,          title: "Υψηλή Ταχύτητα",        desc: "Lighthouse score 90+, CDN, lazy loading, image optimization" },
  { icon: Layers,       title: "CMS Διαχείριση",         desc: "Εύκολη ενημέρωση περιεχομένου χωρίς τεχνικές γνώσεις" },
];

// ── Pricing tiers ─────────────────────────────────────────────────────────────
const PRICING = [
  {
    name: "Starter",
    price: "€490",
    priceColor: "from-sky-400 to-cyan-300",
    period: "εφάπαξ",
    desc: "Για μικρές επιχειρήσεις και επαγγελματίες",
    features: [
      "Έως 5 σελίδες",
      "Mobile responsive",
      "Φόρμα επικοινωνίας",
      "Google Maps",
      "Βασικό SEO",
      "1 μήνας δωρεάν support",
    ],
    highlight: false,
    accent: "border-white/15",
    btnStyle: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" },
  },
  {
    name: "Business",
    price: "€990",
    priceColor: "from-primary to-emerald-400",
    period: "εφάπαξ",
    desc: "Για επιχειρήσεις που θέλουν να ξεχωρίσουν",
    features: [
      "Έως 15 σελίδες",
      "Custom design",
      "Blog / News section",
      "Advanced SEO",
      "Google Analytics 4",
      "Speed optimization",
      "3 μήνες support",
    ],
    highlight: true,
    accent: "border-primary/40",
    btnStyle: { background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 20px rgba(0,210,200,0.3)" },
  },
  {
    name: "E-Shop",
    price: "€1.490+",
    priceColor: "from-violet-400 to-purple-300",
    period: "εφάπαξ",
    desc: "Ολοκληρωμένο e-commerce solution",
    features: [
      "Απεριόριστα προϊόντα",
      "Πληρωμές Stripe/PayPal",
      "Διαχείριση αποθέματος",
      "Order tracking",
      "Admin dashboard",
      "Mobile app-ready",
      "6 μήνες support",
    ],
    highlight: false,
    accent: "border-white/15",
    btnStyle: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" },
  },
];

// ── MockBrowser component ──────────────────────────────────────────────────────
function MockBrowser({ project }: { project: typeof PROJECTS[0] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: project.preview.bar }}>
        <div className="w-2 h-2 rounded-full bg-red-400/60" />
        <div className="w-2 h-2 rounded-full bg-amber-400/60" />
        <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
        <div className="flex-1 mx-2 h-3.5 rounded-sm bg-white/10 flex items-center px-2">
          <span className="text-[7px] text-white/40 font-mono">www.{project.id}.gr</span>
        </div>
      </div>
      {/* Page mockup */}
      <div className="relative" style={{ background: `linear-gradient(145deg, ${project.bg[0]}, ${project.bg[1]}, ${project.bg[2]})`, paddingBottom: "70%" }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {project.preview.blocks.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.r} fill={b.fill} opacity="0.9" />
          ))}
          {/* Simulated text lines */}
          <rect x="8" y="8" width="30" height="3" rx="1.5" fill="white" opacity="0.6" />
          <rect x="75" y="8" width="12" height="3" rx="1.5" fill="white" opacity="0.3" />
          <rect x="62" y="8" width="10" height="3" rx="1.5" fill="white" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}

export default function WebDesigner() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Web Designer Αθήνα — Κατασκευή Ιστοσελίδων & E-Shop | HiTech Doctor"
        description="Κατασκευή επαγγελματικών ιστοσελίδων και e-shops στην Αθήνα. React, Next.js, SEO, Tailwind CSS. Portfolio demo — δείτε τις δουλειές μας."
        keywords="web designer αθηνα, κατασκευη ιστοσελιδας, κατασκευη eshop, react next.js, seo αθηνα, web development"
        url="https://hitechdoctor.com/web-designer"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Κατασκευή Ιστοσελίδων & E-Commerce",
          "provider": { "@type": "LocalBusiness", "name": "HiTech Doctor", "telephone": "+306981882005" },
          "areaServed": "Αθήνα",
          "description": "Web design, κατασκευή ιστοσελίδων, e-shop, SEO",
        })}</script>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-16 lg:py-24"
        style={{ background: "linear-gradient(145deg, #080d1a 0%, #0d1530 40%, #090e1c 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-25 pointer-events-none" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,210,200,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />

        <div className="container mx-auto px-4 max-w-6xl relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/sxetika-me-mas" className="hover:text-primary transition-colors">Info</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">Web Designer</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-5 bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-3 py-1">
              <Globe className="w-3 h-3 mr-1.5" />
              Κατασκευή Ιστοσελίδων · Αθήνα
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-5">
              Δημιουργούμε{" "}
              <span style={{ background: "linear-gradient(135deg, hsl(185 100% 50%), hsl(260 80% 70%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Digital Εμπειρίες
              </span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Σχεδιάζουμε και αναπτύσσουμε επαγγελματικές ιστοσελίδες, e-shops και web applications
              με σύγχρονες τεχνολογίες. Από την ιδέα ως την on-line παρουσία — με πλήρη SEO βελτιστοποίηση.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="mailto:info@hitechdoctor.com">
                <Button
                  className="h-12 px-8 font-bold border-0 text-base"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 24px rgba(0,210,200,0.3)" }}
                  data-testid="button-webdesign-contact"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Ζητήστε Προσφορά
                </Button>
              </a>
              <a href="tel:6981882005">
                <Button variant="outline" className="h-12 px-6 border-white/20 hover:border-primary/40 gap-2">
                  <Phone className="w-4 h-4" />
                  698 188 2005
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 max-w-6xl py-14 space-y-20">

        {/* ── Ετήσιο Πακέτο (Annual Subscription) ─────────────────────── */}
        <div>
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-2">Ειδική Προσφορά 2026</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ετήσιο Πακέτο Παρουσίας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Ό,τι χρειάζεται μια σύγχρονη ιστοσελίδα — domain, server, SSL, backup, updates — σε <strong className="text-foreground">μία ετήσια συνδρομή</strong>.
            </p>
          </div>

          <div
            className="relative rounded-3xl border border-amber-500/40 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #1a1200 0%, #120d00 50%, #0e0900 100%)", boxShadow: "0 0 50px rgba(251,191,36,0.08)" }}
            data-testid="card-annual-package"
          >
            {/* Offer ribbon */}
            <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none">
              <div className="absolute top-5 right-[-28px] bg-amber-500 text-black text-[9px] font-extrabold uppercase tracking-widest px-8 py-1 rotate-45">
                ΠΡΟΣΦΟΡΑ
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: price + offer */}
              <div className="p-8 border-r border-amber-500/15">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-400/70 font-bold uppercase tracking-widest">Ολοκληρωμένη Λύση</p>
                    <h3 className="text-base font-extrabold text-white">Απλή Ιστοσελίδα + Φιλοξενία</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-6xl font-extrabold"
                      style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    >
                      €150
                    </span>
                    <span className="text-base text-amber-300/70 font-bold">/χρόνο</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground/50 line-through">€500/χρόνο</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                      -70%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  Τιμή κατασκευής ιστοσελίδας συμπεριλαμβάνεται στη συνδρομή. Ανανέωση κάθε χρόνο — χωρίς κρυφές χρεώσεις.
                </p>

                <a href="mailto:info@hitechdoctor.com">
                  <button
                    className="w-full h-12 rounded-2xl font-extrabold text-black text-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 24px rgba(251,191,36,0.35)" }}
                    data-testid="button-annual-package"
                  >
                    <Mail className="w-4 h-4" />
                    Ζητήστε Προσφορά
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </a>
              </div>

              {/* Right: included features */}
              <div className="p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-5">Τι περιλαμβάνεται</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { icon: Globe,       text: "Domain .gr ή .com" },
                    { icon: Lock,        text: "SSL Certificate" },
                    { icon: Server,      text: "Hosting / Server" },
                    { icon: Shield,      text: "Daily Backups" },
                    { icon: Zap,         text: "Speed Optimization" },
                    { icon: Search,      text: "Βασικό SEO" },
                    { icon: Smartphone,  text: "Mobile Responsive" },
                    { icon: Code2,       text: "Software Updates" },
                    { icon: CheckCircle2,text: "Security Patches" },
                    { icon: Mail,        text: "Email Support" },
                    { icon: Star,        text: "GDPR Compliant" },
                    { icon: Monitor,     text: "Uptime Monitoring" },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-2">
                      <f.icon className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                      <span className="text-xs text-foreground/75">{f.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-3 rounded-xl border border-amber-500/15 bg-amber-500/5">
                  <p className="text-[10px] text-amber-300/70 leading-relaxed">
                    <strong className="text-amber-400">Χωρίς έκπληξη-χρεώσεις.</strong> Domain + Hosting + SSL + Backup + Updates — όλα σε μία ετήσια τιμή. Ανανεώνετε μόνο αν είστε ευχαριστημένοι.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Construction packages ────────────────────────────────────── */}
        <div>
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Τιμές</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-3">Πακέτα Κατασκευής</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Εφάπαξ κατασκευή — τιμές ανάλογα με το είδος και τις απαιτήσεις του project.
              Επικοινωνήστε για δωρεάν προσφορά.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-6 ${plan.accent} ${plan.highlight ? "shadow-[0_0_40px_rgba(0,210,200,0.15)]" : ""}`}
                style={{ background: plan.highlight ? "linear-gradient(145deg, rgba(0,210,200,0.07), rgba(0,0,0,0))" : "rgba(255,255,255,0.02)" }}
                data-testid={`card-pricing-${plan.name.toLowerCase()}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-black font-extrabold text-[9px] px-3 py-1 uppercase tracking-widest">
                      Δημοφιλές
                    </Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  <span
                    className={`text-4xl font-extrabold bg-gradient-to-r ${plan.priceColor} bg-clip-text text-transparent`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1.5">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:info@hitechdoctor.com">
                  <Button
                    className="w-full h-11 font-bold border-0"
                    style={plan.btnStyle}
                    data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                  >
                    Ζητήστε Προσφορά
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── Real clients section ────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Πραγματικά Έργα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Δουλειές Πελατών μας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Live sites σε λειτουργία — φτιαγμένα από εμάς με πλήρες SEO, ασφάλεια και βελτιστοποίηση ταχύτητας.
            </p>
          </div>

          {/* HydroFix card */}
          <Link href="/portfolio/hydrofix-gr" data-testid="card-real-project-hydrofix">
            <div className="group relative rounded-3xl border border-emerald-500/25 overflow-hidden cursor-pointer hover:border-emerald-400/50 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #060f0a 0%, #0a1a10 60%, #050e07 100%)" }}>
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotHydrofix}
                    alt="HydroFix.gr — Εταιρικό site υδραυλικών"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "220px", maxHeight: "280px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060f0a] md:block hidden" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-emerald-400/70 flex items-center gap-1">
                      hydrofix.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    HydroFix.gr
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Εταιρικό site για υδραυλικές εργασίες στην Αττική. Δίγλωσσο (ΕΛ/EN), 24/7 emergency section, Google Reviews, LocalBusiness schema.
                  </p>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance", value: "91/100", color: "text-emerald-400" },
                      { icon: Search, label: "SEO",          value: "98/100", color: "text-emerald-400" },
                      { icon: Shield, label: "Ασφάλεια",     value: "A+",     color: "text-emerald-400" },
                      { icon: Zap,    label: "FCP",           value: "1.1s",   color: "text-emerald-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* e-regalo.gr card */}
          <Link href="/portfolio/regalo-gr" data-testid="card-real-project-regalo" className="mt-5 block">
            <div className="group relative rounded-3xl border border-amber-500/20 overflow-hidden cursor-pointer hover:border-amber-400/45 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #110b01 0%, #1a1002 60%, #0e0901 100%)" }}>
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotRegalo}
                    alt="e-regalo.gr — eShop κοσμημάτων Μοσχάτο"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#110b01] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="bg-amber-500/80 text-black font-extrabold text-[9px] px-2 py-1">eShop</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-amber-500/60 flex items-center gap-1">
                      e-regalo.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    e-regalo.gr
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    eShop κοσμημάτων & αξεσουάρ στο Μοσχάτο. Elegant cream/gold design, Gallery με φίλτρα, Blog, δίγλωσσο, Google Maps.
                  </p>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,      label: "Performance", value: "88/100", color: "text-amber-400" },
                      { icon: Search,     label: "SEO",          value: "96/100", color: "text-amber-400" },
                      { icon: Shield,     label: "Ασφάλεια",     value: "A+",     color: "text-amber-400" },
                      { icon: Layers,     label: "Gallery",      value: "Φίλτρα", color: "text-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Portfolio grid (demo) */}
        <div>
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Portfolio</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-3">
              Δείγματα Εργασιών
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Demo projects που αντικατοπτρίζουν τα είδη ιστοσελίδων που αναπτύσσουμε.
              Κάθε έργο σχεδιάζεται εξ αρχής, χωρίς templates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project) => (
              <article
                key={project.id}
                className="group rounded-3xl border border-white/8 overflow-hidden bg-card/50 hover:border-primary/25 transition-all hover:-translate-y-0.5 duration-200"
                data-testid={`card-portfolio-${project.id}`}
              >
                {/* Browser mockup */}
                <div className="p-4 pb-0">
                  <MockBrowser project={project} />
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <Badge className={`text-[9px] font-bold border shrink-0 ${project.categoryColor}`}>
                      {project.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                    {project.desc}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tech.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground/70 bg-white/3">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {project.features.map((f) => (
                      <div key={f} className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                        <CheckCircle2 className="w-2.5 h-2.5" style={{ color: project.accent }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Services included */}
        <div>
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Υπηρεσίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-3">Τι Περιλαμβάνεται</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Κάθε project παραδίδεται με πλήρη τεκμηρίωση, εκπαίδευση και post-launch support.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES_LIST.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-primary/25 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Τεχνολογίες</p>
            <h2 className="text-2xl font-display font-extrabold text-foreground">Stack που Χρησιμοποιούμε</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STACK.map((s) => (
              <div key={s.name} className="p-4 rounded-2xl border border-white/8 bg-card/40 text-center hover:border-white/20 transition-all">
                <Code2 className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                <p className="text-sm font-bold text-foreground mb-0.5">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-10 text-center border border-primary/20"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.06) 0%, rgba(139,92,246,0.05) 100%)" }}
        >
          <Globe className="w-12 h-12 text-primary mx-auto mb-4" style={{ filter: "drop-shadow(0 0 12px rgba(0,210,200,0.4))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Ξεκινήστε το Project σας
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Επικοινωνήστε μαζί μας για μια <strong className="text-foreground">δωρεάν συνάντηση αξιολόγησης</strong>.
            Θα συζητήσουμε τις ανάγκες σας και θα σας δώσουμε αναλυτική προσφορά εντός 24 ωρών.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 24px rgba(0,210,200,0.3)" }}
                data-testid="button-webdesign-cta-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@hitechdoctor.com
              </Button>
            </a>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-primary/30 hover:border-primary gap-2 text-primary">
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
