import { notFound } from "next/navigation";

/** Catch-all so unknown addresses render the branded 404 inside the site layout (header and footer). */
export default function CatchAll() {
  notFound();
}
