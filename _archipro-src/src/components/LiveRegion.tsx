import { useEffect, useState } from "react";
import type { Announcement } from "../state/reducer";

// A polite live region for screen readers. It is always in the page, and its text is cleared
// and set again for each message so that the same sentence is announced twice if it happens twice.
export function LiveRegion({ message }: { message: Announcement | null }) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!message) return;
    setText("");
    const timer = window.setTimeout(() => setText(message.text), 50);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}
