import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import type { ProductOfferInterest, RepairRequest, WebsiteInquiry } from "@shared/schema";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { setDocumentTitleBadge, setFaviconBadge } from "@/lib/favicon-badge";

const SOUND_KEY = "admin-notification-sound";
const SEEN_KEY = "admin-notification-seen-ids";
const UNREAD_KEY = "admin-notification-unread";
const NOTIFICATION_MP3 = "/notification.mp3";
const BASE_TITLE = "HiTech Admin";

type SeenIds = { offer: number; repair: number; inquiry: number };

function readSeen(): SeenIds {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return { offer: 0, repair: 0, inquiry: 0, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { offer: 0, repair: 0, inquiry: 0 };
}

function writeSeen(seen: SeenIds) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

function readUnread(): number {
  const n = Number(localStorage.getItem(UNREAD_KEY) || "0");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Real-time notification monitor for the whole admin panel:
 * - Polls product offers, repair requests, website inquiries
 * - Browser desktop notifications + MP3 sound
 * - Favicon + tab title badge with unread count
 */
export function NotificationMonitor({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem(SOUND_KEY) !== "false",
  );
  const [unread, setUnread] = useState(() => readUnread());
  const seenRef = useRef<SeenIds>(readSeen());
  const primedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioRef.current = new Audio(NOTIFICATION_MP3);
    audioRef.current.volume = 0.45;
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void setFaviconBadge(unread);
    setDocumentTitleBadge(unread, BASE_TITLE);
    localStorage.setItem(UNREAD_KEY, String(unread));
  }, [unread, enabled]);

  const bumpUnread = useCallback((by = 1) => {
    setUnread((u) => u + by);
  }, []);

  const clearUnread = useCallback(() => {
    setUnread(0);
    void setFaviconBadge(0);
    setDocumentTitleBadge(0, BASE_TITLE);
    localStorage.setItem(UNREAD_KEY, "0");
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        variant: "destructive",
        title: "Δεν υποστηρίζεται",
        description: "Ο browser σας δεν υποστηρίζει notifications.",
      });
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      toast({
        title: "Ενεργοποιήθηκαν οι ειδοποιήσεις",
        description: "Θα λαμβάνετε browser notifications + ήχο για νέες φόρμες.",
      });
      // Unlock audio on user gesture
      void audioRef.current?.play().then(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      }).catch(() => {});
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem(SOUND_KEY, String(next));
    if (next && audioRef.current) {
      void audioRef.current.play().catch(() => {});
    }
  };

  const playSound = () => {
    if (!soundEnabled || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    void audioRef.current.play().catch(() => {});
  };

  const showNotification = (title: string, body: string) => {
    playSound();
    bumpUnread(1);
    toast({ title, description: body, duration: 9000 });

    if (permission !== "granted" || !("Notification" in window)) return;
    try {
      const notification = new Notification(title, {
        body,
        icon: "/logo-192.png",
        badge: "/logo-32.png",
        tag: `hitech-${Date.now()}`,
        requireInteraction: true,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      setTimeout(() => notification.close(), 20000);
    } catch {
      /* ignore */
    }
  };

  const { data: offerInterests } = useQuery<ProductOfferInterest[]>({
    queryKey: ["admin-product-offer-interests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/product-offer-interests", {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled,
    refetchInterval: enabled ? 12_000 : false,
    refetchIntervalInBackground: true,
  });

  const { data: repairRequests } = useQuery<RepairRequest[]>({
    queryKey: ["/api/admin/repair-requests"],
    enabled,
    refetchInterval: enabled ? 12_000 : false,
    refetchIntervalInBackground: true,
  });

  const { data: websiteInquiries } = useQuery<WebsiteInquiry[]>({
    queryKey: ["/api/website-inquiries"],
    queryFn: async () => {
      const res = await fetch("/api/website-inquiries", {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled,
    refetchInterval: enabled ? 12_000 : false,
    refetchIntervalInBackground: true,
  });

  // Prime seen IDs once data loads (avoid firing for historical rows)
  useEffect(() => {
    if (!enabled || primedRef.current) return;
    const offerMax = offerInterests?.[0]?.id ?? 0;
    const repairMax = repairRequests?.[0]?.id ?? 0;
    const inquiryMax = websiteInquiries?.[0]?.id ?? 0;
    // Wait until at least one query has resolved
    if (
      offerInterests === undefined &&
      repairRequests === undefined &&
      websiteInquiries === undefined
    ) {
      return;
    }
    const seen = seenRef.current;
    seen.offer = Math.max(seen.offer, offerMax);
    seen.repair = Math.max(seen.repair, repairMax);
    seen.inquiry = Math.max(seen.inquiry, inquiryMax);
    writeSeen(seen);
    primedRef.current = true;
  }, [enabled, offerInterests, repairRequests, websiteInquiries]);

  useEffect(() => {
    if (!enabled || !primedRef.current || !offerInterests?.length) return;
    const newest = [...offerInterests].sort((a, b) => b.id - a.id);
    const fresh = newest.filter((r) => r.id > seenRef.current.offer);
    if (!fresh.length) return;
    seenRef.current.offer = fresh[0].id;
    writeSeen(seenRef.current);
    for (const row of fresh.reverse()) {
      showNotification(
        "🛒 Νέα εκδήλωση ενδιαφέροντος eShop",
        `${row.customerName} — ${row.productName}\nΤηλ: ${row.phone}`,
      );
    }
    queryClient.invalidateQueries({ queryKey: ["admin-product-offer-interests"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showNotification is stable enough via refs
  }, [offerInterests, enabled]);

  useEffect(() => {
    if (!enabled || !primedRef.current || !repairRequests?.length) return;
    const newest = [...repairRequests].sort((a, b) => b.id - a.id);
    const fresh = newest.filter((r) => r.id > seenRef.current.repair);
    if (!fresh.length) return;
    seenRef.current.repair = fresh[0].id;
    writeSeen(seenRef.current);
    for (const row of fresh.reverse()) {
      showNotification(
        "🔧 Νέο αίτημα επισκευής",
        `${row.firstName} ${row.lastName} — ${row.deviceName}\nΤηλ: ${row.phone}`,
      );
    }
    queryClient.invalidateQueries({ queryKey: ["/api/admin/repair-requests"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repairRequests, enabled]);

  useEffect(() => {
    if (!enabled || !primedRef.current || !websiteInquiries?.length) return;
    const newest = [...websiteInquiries].sort((a, b) => b.id - a.id);
    const fresh = newest.filter((r) => r.id > seenRef.current.inquiry);
    if (!fresh.length) return;
    seenRef.current.inquiry = fresh[0].id;
    writeSeen(seenRef.current);
    for (const row of fresh.reverse()) {
      showNotification(
        "🌐 Νέο αίτημα ιστοσελίδας",
        `${row.firstName} ${row.lastName ?? ""}\nΤηλ: ${row.phone} · ${row.email}`,
      );
    }
    queryClient.invalidateQueries({ queryKey: ["/api/website-inquiries"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteInquiries, enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex gap-2 pointer-events-auto max-w-[calc(100vw-1.5rem)]">
      {unread > 0 && (
        <Button
          variant="outline"
          className="h-12 rounded-full border-rose-500/40 bg-rose-500/15 px-4 text-rose-200 shadow-lg backdrop-blur-sm hover:bg-rose-500/25"
          onClick={clearUnread}
          title="Καθαρισμός μετρητή ειδοποιήσεων"
        >
          <span className="mr-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
          Καθαρισμός
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-white/10 bg-card/90 shadow-lg backdrop-blur-sm hover:bg-card"
        onClick={toggleSound}
        title={soundEnabled ? "Απενεργοποίηση ήχου" : "Ενεργοποίηση ήχου"}
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5 text-primary" />
        ) : (
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      {permission === "default" ? (
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 animate-pulse rounded-full border-amber-500/30 bg-amber-500/10 shadow-lg backdrop-blur-sm hover:bg-amber-500/20"
          onClick={requestPermission}
          title="Ενεργοποίηση browser notifications"
        >
          <BellOff className="h-5 w-5 text-amber-500" />
        </Button>
      ) : permission === "granted" ? (
        <button
          type="button"
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 shadow-lg backdrop-blur-sm"
          title="Ειδοποιήσεις ενεργές — κλικ για καθαρισμό"
          onClick={clearUnread}
        >
          <Bell className="h-5 w-5 text-green-400" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 shadow-lg backdrop-blur-sm">
          <BellOff className="h-5 w-5 text-red-400" />
        </div>
      )}
    </div>
  );
}
