/** Κοινή κατάσταση: η μπάρα AI στο header «μαζεύεται» μετά από scroll — το FAB μπορεί να δείχνει ένδειξη. */
type Listener = (collapsed: boolean) => void;

const listeners = new Set<Listener>();
let collapsed = false;

export function setNavbarAiBarCollapsed(next: boolean): void {
  if (collapsed === next) return;
  collapsed = next;
  listeners.forEach((fn) => fn(next));
}

export function getNavbarAiBarCollapsed(): boolean {
  return collapsed;
}

export function subscribeNavbarAiBarCollapsed(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
