import sharp from "sharp";
import { getPhoto } from "@/lib/careers/pms";

// Vacancy photos live in PMS behind the site key; the site serves only photos of published vacancies,
// resized to web size, so the key never reaches the browser.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getPhoto(id);
  if (!r) return new Response("Not found", { status: 404 });
  const img = await sharp(Buffer.from(await r.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return new Response(new Uint8Array(img), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=3600" },
  });
}
