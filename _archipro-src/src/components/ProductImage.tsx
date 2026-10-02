import { BASE } from "../config";
import { images } from "../data/images";
import { ImageEditor } from "./ImageEditor";

interface ProductImageProps {
  slot: string; // key in src/data/images.json. Product photos use the product id
  alt: string; // used until a description is saved with the photo
  shape?: "wide"; // the project photo on the overview. The default is 4:3, for products
}

export function ProductImage({ slot, alt, shape }: ProductImageProps) {
  const entry = images[slot];
  const shapeClass = shape ? ` product-image--${shape}` : "";

  return (
    <div className="product-image-frame">
      {entry ? (
        <img
          className={`product-image${shapeClass}`}
          src={`${BASE}${entry.file}?v=${entry.version}`}
          alt={entry.alt ?? alt}
          width={entry.width}
          height={entry.height}
          loading={shape === "wide" ? "eager" : "lazy"}
        />
      ) : (
        // No photo yet, so there is nothing to describe: the placeholder is hidden from screen readers.
        <div className={`product-image product-image--placeholder${shapeClass}`} aria-hidden="true">
          Photo to come
        </div>
      )}
      {/* Editing tools exist only on the dev server. The published build leaves them out. */}
      {import.meta.env.DEV && <ImageEditor slot={slot} entry={entry} defaultAlt={alt} />}
    </div>
  );
}
