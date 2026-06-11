# Supabase Setup

## 1. Create the project

Create a Supabase project and open:

- `Project Settings` -> `API`
- copy your:
  - `Project URL`
  - `anon public key`

Paste them into:

- [supabase-config.js](C:/Users/comfo/Documents/Codex/2026-06-05/create-meal-planner-and-shopping-list/outputs/meal-planner-app/supabase-config.js)

Example:

```js
window.SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
window.SUPABASE_KEY = "YOUR-ANON-KEY";
```

## 2. Create the planner table

Open Supabase SQL Editor and run:

- [supabase-schema.sql](C:/Users/comfo/Documents/Codex/2026-06-05/create-meal-planner-and-shopping-list/outputs/meal-planner-app/supabase-schema.sql)

This creates:

- `meal_planner_states`

The app saves each signed-in user's planner data into that table.

## 3. Turn on email auth

Open:

- `Authentication` -> `Providers` -> `Email`

Enable Email provider.

## 4. Add your site URLs

Open:

- `Authentication` -> `URL Configuration`

Set:

- `Site URL`: your deployed app URL
- `Redirect URLs`:
  - `https://your-site/login.html`
  - `https://your-site/index.html`

If you test locally with a local server, also add:

- `http://127.0.0.1:5500/login.html`
- `http://127.0.0.1:5500/index.html`

Use your actual local port if different.

## 5. Important

Supabase auth should not be used from a `file:///` URL.

Use one of these instead:

- a local dev server
- Netlify
- Vercel
- GitHub Pages

## 6. Files added for auth

- [login.html](C:/Users/comfo/Documents/Codex/2026-06-05/create-meal-planner-and-shopping-list/outputs/meal-planner-app/login.html)
- [login.js](C:/Users/comfo/Documents/Codex/2026-06-05/create-meal-planner-and-shopping-list/outputs/meal-planner-app/login.js)
- [auth.js](C:/Users/comfo/Documents/Codex/2026-06-05/create-meal-planner-and-shopping-list/outputs/meal-planner-app/auth.js)

## 7. Deploying the app

Supabase handles:

- authentication
- database

Your frontend should still be deployed separately.

Common choices:

- Netlify
- Vercel
- GitHub Pages

After deployment, paste the deployed URL into Supabase URL Configuration.
