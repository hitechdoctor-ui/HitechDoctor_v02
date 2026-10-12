import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import type { ProductOfferInterest, RepairRequest } from "@shared/schema";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Real-time notification monitor for admin dashboard
 * - Polls for new product offer interests and repair requests
 * - Shows browser desktop notifications
 * - Optional audio alert
 */
export function NotificationMonitor({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("admin-notification-sound") !== "false"
  );
  const lastOfferIdRef = useRef<number | null>(null);
  const lastRepairIdRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Using a simple notification sound (you can replace with a custom audio file)
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTQGGGW789eOOwchb7fv6qhMEA0=");
  }, []);

  // Check/request permission on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
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
        description: "Θα λαμβάνετε browser notifications για νέα μηνύματα.",
      });
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("admin-notification-sound", String(newValue));
  };

  const showNotification = (title: string, body: string, icon?: string) => {
    if (permission !== "granted") return;
    const notification = new Notification(title, {
      body,
      icon: icon || "/logo-32.png",
      badge: "/logo-32.png",
      tag: "hitech-admin",
      requireInteraction: false,
    });
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio play might be blocked by browser policy
      });
    }
    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  };

  // Poll for new offer interests
  const { data: offerInterests } = useQuery<ProductOfferInterest[]>({
    queryKey: ["admin-product-offer-interests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/product-offer-interests", {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch offer interests");
      return res.json();
    },
    enabled,
    refetchInterval: enabled ? 15000 : false, // Poll every 15 seconds when dashboard is open
    refetchIntervalInBackground: false,
  });

  // Poll for repair requests
  const { data: repairRequests } = useQuery<RepairRequest[]>({
    queryKey: ["/api/admin/repair-requests"],
    refetchInterval: enabled ? 20000 : false, // Poll every 20 seconds
    refetchIntervalInBackground: false,
  });

  // Detect new offer interests
  useEffect(() => {
    if (!enabled || !offerInterests?.length) return;
    const latest = offerInterests[0];
    if (!latest?.id) return;

    if (lastOfferIdRef.current === null) {
      // First load — just store the ID
      lastOfferIdRef.current = latest.id;
      return;
    }

    if (latest.id > lastOfferIdRef.current) {
      // New offer interest detected!
      lastOfferIdRef.current = latest.id;
      showNotification(
        "🛒 Νέα Εκδήλωση Ενδιαφέροντος",
        `${latest.customerName} — ${latest.productName}\nΤηλ: ${latest.phone}`,
        "/logo-192.png"
      );
      toast({
        title: "🛒 Νέο μήνυμα eShop",
        description: `${latest.customerName} — ${latest.productName}`,
        duration: 8000,
      });
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ["admin-product-offer-interests"] });
    }
  }, [offerInterests, enabled, toast, queryClient]);

  // Detect new repair requests
  useEffect(() => {
    if (!enabled || !repairRequests?.length) return;
    const latest = repairRequests[0];
    if (!latest?.id) return;

    if (lastRepairIdRef.current === null) {
      lastRepairIdRef.current = latest.id;
      return;
    }

    if (latest.id > lastRepairIdRef.current) {
      lastRepairIdRef.current = latest.id;
      showNotification(
        "🔧 Νέο Αίτημα Επισκευής",
        `${latest.firstName} ${latest.lastName} — ${latest.deviceName}\nΤηλ: ${latest.phone}`,
        "/logo-192.png"
      );
      toast({
        title: "🔧 Νέο αίτημα επισκευής",
        description: `${latest.firstName} ${latest.lastName} — ${latest.deviceName}`,
        duration: 8000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/repair-requests"] });
    }
  }, [repairRequests, enabled, toast, queryClient]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      {/* Sound toggle */}
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-white/10 bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg"
        onClick={toggleSound}
        title={soundEnabled ? "Απενεργοποίηση ήχου" : "Ενεργοποίηση ήχου"}
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5 text-primary" />
        ) : (
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      {/* Notification permission toggle */}
      {permission === "default" ? (
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-amber-500/30 bg-amber-500/10 backdrop-blur-sm hover:bg-amber-500/20 shadow-lg animate-pulse"
          onClick={requestPermission}
          title="Ενεργοποίηση browser notifications"
        >
          <BellOff className="h-5 w-5 text-amber-500" />
        </Button>
      ) : permission === "granted" ? (
        <div className="h-12 w-12 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Bell className="h-5 w-5 text-green-400" />
        </div>
      ) : (
        <div className="h-12 w-12 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <BellOff className="h-5 w-5 text-red-400" />
        </div>
      )}
    </div>
  );
}
