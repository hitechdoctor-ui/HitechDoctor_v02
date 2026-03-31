const KEY = "hitech_analytics_session";

/** Κοινό session id για page analytics + AI chat tracking (sessionStorage). */
export function getAnalyticsSessionId(): string {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}
