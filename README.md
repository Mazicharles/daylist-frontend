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

The output is in `dist/`, which is ignored by Git. Commit `package-lock.json` so `npm ci` installs reproducible dependencies.

## Vercel deployment (after the backend)

1. First deploy `daylist-backend` using its README and copy the backend's actual production URL.
2. In Vercel, select **Add New → Project** and import `Mazicharles/daylist-frontend`, production branch `main`.
3. Use repository root `./` and framework **Vite**. `vercel.json` specifies install `npm ci`, build `npm run build`, and output `dist`.
4. Add production environment variable `VITE_API_URL` with the actual backend HTTPS origin, e.g. `https://daylist-backend.vercel.app`. Do not include `/api/tasks`. The example domain is not guaranteed to be available; use the URL Vercel assigned to your backend.
5. Deploy and copy the actual frontend production URL. Ensure production is public under **Settings → Deployment Protection** if anyone should be able to open it.
6. In the backend project, set production `CORS_ORIGINS` to this exact frontend origin and redeploy the backend if the origin changed. No frontend rebuild is needed just for a backend CORS change.
7. Open the frontend public URL and test creating, editing, completing, deleting, and dragging tasks into a new order. If you change `VITE_API_URL` later, redeploy the frontend because Vite embeds it at build time.

The UI and task interactions are unchanged. Local development still defaults to port 8000. The Vercel backend uses temporary SQLite for this demo: tasks can reset on cold starts and are not shared across separate serverless instances. No deployment is performed by adding this configuration.
