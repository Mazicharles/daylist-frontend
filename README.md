# Daylist frontend

The existing Daylist React/Vite interface, prepared as a standalone `daylist-frontend` repository. Create, edit, complete, delete, filter, and reorder tasks by dragging or using arrow buttons. The matching FastAPI service lives in `daylist-backend`.

## Install and run

Install Node.js 22 or newer and npm. From this repository folder:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead. Start the backend separately on port 8000, then open http://127.0.0.1:5173.

## API configuration

Set `VITE_API_URL` in `.env` to the backend origin, for example `http://127.0.0.1:8000`. Do not include `/api/tasks`; the app appends that path. A trailing slash is supported. When unset, the app defaults to `http://127.0.0.1:8000` for local development.

Requests go directly to that backend, so configure its `CORS_ORIGINS` to include the frontend origin. Restart Vite after changing `.env`. Vite embeds environment variables into the public build; never place secrets in them. Rebuild when changing the API URL for a future hosting environment.

## Verify the production build

```powershell
npm run build
```

The output is in `dist/`, which is ignored by Git. No deployment is configured or required. Commit `package-lock.json` so `npm ci` installs reproducible dependencies.
