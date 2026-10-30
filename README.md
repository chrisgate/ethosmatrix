# Ethos Matrix website

Next.js (App Router) + PostgreSQL, with a built-in admin panel at `/admin`. No CMS package.

## Run locally
```bash
docker compose up -d        # PostgreSQL on localhost:5433
npm install
npm run seed                # tables, admin user, content + images from the old site
npm run dev                 # http://localhost:3000  (admin: /admin)
```
Dev admin login comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local`. **Change both before going live**, then re-run `npm run seed` to update the password.

## Editing content
Everything is editable in `/admin`: site content (hero, about, leadership message, contact details),
projects, services, gallery, testimonials, media library, and appointment requests. Images are
uploaded from any form and stored in `uploads/` (metadata in PostgreSQL).

## Production
- Set `DATABASE_URL`, `SESSION_SECRET` (long random string), `SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Host on a Node server/VPS with a **persistent `uploads/` folder** (or mount a volume). Serverless hosts without a disk need an object-storage upload adapter.
- `npm run build && npm start`.
