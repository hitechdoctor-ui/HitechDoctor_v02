import { createRequire } from "node:module";
import { join } from "node:path";
import type { Express, NextFunction, Request, Response } from "express";
import { storage } from "./storage";
import type { Order, RepairRequest } from "@shared/schema";

/** `import.meta.url` στο bundled `dist/index.cjs` δίνει ERR_INVALID_ARG_VALUE στο createRequire (Railway). Το package.json ρίζας είναι σταθερό anchor. */
const requireViber = createRequire(join(process.cwd(), "package.json"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ViberBot = requireViber("viber-bot") as {
  Bot: new (config: {
    authToken: string;
    name: string;
    avatar: string;
    logger?: {
      info: (...a: unknown[]) => void;
      debug: (...a: unknown[]) => void;
      warn: (...a: unknown[]) => void;
      error: (...a: unknown[]) => void;
    };
  }) => ViberBotInstance;
  Events: { MESSAGE_RECEIVED: string };
  Message: { Text: new (text: string) => { verifyMessage: () => void; toJson: () => unknown } };
  UserProfile: new (id: string, name?: string, avatar?: string | null) => { id: string };
};

type ViberBotInstance = {
  middleware: () => import("express").RequestHandler;
  setWebhook: (url: string, isInline?: boolean) => Promise<unknown>;
  sendMessage: (
    user: InstanceType<typeof ViberBot.UserProfile>,
    message: InstanceType<typeof ViberBot.Message.Text>
  ) => Promise<unknown>;
  onTextMessage: (re: RegExp, cb: (message: { text: string }, response: { send: (m: unknown) => void }) => void) => void;
  onConversationStarted: (
    cb: (
      userProfile: { id: string },
      isSubscribed: boolean,
      context: string,
      next: (msg: InstanceType<typeof ViberBot.Message.Text> | null, data: Record<string, unknown>) => void
    ) => void
  ) => void;
};

const DEFAULT_AVATAR =
  "https://www.viber.com/app_s/images/viber-icon.png";

const REPAIR_STATUS_EL: Record<string, string> = {
  pending: "Νέο",
  "in-progress": "Σε εξέλιξη",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
};

const ORDER_STATUS_EL: Record<string, string> = {
  pending: "Εκκρεμεί",
  processing: "Επεξεργασία",
  shipped: "Απεστάλη",
  delivered: "Παραδόθηκε",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
};

let botInstance: ViberBotInstance | null = null;

/** Το viber-bot καλεί info/debug/warn/error — χωρίς `info` σκάει στο setWebhook (Railway). */
function viberLogger() {
  return {
    info: (...args: unknown[]) => {
      if (process.env.VIBER_DEBUG === "1") console.info("[viber]", ...args);
    },
    debug: (...args: unknown[]) => {
      if (process.env.VIBER_DEBUG === "1") console.debug("[viber]", ...args);
    },
    warn: (...args: unknown[]) => console.warn("[viber]", ...args),
    error: (...args: unknown[]) => console.error("[viber]", ...args),
  };
}

function getBot(): ViberBotInstance | null {
  const token = process.env.VIBER_AUTH_TOKEN?.trim();
  if (!token) return null;
  if (!botInstance) {
    const name = process.env.VIBER_BOT_NAME?.trim() || "HiTech Doctor";
    const avatar = process.env.VIBER_BOT_AVATAR?.trim() || DEFAULT_AVATAR;
    const bot = new ViberBot.Bot({
      authToken: token,
      name,
      avatar,
      logger: viberLogger(),
    }) as ViberBotInstance;

    bot.onConversationStarted((userProfile, _isSubscribed, _context, next) => {
      next(
        new ViberBot.Message.Text(
          "Καλώς ήρθατε στο HiTech Doctor!\n\nΓια να λαμβάνετε ενημερώσεις επισκευής, στείλτε μήνυμα με τον κωδικό αιτήματος, π.χ.:\nREPR42\nή\nΕΠΙΣΚΕΥΗ 42"
        ),
        {}
      );
    });

    const linkRepairToViber = async (
      repairId: number,
      response: { userProfile: { id: string }; send: (m: unknown) => void }
    ) => {
      const viberUserId = response.userProfile?.id;
      if (!viberUserId) return;
      try {
        const repair = await storage.getRepairRequestById(repairId);
        if (!repair) {
          response.send(new ViberBot.Message.Text(`Δεν βρέθηκε αίτημα επισκευής #${repairId}.`));
          return;
        }
        await storage.updateRepairRequest(repairId, { viberUserId });
        const cust = await storage.getCustomerByEmail(repair.email);
        if (cust && !cust.viberUserId) {
          await storage.updateCustomer(cust.id, { viberUserId });
        }
        response.send(
          new ViberBot.Message.Text(
            `Συνδέθηκε το Viber σας με το αίτημα #REPR-${String(repairId).padStart(4, "0")} (${repair.deviceName}). Θα λαμβάνετε ενημερώσεις κατάστασης εδώ.`
          )
        );
      } catch (e) {
        console.error("[viber] link repair failed", e);
        response.send(new ViberBot.Message.Text("Προσωρινό σφάλμα. Δοκιμάστε ξανά αργότερα."));
      }
    };

    bot.onTextMessage(/^REPR-?(\d+)$/i, (message, response) => {
      const m = /^REPR-?(\d+)$/i.exec(message.text.trim());
      const id = m ? parseInt(m[1], 10) : NaN;
      if (!Number.isFinite(id)) return;
      void linkRepairToViber(id, response as { userProfile: { id: string }; send: (m: unknown) => void });
    });

    bot.onTextMessage(/^ΕΠΙΣΚΕΥΗ\s*(\d+)$/i, (message, response) => {
      const m = /^ΕΠΙΣΚΕΥΗ\s*(\d+)$/i.exec(message.text.trim());
      const id = m ? parseInt(m[1], 10) : NaN;
      if (!Number.isFinite(id)) return;
      void linkRepairToViber(id, response as { userProfile: { id: string }; send: (m: unknown) => void });
    });

    bot.onTextMessage(/.+/, (message, response) => {
      if (/^REPR-?\d+$/i.test(message.text.trim()) || /^ΕΠΙΣΚΕΥΗ\s*\d+$/i.test(message.text.trim())) return;
      response.send(
        new ViberBot.Message.Text(
          "Γράψτε REPR και τον αριθμό αιτήματος (π.χ. REPR12) ή «ΕΠΙΣΚΕΥΗ 12» για σύνδεση με την επισκευή σας."
        )
      );
    });

    botInstance = bot;
  }
  return botInstance;
}

/** Το viber-bot διαβάζει κεφαλαίο X_Viber_Content_Signature — το Express δίνει lowercase. */
export function viberSignatureHeaderFix(req: Request, _res: Response, next: NextFunction) {
  const sig = req.get("x-viber-content-signature");
  if (sig) (req.headers as Record<string, string>)["X_Viber_Content_Signature"] = sig;
  next();
}

export function registerViberWebhook(app: Express) {
  const bot = getBot();
  if (!bot) return;
  app.use("/api/viber/webhook", viberSignatureHeaderFix, bot.middleware());
}

export function scheduleViberWebhookRegistration(publicBaseUrl: string) {
  const bot = getBot();
  if (!bot) return;
  const base = publicBaseUrl.replace(/\/$/, "");
  const url = `${base}/api/viber/webhook`;
  bot
    .setWebhook(url)
    .then(() => console.log(`[viber] Webhook registered: ${url}`))
    .catch((e: unknown) => console.error("[viber] setWebhook failed:", e));
}

export async function sendViberText(receiverViberUserId: string, text: string): Promise<void> {
  const bot = getBot();
  if (!bot) {
    console.warn("[viber] skip send: VIBER_AUTH_TOKEN not set");
    return;
  }
  const profile = new ViberBot.UserProfile(receiverViberUserId, "");
  await bot.sendMessage(profile, new ViberBot.Message.Text(text));
}

function repairLabel(status: string) {
  return REPAIR_STATUS_EL[status] ?? status;
}

function orderLabel(status: string) {
  return ORDER_STATUS_EL[status] ?? status;
}

export async function notifyRepairStatusChange(
  repair: RepairRequest,
  previousStatus: string,
  newStatus: string
): Promise<void> {
  if (previousStatus === newStatus) return;
  let receiver = repair.viberUserId?.trim() || null;
  if (!receiver) {
    const cust = await storage.getCustomerByEmail(repair.email);
    receiver = cust?.viberUserId?.trim() || null;
  }
  if (!receiver) return;
  const code = `REPR-${String(repair.id).padStart(4, "0")}`;
  const text = `HiTech Doctor — Ενημέρωση επισκευής ${code}\nΣυσκευή: ${repair.deviceName}\nΝέα κατάσταση: ${repairLabel(newStatus)}`;
  try {
    await sendViberText(receiver, text);
  } catch (e) {
    console.error("[viber] notifyRepairStatusChange failed", e);
  }
}

export async function notifyOrderStatusChange(
  order: Order,
  customerViberUserId: string | null | undefined,
  newStatus: string,
  previousStatus: string
): Promise<void> {
  if (previousStatus === newStatus) return;
  const receiver = customerViberUserId?.trim();
  if (!receiver) return;
  const text = `HiTech Doctor — Παραγγελία #ORD-${String(order.id).padStart(4, "0")}\nΝέα κατάσταση: ${orderLabel(newStatus)}`;
  try {
    await sendViberText(receiver, text);
  } catch (e) {
    console.error("[viber] notifyOrderStatusChange failed", e);
  }
}
