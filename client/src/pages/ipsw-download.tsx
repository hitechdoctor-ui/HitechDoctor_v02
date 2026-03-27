import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchIphoneDevices,
  fetchDeviceFirmwares,
  formatFirmwareSize,
  compareIphoneIdentifiers,
  type IpswDevice,
  type IpswFirmware,
} from "@/lib/ipsw";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Download,
  ExternalLink,
  Loader2,
  Search,
  ShieldCheck,
  ShieldOff,
  ArrowDown,
  SortAsc,
} from "lucide-react";
import { SiApple } from "react-icons/si";
import { useMemo, useState } from "react";

function trackDownloadClick(device: IpswDevice | null, fw: IpswFirmware) {
  if (!device) return;
  void fetch("/api/ipsw/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceIdentifier: device.identifier,
      deviceName: device.name,
      version: fw.version,
      buildId: fw.buildid,
    }),
  }).catch(() => {});
}

function formatReleaseDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("el-GR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type ProductId = "iphone" | "ipad" | "mac" | "vision" | "tv" | "homepod" | "ipod" | "watch";

const PRODUCTS: {
  id: ProductId;
  label: string;
  image: string;
  available: boolean;
}[] = [
  {
    id: "iphone",
    label: "iPhone",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=400&h=320",
    available: true,
  },
  {
    id: "ipad",
    label: "iPad",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400&h=320",
    available: false,
  },
  {
    id: "mac",
    label: "Mac",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=320",
    available: false,
  },
  {
    id: "vision",
    label: "Vision Pro",
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4262fba3?auto=format&fit=crop&q=80&w=400&h=320",
    available: false,
  },
  {
    id: "tv",
    label: "Apple TV",
    image:
      "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=400&h=320",
    available: false,
  },
  {
    id: "homepod",
    label: "HomePod",
    image:
      "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&q=80&w=400&h=320",
    available: false,
  },
  {
    id: "ipod",
    label: "iPod touch",
    image:
      "https://images.unsplash.com/photo-1565849904461-04a58ad457e7?auto=format&fit=crop&q=80&w=400&h=320",
    available: false,
  },
  {
    id: "watch",
    label: "Apple Watch",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=400&h=320",
    available: false,
  },
];

const STEPS = [
  { key: 1, label: "Επιλογή προϊόντος" },
  { key: 2, label: "Επιλογή συσκευής" },
  { key: 3, label: "Έκδοση iOS" },
  { key: 4, label: "Λήψη" },
] as const;

type SortMode = "newest" | "name";

export default function IpswDownloadPage() {
  const [product, setProduct] = useState<ProductId | null>(null);
  const [selected, setSelected] = useState<IpswDevice | null>(null);
  const [deviceQuery, setDeviceQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [hoverProduct, setHoverProduct] = useState<ProductId | null>(null);

  const { data: devices = [], isLoading: loadingDevices, error: errDevices } = useQuery({
    queryKey: ["ipsw-devices"],
    queryFn: fetchIphoneDevices,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: detail,
    isLoading: loadingFw,
    error: errFw,
  } = useQuery({
    queryKey: ["ipsw-device", selected?.identifier],
    queryFn: () => fetchDeviceFirmwares(selected!.identifier),
    enabled: !!selected,
    staleTime: 1000 * 60 * 15,
  });

  const firmwares = detail?.firmwares ?? [];
  const signedLatest = useMemo(() => firmwares.filter((f) => f.signed), [firmwares]);

  const filteredDevices = useMemo(() => {
    const q = deviceQuery.trim().toLowerCase();
    let list = devices;
    if (q) {
      list = devices.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.identifier.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sortMode === "newest") {
      sorted.sort((a, b) => compareIphoneIdentifiers(a.identifier, b.identifier));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "el"));
    }
    return sorted;
  }, [devices, deviceQuery, sortMode]);

  const activeStep = useMemo(() => {
    if (!product) return 1;
    if (product !== "iphone") return 1;
    if (!selected) return 2;
    if (loadingFw || !detail) return 3;
    if (firmwares.length > 0) return 4;
    return 3;
  }, [product, selected, loadingFw, detail, firmwares.length]);

  const goBackProduct = () => {
    setProduct(null);
    setSelected(null);
    setDeviceQuery("");
  };

  const goBackDevice = () => {
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-zinc-100">
      <Seo
        title="IPSW Download — Επίσημα firmware iPhone"
        description="Επιλέξτε προϊόν και μοντέλο iPhone — εκδόσεις iOS, build ID, λήψη .ipsw από Apple CDN μέσω ipsw.me API."
        url="https://hitechdoctor.com/services/ipsw-download"
      />
      <Helmet>
        <link rel="canonical" href="https://hitechdoctor.com/services/ipsw-download" />
      </Helmet>

      <Navbar />

      {/* Brand hero strip (HiTech / ASUS cyan — primary) */}
      <div className="relative overflow-hidden border-b border-primary/25 bg-gradient-to-br from-primary via-cyan-600 to-teal-900 px-4 py-6 text-white shadow-lg shadow-primary/25">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_0%_0%,rgba(255,255,255,0.14),transparent_55%)]"
          aria-hidden
        />
        <div className="container relative z-10 mx-auto max-w-6xl text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <SiApple className="h-7 w-7" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">IPSW Downloads</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/90 md:text-[0.95rem]">
            Κατεβάστε τρέχουσες και προηγούμενες εκδόσεις firmware Apple (iOS για iPhone μέσω του εργαλείου
            μας· για iPad, macOS, watchOS, tvOS δείτε τον πλήρη κατάλογο στο ipsw.me).
          </p>
        </div>
      </div>

      <main className="relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 0%, hsl(185 100% 42% / 0.12), transparent), radial-gradient(ellipse 50% 30% at 100% 100%, hsl(185 80% 40% / 0.06), transparent)",
          }}
        />

        <div className="container relative mx-auto max-w-6xl px-4 py-8 md:py-10">
          <nav className="mb-6 text-xs text-zinc-500">
            <Link href="/services" className="hover:text-primary transition-colors">
              Υπηρεσίες
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-300">IPSW Download</span>
          </nav>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            {/* Stepper */}
            <aside className="shrink-0 lg:w-52">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Βήματα
              </p>
              <ol className="space-y-0">
                {STEPS.map((s, i) => (
                  <li key={s.key}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        activeStep === s.key
                          ? "bg-primary font-semibold text-white shadow-lg shadow-primary/30"
                          : activeStep > s.key
                            ? "text-zinc-400"
                            : "text-zinc-600",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          activeStep === s.key
                            ? "bg-white/20"
                            : activeStep > s.key
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-zinc-800 text-zinc-500",
                        )}
                      >
                        {activeStep > s.key ? "✓" : s.key}
                      </span>
                      <span className="leading-tight">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="ml-[22px] h-2 border-l border-dashed border-zinc-700" />
                    )}
                  </li>
                ))}
              </ol>
            </aside>

            {/* Main panel */}
            <div className="min-w-0 flex-1">
              {!product && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-white md:text-xl">
                    Επιλέξτε προϊόν
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Όπως στο ipsw.me — ξεκινήστε από την κατηγορία. Για iPhone έχουμε ενσωματωμένο κατάλογο
                    μοντέλων.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {PRODUCTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (p.available) {
                            setProduct(p.id);
                            setSelected(null);
                          } else {
                            setProduct(p.id);
                            window.open("https://ipsw.me", "_blank", "noopener,noreferrer");
                          }
                        }}
                        onMouseEnter={() => setHoverProduct(p.id)}
                        onMouseLeave={() => setHoverProduct(null)}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border bg-zinc-900/80 text-left transition-all",
                          p.available
                            ? "border-zinc-700 hover:border-primary"
                            : "border-zinc-800 opacity-90 hover:border-zinc-600",
                          hoverProduct === p.id && "border-primary ring-1 ring-primary/40",
                        )}
                      >
                        <div className="aspect-[5/4] overflow-hidden bg-zinc-950">
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100"
                          />
                        </div>
                        <div className="border-t border-white/5 px-3 py-2.5 text-center text-sm font-medium text-zinc-200">
                          {p.label}
                        </div>
                        {!p.available && (
                          <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-300">
                            ipsw.me
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product && product !== "iphone" && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                  <p className="text-sm text-zinc-400">
                    Ο ενσωματωμένος κατάλογος εδώ είναι για iPhone. Για αυτή την κατηγορία ανοίξαμε το{" "}
                    <strong className="text-zinc-200">ipsw.me</strong> σε νέα καρτέλα.
                  </p>
                  <Button variant="outline" className="mt-4 border-zinc-600" onClick={goBackProduct}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Πίσω
                  </Button>
                </div>
              )}

              {product === "iphone" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        onClick={selected ? goBackDevice : goBackProduct}
                        className="mb-2 inline-flex items-center text-xs font-medium text-primary hover:underline"
                      >
                        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                        {selected ? "Άλλο μοντέλο" : "Άλλο προϊόν"}
                      </button>
                      <h2 className="font-display text-lg font-semibold text-white md:text-xl">
                        {selected ? selected.name : "Επιλέξτε συσκευή iPhone"}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        Δεδομένα από{" "}
                        <a
                          href="https://ipsw.me"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          ipsw.me API
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </div>

                  {!selected && (
                    <>
                      {/* Sticky search + sort — always at top of this section */}
                      <div className="sticky top-0 z-30 -mx-1 border-b border-zinc-800/80 bg-[#0c0c0d]/95 px-1 py-3 backdrop-blur-md">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                              placeholder="Αναζήτηση μοντέλου…"
                              value={deviceQuery}
                              onChange={(e) => setDeviceQuery(e.target.value)}
                              className="h-11 border-zinc-700 bg-zinc-900/90 pl-10 text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <SortAsc className="h-4 w-4 text-zinc-500" />
                            <select
                              value={sortMode}
                              onChange={(e) => setSortMode(e.target.value as SortMode)}
                              className="h-11 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-200"
                              aria-label="Ταξινόμηση"
                            >
                              <option value="newest">Νεότερα / νεότερο μοντέλο</option>
                              <option value="name">Αλφαβητικά (όνομα)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {errDevices && (
                        <p className="text-sm text-red-400">
                          {(errDevices as Error).message || "Σφάλμα φόρτωσης συσκευών."}
                        </p>
                      )}

                      {loadingDevices && (
                        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          Φόρτωση μοντέλων…
                        </div>
                      )}

                      {!loadingDevices && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {filteredDevices.map((d) => (
                            <button
                              key={d.identifier}
                              type="button"
                              onClick={() => setSelected(d)}
                              className={cn(
                                "flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left transition hover:border-primary/70 hover:bg-zinc-800/80",
                              )}
                            >
                              <span className="font-medium text-zinc-100">{d.name}</span>
                              <span className="truncate font-mono text-xs text-zinc-500">{d.identifier}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {!loadingDevices && filteredDevices.length === 0 && (
                        <p className="py-8 text-center text-sm text-zinc-500">Δεν βρέθηκε μοντέλο.</p>
                      )}
                    </>
                  )}

                  {selected && loadingFw && (
                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Φόρτωση firmware…
                    </div>
                  )}

                  {selected && errFw && (
                    <p className="text-sm text-red-400">{(errFw as Error).message}</p>
                  )}

                  {selected && detail && !loadingFw && (
                    <div className="space-y-6">
                      {signedLatest.length > 0 && (
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-5">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge className="border-0 bg-emerald-600/90 text-white hover:bg-emerald-600">
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Signed
                            </Badge>
                            <span className="text-xl font-semibold tabular-nums">iOS {signedLatest[0].version}</span>
                            <span className="text-sm text-zinc-400">Build {signedLatest[0].buildid}</span>
                          </div>
                          <p className="mb-4 text-xs text-zinc-500">
                            {formatReleaseDate(signedLatest[0].releasedate)} · {formatFirmwareSize(signedLatest[0].filesize)}
                          </p>
                          <Button
                            asChild
                            className="h-11 rounded-full bg-primary px-8 text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
                          >
                            <a
                              href={signedLatest[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackDownloadClick(selected, signedLatest[0])}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Λήψη .ipsw
                            </a>
                          </Button>
                        </div>
                      )}

                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          <ArrowDown className="h-3.5 w-3.5" />
                          Όλες οι εκδόσεις
                        </h3>
                        <ScrollArea className="h-[min(420px,50vh)] rounded-xl border border-zinc-800 bg-zinc-900/40">
                          <div className="space-y-1 p-2">
                            {firmwares.map((fw) => (
                              <div
                                key={`${fw.buildid}-${fw.version}`}
                                className="flex flex-col gap-3 rounded-lg px-3 py-3 transition hover:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold tabular-nums">iOS {fw.version}</span>
                                    {fw.signed ? (
                                      <Badge className="h-5 border-0 bg-emerald-500/20 text-[10px] text-emerald-400">
                                        <ShieldCheck className="mr-0.5 h-3 w-3" />
                                        Signed
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="h-5 border-zinc-600 text-[10px] text-zinc-500">
                                        <ShieldOff className="mr-0.5 h-3 w-3" />
                                        Unsigned
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="font-mono text-xs text-zinc-500">Build {fw.buildid}</div>
                                  <div className="text-xs text-zinc-500">
                                    {formatReleaseDate(fw.releasedate)} · {formatFirmwareSize(fw.filesize)}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="shrink-0 border-zinc-600" asChild>
                                  <a
                                    href={fw.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackDownloadClick(selected, fw)}
                                  >
                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                    Λήψη
                                  </a>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center text-[11px] leading-relaxed text-zinc-500">
            Δεν είμαστε συνδεδεμένοι με την Apple. Οι σύνδεσμοι λήψης οδηγούν στους επίσημους διακομιστές της
            Apple. Η HiTech Doctor δεν φιλοξενεί αρχεία IPSW — χρησιμοποιούμε το API του ipsw.me. Restore με
            δική σας ευθύνη.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
