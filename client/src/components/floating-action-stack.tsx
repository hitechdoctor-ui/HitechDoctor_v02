import { SosButton } from "@/components/sos-button";
import { AccessibilityButton } from "@/components/accessibility-button";
import { RepairChatbot } from "@/components/repair-chatbot";

/**
 * Κάθετη στήλη FAB: τηλέφωνο, προσβασιμότητα, (προαιρετικά) AI Doctor.
 * Στην αρχική το RepairChatbot φορτώνεται από `home-page.tsx` πάνω από αυτή τη στήλη.
 */
export function FloatingActionStack({ showRepairChat = true }: { showRepairChat?: boolean }) {
  return (
    <div
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-[150] flex flex-col-reverse gap-3 items-center pointer-events-none sm:bottom-6 sm:right-6"
      aria-label="Γρήγορες ενέργειες"
    >
      <SosButton />
      <AccessibilityButton />
      {showRepairChat ? <RepairChatbot /> : null}
    </div>
  );
}
