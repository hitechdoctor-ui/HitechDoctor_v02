import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoxNowLockerSelected } from "@/lib/boxnow-types";

const MAP_CONTAINER_ID = "boxnowmap-hitech";
const SCRIPT_ID = "boxnow-map-widget-v5";

declare global {
  interface Window {
    _bn_map_widget_config?: {
      partnerId?: number;
      parentElement: string;
      type?: string;
      gps?: string;
      autoclose?: string;
      afterSelect: (selected: BoxNowLockerSelected) => void;
    };
  }
}

/**
 * Επίσημο BoxNow Map Widget (v5) — φόρτωση από widget-cdn.boxnow.cy
 * Προαιρετικό `VITE_BOXNOW_PARTNER_ID` (partner ID από BoxNow μετά από εγγραφή).
 */
export function BoxnowMapEmbed({
  onSelect,
  className,
}: {
  onSelect: (locker: BoxNowLockerSelected) => void;
  className?: string;
}) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    window._bn_map_widget_config = {
      parentElement: `#${MAP_CONTAINER_ID}`,
      type: "iframe",
      gps: "yes",
      autoclose: "yes",
      afterSelect(selected) {
        onSelectRef.current(selected);
      },
    };
    const partnerRaw = import.meta.env.VITE_BOXNOW_PARTNER_ID as string | undefined;
    if (partnerRaw && String(partnerRaw).trim() !== "") {
      const n = Number(partnerRaw);
      if (!Number.isNaN(n)) window._bn_map_widget_config.partnerId = n;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://widget-cdn.boxnow.cy/map-widget/client/v5.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <Button
        type="button"
        className="boxnow-map-widget-button w-full sm:w-auto gap-2"
        variant="secondary"
        data-testid="button-boxnow-open-map"
      >
        <MapPin className="w-4 h-4 shrink-0" />
        Άνοιγμα χάρτη BoxNow
      </Button>
      <div
        id={MAP_CONTAINER_ID}
        className="min-h-[420px] w-full rounded-xl border border-border bg-card/50 overflow-hidden"
        aria-label="Χάρτης BoxNow Lockers"
      />
    </div>
  );
}
