import { Phone } from "lucide-react";

export function SosButton() {
  return (
    <a
      href="tel:+306981882005"
      aria-label="Επείγον - Καλέστε μας στο 6981882005"
      data-testid="button-sos"
      title="Επείγον — Καλέστε μας"
      className="fixed right-4 bottom-6 z-[155] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 group"
      style={{
        background: "linear-gradient(135deg, #dc2626, #b91c1c)",
        boxShadow: "0 4px 20px rgba(220,38,38,0.5)",
      }}
    >
      <Phone className="w-5 h-5 text-white" />
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-14 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
        Επείγον — Καλέστε μας
        <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900" />
      </span>
    </a>
  );
}
