export type Theme = "archipro" | "neutral";

// The one switch for the prototype's brand.
// "archipro": ArchiPro's design language, the A mark and the unofficial label.
// "neutral": Jorge's palette and Instrument Sans, no logo, no label.
export const THEME = "archipro" as Theme;

export const USAGE_NOTICE =
  "This prototype records anonymous usage to help me improve it. Text you type is not recorded.";

export const UNOFFICIAL_LABEL = "Unofficial concept by Jorge de Lima. Not affiliated with ArchiPro.";

// Vite's base path ("/archipro/"), for links between the two pages and files in public/.
export const BASE = import.meta.env.BASE_URL;
export const PROTOTYPE_URL = `${BASE}prototype/`;
export const CASE_STUDY_URL = BASE;
