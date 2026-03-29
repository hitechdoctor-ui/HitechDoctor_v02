/** Ίδιο event για hero κουμπί + floating RepairChatbot */
export const OPEN_REPAIR_CHAT_EVENT = "hitech:open-repair-chat";

export function requestOpenRepairChat(): void {
  window.dispatchEvent(new Event(OPEN_REPAIR_CHAT_EVENT));
}
