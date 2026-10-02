import manifest from "./images.json";

// One entry per photo in public/images. The file is written by the dev-only photo editor
// (see dev/imageEditorPlugin.js), so photos are added in the browser, not by hand.
export interface ImageEntry {
  file: string; // path under public/, for example "images/cladding-cedar.webp"
  width: number;
  height: number;
  version: number; // changes when the photo is replaced, so browsers fetch the new file
  alt?: string; // what is in the photo. Falls back to the alt text in project.ts
  credit?: string; // for example "Photo by Jan Kopřiva on Unsplash"
  source?: string; // link to the photo page
}

// Keyed by slot. Product photos use the product id.
export const images = manifest as Record<string, ImageEntry>;
