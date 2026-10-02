import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ImageEntry } from "../data/images";
import "./ImageEditor.css";

// Dev-only tools under each photo: add or replace the photo, edit its description and credit,
// or remove it. The dev server saves the file to public/images and updates src/data/images.json.

const ENDPOINT = "/__image-editor/";
const MAX_WIDTH = 1600;

// Resizes to at most 1600px wide and encodes as WebP (JPEG where the browser cannot write WebP).
async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  let blob = await encode("image/webp", 0.82);
  if (blob?.type !== "image/webp") blob = await encode("image/jpeg", 0.85);
  if (!blob) throw new Error("this browser could not read the image");
  return { blob, width, height };
}

async function request(slot: string, init: RequestInit, query = ""): Promise<void> {
  const response = await fetch(`${ENDPOINT}${slot}${query}`, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? response.statusText);
  }
}

interface ImageEditorProps {
  slot: string;
  entry: ImageEntry | undefined;
  defaultAlt: string;
}

export function ImageEditor({ slot, entry, defaultAlt }: ImageEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [alt, setAlt] = useState(entry?.alt ?? defaultAlt);
  const [credit, setCredit] = useState(entry?.credit ?? "");
  const [source, setSource] = useState(entry?.source ?? "");

  async function run(task: () => Promise<string>) {
    try {
      setMessage(await task());
    } catch (error) {
      setMessage(`Not saved: ${error instanceof Error ? error.message : "something went wrong"}.`);
    }
  }

  function upload(file: File) {
    setMessage("Saving the photo.");
    void run(async () => {
      const { blob, width, height } = await prepare(file);
      await request(slot, { method: "PUT", headers: { "Content-Type": blob.type }, body: blob }, `?width=${width}&height=${height}`);
      return `Photo saved at ${width} by ${height} pixels, ${Math.round(blob.size / 1024)} KB. Check the description still fits.`;
    });
  }

  function saveDetails() {
    void run(async () => {
      await request(slot, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt, credit, source }),
      });
      return "Details saved.";
    });
  }

  function remove() {
    if (!window.confirm("Remove this photo? The file is deleted from public/images.")) return;
    void run(async () => {
      await request(slot, { method: "DELETE" });
      return "Photo removed.";
    });
  }

  // The editor can sit inside another form (the Compare screen), so Enter must not submit that form.
  function saveOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    saveDetails();
  }

  return (
    <div className="image-editor">
      <p className="image-editor__label">Photo tools. Only on your computer, never on the published site.</p>
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />
      <div className="image-editor__row">
        <button type="button" className="button button--secondary" onClick={() => fileInput.current?.click()}>
          {entry ? "Replace photo" : "Add photo"}
        </button>
        {entry && (
          <button type="button" className="button button--secondary" onClick={remove}>
            Remove photo
          </button>
        )}
      </div>

      {entry && (
        <details>
          <summary>Edit description and credit</summary>
          <div className="image-editor__fields">
            <label>
              Description (alt text): say what is in the photo
              <textarea rows={2} value={alt} onChange={(event) => setAlt(event.target.value)} />
            </label>
            <label>
              Credit, for example "Photo by Jan Kopřiva on Unsplash"
              <input type="text" value={credit} onChange={(event) => setCredit(event.target.value)} onKeyDown={saveOnEnter} />
            </label>
            <label>
              Link to the photo page
              <input type="url" value={source} onChange={(event) => setSource(event.target.value)} onKeyDown={saveOnEnter} />
            </label>
            <button type="button" className="button button--primary" onClick={saveDetails}>
              Save details
            </button>
          </div>
        </details>
      )}

      <p role="status">{message}</p>
    </div>
  );
}
