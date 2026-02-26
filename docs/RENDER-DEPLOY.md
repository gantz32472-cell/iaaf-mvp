# Render Deploy Guide (MVP)

## Quick start (recommended for demo)

This project can be deployed to Render as a regular Node web service.
For the fastest setup, keep `ENABLE_MOCK_MODE=true` first.

## 1. Push repository

- Push this repo to GitHub (private/public both OK)

## 2. Create service on Render

Option A (Blueprint)
- In Render, choose `New +` -> `Blueprint`
- Select this repository
- Render reads `render.yaml` and creates the web service

Option B (Manual Web Service)
- Runtime: `Node`
- Build Command: `npm ci && npm run prisma:generate && npm run build`
- Start Command: `npm run start`
- Health Check Path: `/api/health`

## 3. Set environment variables

Minimum for MVP demo:
- `APP_BASE_URL=https://<your-render-domain>`
- `ENABLE_MOCK_MODE=true`
- `SESSION_SECRET=<long-random-string>` (if `ENABLE_AUTH=true` later)

Recommended initial values:
- `ENABLE_AUTH=false`
- `ENABLE_REAL_INSTAGRAM_PUBLISH=false`
- `ENABLE_REAL_INSTAGRAM_DM=false`

## 4. Verify deploy

- Open `/api/health` and confirm `200`
- Open `/` dashboard page

## Important limitations in mock mode

- Data is stored in local files (`data/mock-db.json`), so it may reset on redeploy/restart
- Generated carousel SVG files are written to local `public/generated/...` and are not durable

## Switch to Postgres later (recommended for stable use)

1. Create Render PostgreSQL
2. Set `DATABASE_URL`
3. Set `ENABLE_MOCK_MODE=false`
4. Run migrations (one-time)
   - `npm run prisma:migrate`

If you want, we can next patch the app for Render production mode:
- move generated files to object storage (S3/Cloudinary)
- ensure cron/auth paths are compatible
- make Prisma migration run in Render deploy flow