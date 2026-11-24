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
- **Stats counters, How we work (steps), FAQs** (general or tied to a service), **Blog**.
- **Hero slides, client logos, testimonials, events gallery** (three carousels), **media library**.
- **Enquiries:** every quote or contact request, with status tracking.

## Public pages
Home, About, Services (+ one page per service), Projects (by category, or all with filters), project pages,
Blog (shown in the menu once there is a published article), Events gallery, Contact, and
Schedule an Appointment (`/quote`, the project brief form).

## Blog
The blog lives at `/blog` (the old `/insights` address redirects there). Write articles under **Blog articles** in the admin: categories are comma separated (e.g. `Article, Construction`), and the body supports `## Heading`, `### Sub-heading`, `- bullets`, `1. numbered lists`, `**bold**` and `[links](https://example.com)`. Readers can search, filter by category or month, and share each article. `npm run seed:blog` adds three starter articles to a database that has none (edit or unpublish them as you like).

## WhatsApp chat
The green button (bottom right) opens a chat card with a greeting and an **Open chat** button that starts a WhatsApp conversation with a prefilled message, including the page the visitor was on. It opens by itself once, a few seconds into a visitor's first page view. The number, texts and delay are under **Site content > WhatsApp chat** (the number is "WhatsApp number" under Brand & contact).

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

## Deploy to Coolify
The repo has a `Dockerfile`, so Coolify builds it as is (no extra config files).

1. **Push the code** to GitHub or GitLab and merge `feature/revamp` into your main branch.
2. **Database:** in Coolify, *New resource > PostgreSQL*. Start it and copy its **internal** connection URL.
3. **App:** *New resource > Application* from your repo. Build pack **Dockerfile**, port **3000**, domain `https://ethosmatrix.com` (point the domain's A record at the server first; Coolify issues the HTTPS certificate).
4. **Environment variables** (Application > Environment):
   - `DATABASE_URL` the internal URL from step 2
   - `SESSION_SECRET` a long random string (`openssl rand -hex 32`)
   - `SITE_URL` `https://ethosmatrix.com`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` your real admin login (10+ characters)
   - optional: `SMTP_URL`, `MAIL_TO`, `MAIL_FROM` for enquiry emails
5. **Persistent storage** (Application > Persistent Storage): add a bind mount, host path `/data/ethosmatrix/uploads`, container path `/app/uploads`. Without it, uploaded images disappear on every deploy.
6. **Deploy.** The tables are created automatically on the first request.
7. **Copy your content** (skip if you want to start from the original site's content with `npm run seed` instead):
   - Export locally, leaving out the dev login and test enquiries:
     `docker exec ethosmatrix-db-1 pg_dump -U ethos -d ethosmatrix --data-only --exclude-table-data=users --exclude-table-data=appointments > ethos-data.sql`
   - Import: open the app once so the tables exist, then run the file against the Coolify database (Database > "Make it publicly available" temporarily and use `psql`, or copy the file to the server and use `docker exec -i <db container> psql -U <user> -d <db> < ethos-data.sql`).
   - Upload the images: copy the local `uploads/` folder into `/data/ethosmatrix/uploads` on the server (`scp -r uploads/* user@server:/data/ethosmatrix/uploads/`).
8. **Create the admin login:** Application > Terminal, run `npm run admin`. Then sign in at `/admin/login`.
9. Turn off "publicly available" on the database again if you enabled it.

Redeploys keep the database and the uploads folder; only the code changes.

