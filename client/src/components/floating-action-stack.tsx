import { SosButton } from "@/components/sos-button";
import { AccessibilityButton } from "@/components/accessibility-button";
import { RepairChatbot } from "@/components/repair-chatbot";

/**
 * Ενιαία στήλη FAB: πάνω AI, μέση προσβασιμότητα, κάτω τηλέφωνο.
 * Ίδιο right / items-center για ευθυγράμμιση.
 */
export function FloatingActionStack() {
  return (
    <div
      className="fixed bottom-6 right-4 z-[150] flex flex-col-reverse gap-3 items-center pointer-events-none sm:right-6"
      aria-label="Γρήγορες ενέργειες"
    >
      <SosButton />
      <AccessibilityButton />
      <RepairChatbot />
    </div>
  );
}
