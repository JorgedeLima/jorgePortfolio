import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tokens.css";
import "../styles/base.css";
import "./site.css";
import { startClarity } from "../analytics/clarity";
import { App } from "./App";

// Before the first render, so the first events are queued.
startClarity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
