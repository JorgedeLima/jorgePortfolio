import { images } from "../data/images";
import { LineText } from "./Blocks";
import { isUsageNotice } from "./content";
import type { Section } from "./content";

// Notes from content.md, with one credit per photo taken from src/data/images.json
// (the credits typed into the photo tool).
export function Credits({ section }: { section: Section }) {
  // Only photos with a credit typed in are listed.
  const photos = Object.values(images).filter((photo) => photo.credit);
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
        // The images line only makes sense once there are credited photos.
        if (photos.length === 0) return null;
        return (
          <li key={note.text}>
            <LineText line={note} />
            <ul>
              {photos.map((photo) => (
                <li key={photo.file}>
                  {photo.source ? <a href={photo.source}>{photo.credit}</a> : photo.credit}
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
