/** Ίδιο event για hero κουμπί, floating RepairChatbot, μπάρα AI στο Navbar */
export const OPEN_REPAIR_CHAT_EVENT = "hitech:open-repair-chat";

export type OpenRepairChatDetail = {
  /** Προγέμισμα πεδίου μηνύματος στο chat (ο χρήστης στέλνει μετά την αποδοχή όρων). */
  draftQuery?: string;
};

export function requestOpenRepairChat(detail?: OpenRepairChatDetail): void {
  window.dispatchEvent(
    new CustomEvent<OpenRepairChatDetail>(OPEN_REPAIR_CHAT_EVENT, {
      detail: detail ?? {},
    })
  );
}
