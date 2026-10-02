// Dev-only helper behind the "Add photo" buttons in the prototype.
// It saves an uploaded photo into public/images and records it in src/data/images.json.
// It only runs with `npm run dev`. Nothing here is part of the published site.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const MANIFEST = path.join(ROOT, "src/data/images.json");
const SLOT = /^[a-z0-9-]+$/; // also keeps the file name inside public/images
const EXTENSION = { "image/webp": "webp", "image/jpeg": "jpg" };
const MAX_BYTES = 8 * 1024 * 1024;

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error("The photo is larger than 8 MB after resizing.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function deleteFile(entry) {
  if (entry?.file) await fs.rm(path.join(PUBLIC, entry.file), { force: true });
}

export function imageEditor() {
  return {
    name: "archipro-image-editor",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__image-editor", async (req, res) => {
        const reply = (status, body) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };

        try {
          const url = new URL(req.url, "http://localhost");
          const slot = url.pathname.slice(1);
          if (!SLOT.test(slot)) return reply(400, { error: "Unknown image slot." });

          const manifest = await readManifest();

          if (req.method === "PUT") {
            const extension = EXTENSION[req.headers["content-type"]];
            if (!extension) return reply(415, { error: "Only WebP and JPEG are saved." });
            const body = await readBody(req);
            await fs.mkdir(path.join(PUBLIC, "images"), { recursive: true });
            await deleteFile(manifest[slot]);
            const file = `images/${slot}.${extension}`;
            await fs.writeFile(path.join(PUBLIC, file), body);
            manifest[slot] = {
              ...manifest[slot],
              file,
              width: Number(url.searchParams.get("width")),
              height: Number(url.searchParams.get("height")),
              version: Date.now(),
            };
          } else if (req.method === "PATCH") {
            if (!manifest[slot]) return reply(404, { error: "Add a photo first." });
            const details = JSON.parse((await readBody(req)).toString("utf8"));
            for (const field of ["alt", "credit", "source"]) {
              const value = typeof details[field] === "string" ? details[field].trim() : "";
              if (value) manifest[slot][field] = value;
              else delete manifest[slot][field];
            }
          } else if (req.method === "DELETE") {
            await deleteFile(manifest[slot]);
            delete manifest[slot];
          } else {
            return reply(405, { error: "Method not allowed." });
          }

          await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
          reply(200, manifest[slot] ?? null);
        } catch (error) {
          reply(500, { error: error instanceof Error ? error.message : "Something went wrong." });
        }
      });
    },
  };
}
