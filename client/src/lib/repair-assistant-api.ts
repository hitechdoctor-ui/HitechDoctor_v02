import { getAnalyticsSessionId } from "@/lib/analytics-session";
import type { RepairChatClientContext } from "@/lib/repair-chat-device";
import type { RepairChatCta } from "@shared/repair-assistant";

export type RepairAssistantTurn = {
  role: "user" | "assistant";
  content: string;
  ctas?: RepairChatCta[];
};

export type RepairAssistantResponse = {
  ok: boolean;
  status: number;
  reply?: string;
  message?: string;
  ctas?: RepairChatCta[];
  leadEmailSent?: boolean;
};

export async function fetchRepairAssistantReply(params: {
  messages: RepairAssistantTurn[];
  serviceTermsAccepted: boolean;
  clientContext: RepairChatClientContext;
}): Promise<RepairAssistantResponse> {
  const res = await fetch("/api/chat/repair-assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": getAnalyticsSessionId(),
    },
    body: JSON.stringify({
      messages: params.messages,
      serviceTermsAccepted: true,
      clientContext: params.clientContext,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    reply?: string;
    message?: string;
    ctas?: RepairChatCta[];
    leadEmailSent?: boolean;
  };
  return {
    ok: res.ok,
    status: res.status,
    reply: data.reply,
    message: data.message,
    ctas: data.ctas,
    leadEmailSent: data.leadEmailSent,
  };
}
