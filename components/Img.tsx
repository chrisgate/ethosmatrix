import Image from "next/image";

/** Fills its (relative, sized) parent. Files are served from the CMS media route. */
export function Img({
  file, alt, className = "", sizes = "100vw", priority = false,
}: {
  file: string; alt: string; className?: string; sizes?: string; priority?: boolean;
}) {
  return (
    <Image
      src={`/media/${file}`}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
