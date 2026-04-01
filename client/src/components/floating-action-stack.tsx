import { cn } from "@/lib/utils";
import { SosButton } from "@/components/sos-button";
import { AccessibilityButton } from "@/components/accessibility-button";
import { RepairChatbot } from "@/components/repair-chatbot";

/**
 * Κάθετη στήλη FAB: τηλέφωνο, προσβασιμότητα, AI Doctor (RepairChatbot σε όλες τις δημόσιες σελίδες).
 * Στο eShop το κουμπί φίλτρων έχει z-[154] — `elevateZForOverlay` ανεβάζει τη στήλη ώστε το chat να μην καλύπτεται.
 */
export function FloatingActionStack({
  showRepairChat = true,
  elevateZForOverlay = false,
}: {
  showRepairChat?: boolean;
  /** Π.χ. eShop: κουμπί φίλτρων ίδιο δεξιά — το chat πρέπει να «πατιέται» πάνω από το φίλτρο */
  elevateZForOverlay?: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 flex flex-col-reverse gap-3 items-center pointer-events-none sm:bottom-6 sm:right-6",
        elevateZForOverlay ? "z-[165]" : "z-[150]"
      )}
      aria-label="Γρήγορες ενέργειες"
    >
      <SosButton />
      <AccessibilityButton />
      {showRepairChat ? <RepairChatbot /> : null}
    </div>
  );
}
