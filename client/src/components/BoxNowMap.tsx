import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoxNowLockerSelected } from "@/lib/boxnow-types";

const MAP_CONTAINER_ID = "boxnowmap-hitech";
const SCRIPT_ID = "boxnow-map-widget-gr";

/**
 * Επίσημο BoxNow Destination Map (API Manual §4, v5 client).
 * Script: `https://widget-cdn.boxnow.gr/map-widget/client/v5.js`
 * (Το `https://widget.boxnow.gr/widget.js` συχνά δεν είναι διαθέσιμο· override με `VITE_BOXNOW_WIDGET_SCRIPT_URL`.)
 */
const DEFAULT_WIDGET_SCRIPT = "https://widget-cdn.boxnow.gr/map-widget/client/v5.js";

declare global {
  interface Window {
    _bn_map_widget_config?: {
      partnerId?: number;
      parentElement: string;
      type?: "iframe" | "popup" | "navigate" | "navigateen";
      /** Πρέπει να είναι boolean — string "yes" σπάει την αρχικοποίηση του v5.js */
      gps?: boolean;
      autoclose?: boolean;
      autoselect?: boolean;
      listener?: boolean;
      buttonSelector?: string;
      afterSelect: (selected: BoxNowLockerSelected) => void;
    };
  }
}

function parseLockerPayload(data: unknown): BoxNowLockerSelected {
  if (data == null) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as BoxNowLockerSelected;
    } catch {
      return {};
    }
  }
  return data as BoxNowLockerSelected;
}

export function BoxNowMap({
  onSelect,
  className,
}: {
  onSelect: (locker: BoxNowLockerSelected) => void;
  className?: string;
}) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const partnerRaw = import.meta.env.VITE_BOXNOW_PARTNER_ID as string | undefined;
    const scriptUrl =
      (import.meta.env.VITE_BOXNOW_WIDGET_SCRIPT_URL as string | undefined)?.trim() || DEFAULT_WIDGET_SCRIPT;

    window._bn_map_widget_config = {
      parentElement: `#${MAP_CONTAINER_ID}`,
      type: "iframe",
      gps: true,
      autoclose: true,
      autoselect: true,
      listener: true,
      buttonSelector: ".boxnow-map-widget-button",
      afterSelect(selected) {
        onSelectRef.current(parseLockerPayload(selected));
      },
    };

    if (partnerRaw && String(partnerRaw).trim() !== "") {
      const n = Number(partnerRaw);
      if (!Number.isNaN(n)) window._bn_map_widget_config!.partnerId = n;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = scriptUrl;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className={cn("space-y-4 relative z-[200]", className)}>
      <Button
        type="button"
        className="boxnow-map-widget-button w-full sm:w-auto gap-2"
        variant="secondary"
        data-testid="button-boxnow-open-map"
      >
        <MapPin className="w-4 h-4 shrink-0" />
        Επιλογή Locker BoxNow
      </Button>
      <div
        id={MAP_CONTAINER_ID}
        className="relative z-[200] w-full min-h-[600px] h-[600px] rounded-xl border border-border bg-card/50 overflow-hidden isolate"
        style={{ isolation: "isolate" }}
        aria-label="Χάρτης BoxNow Lockers"
      />
    </div>
  );
}
