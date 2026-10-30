# Ethos Matrix website

Next.js (App Router) + PostgreSQL, with a built-in admin panel at `/admin`. No CMS package.

## Run locally
```bash
docker compose up -d        # PostgreSQL on localhost:5433
npm install
cp .env.example .env.local  # then fill in SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                # tables, admin user, content + images from the old site
npm run dev                 # http://localhost:3000  (admin: /admin)
```
`npm run seed:reset` wipes site content and reloads it. Change the admin credentials before going live
(set new values in `.env.local`, then run `npm run seed:reset` or update the user in the database).

Already seeded before the revamp? Run `npm run migrate:revamp` to add the new starter content
(service pages, stats, steps, FAQs, project facts). It never overwrites your edits.

## What's editable in /admin
- **Site content:** brand and contact details, home page text, leadership message, About page, quote page options, page banners.
- **Projects:** categories, facts (client, location, year, size, status), description, scope, video link, before/after photos, gallery.
- **Services:** card text and hover image, plus the service page (introduction, what's included, related projects).
- **Stats counters, How we work (steps), FAQs** (general or tied to a service), **Insights (blog)**.
- **Hero slides, client logos, testimonials, events gallery** (three carousels), **media library**.
- **Enquiries:** every quote or contact request, with status tracking.

## Public pages
Home, About, Services (+ one page per service), Projects (by category, or all with filters), project pages,
Insights (shown in the menu once there is a published article), Events gallery, Contact, and
Schedule an Appointment (`/quote`, the project brief form).

## Email notifications (optional)
Set `SMTP_URL`, `MAIL_TO` and optionally `MAIL_FROM` in `.env.local` and the team is emailed for every
enquiry. Without them, enquiries are still saved and visible in /admin.

## Images
Uploads are resized (max 2400px wide) and stored as WebP in `uploads/`. `npm run optimize` recompresses
existing files. `npm run measure` records each photo's dimensions (used by the gallery layout; run automatically by the seed and the optimizer).

## Checks
`npm run audit` crawls the running site and reports missing titles, descriptions, headings, alt text and broken internal links.
`npm run icons` rebuilds the favicon, touch icons and social-sharing image from the logo and first hero slide (run it after changing either).

## Production
- Set `DATABASE_URL`, `SESSION_SECRET` (long random string), `SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Host on a Node server/VPS with a **persistent `uploads/` folder** (or mount a volume). Serverless hosts without a disk need an object-storage upload adapter.
- `npm run build && npm start`. To build without disturbing a running dev server: `NEXT_DIST_DIR=.next-build npx next build`.
