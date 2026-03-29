/**
 * AI βοηθός επισκευών — υλοποίηση στο `chat-repair.ts`.
 *
 * Συμπεριφορά (σύνοψη):
 * - Διάκριση επισκευής vs eShop στο system prompt.
 * - Εσωτερική αναζήτηση (ίδια λογική με Global Search) + τιμές από `repair_price_overrides` (χωρίς cache — άμεσες χειροκίνητες αλλαγές).
 * - Χωρίς τιμή επισκευής: CTA «Αίτημα Προσφοράς Επισκευής» με `action: repair_quote_modal` (όχι «επικοινωνήστε»).
 */
export {
  getRepairCatalogPromptBlock,
  buildRepairAssistantSystemPrompt,
  runRepairAssistantChat,
  type ChatTurn,
} from "./chat-repair";
