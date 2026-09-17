import { useEffect, useId } from "react";
import { ExternalLink } from "lucide-react";

const EMBED_SCRIPT_ID = "tiktok-embed-script";

function loadTikTokEmbedScript(): void {
  if (document.getElementById(EMBED_SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = EMBED_SCRIPT_ID;
  script.src = "https://www.tiktok.com/embed.js";
  script.async = true;
  document.body.appendChild(script);
}

interface TikTokEmbedProps {
  url: string;
  className?: string;
}

/** Responsive TikTok embed — φορτώνει το επίσημο embed.js μία φορά. */
export function TikTokEmbed({ url, className = "" }: TikTokEmbedProps) {
  const embedId = useId().replace(/:/g, "");

  useEffect(() => {
    loadTikTokEmbedScript();
    const timer = window.setTimeout(() => {
      const w = window as Window & { tiktokEmbed?: { lib?: { render: (el?: Element) => void } } };
      w.tiktokEmbed?.lib?.render();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [url]);

  return (
    <div className={`mx-auto w-full max-w-[605px] ${className}`}>
      <blockquote
        id={embedId}
        className="tiktok-embed mx-auto"
        cite={url}
        data-video-id=""
        style={{ maxWidth: "605px", minWidth: "325px" }}
      >
        <section>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Δείτε το βίντεο στο TikTok
          </a>
        </section>
      </blockquote>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Δεν φορτώνει;{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Άνοιγμα στο TikTok <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </p>
    </div>
  );
}
