import { images } from "../data/images";
import { LineText } from "./Blocks";
import { isUsageNotice } from "./content";
import type { Section } from "./content";

// Notes from content.md, with one credit per photo taken from src/data/images.json
// (the credits typed into the photo tool).
export function Credits({ section }: { section: Section }) {
  const photos = Object.values(images);
  // The usage notice is shown in the footer instead.
  const notes = section.blocks
    .flatMap((block) => (block.kind === "ul" ? block.items : []))
    .filter((note) => !isUsageNotice(note));

  return (
    <ul>
      {notes.map((note) => {
        if (note.label !== "Images") {
          return (
            <li key={note.text}>
              <LineText line={note} />
            </li>
          );
        }
        // The images line only makes sense once there are photos.
        if (photos.length === 0) return null;
        return (
          <li key={note.text}>
            <LineText line={note} />
            <ul>
              {photos.map((photo) => (
                <li key={photo.file}>
                  {photo.source ? <a href={photo.source}>{photo.credit ?? photo.source}</a> : (photo.credit ?? "Credit to add")}
                  {photo.alt ? ` (${photo.alt})` : ""}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
