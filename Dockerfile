# Production image for Coolify (or any Docker host).
# Needs at runtime: DATABASE_URL, SESSION_SECRET, SITE_URL (see README, "Deploy to Coolify").
# Mount a persistent volume at /app/uploads, otherwise uploaded images are lost on every deploy.
FROM node:22-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev && mkdir -p uploads

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
