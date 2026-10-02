import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tokens.css";
import "../styles/base.css";
import "./prototype.css";
import { THEME } from "../config";
import { startClarity } from "../analytics/clarity";
import { initMotion } from "../../scripts/motion.js";
import { App } from "./App";

// prototype/index.html loads Inter. The neutral theme uses Instrument Sans instead.
if (THEME === "neutral") {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap";
  document.head.append(link);
}

// Before the first render, so the first events are queued.
startClarity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

initMotion({ live: true });
