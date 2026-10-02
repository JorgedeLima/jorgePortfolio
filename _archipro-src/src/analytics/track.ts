declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

// Sends a named event to Microsoft Clarity. Does nothing if Clarity is not loaded or is blocked.
export function track(name: string): void {
  try {
    window.clarity?.("event", name);
  } catch {
    // Tracking must never break the demo.
  }
}
