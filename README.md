# Will You Go On a Date With Me?

An interactive React/Vite mini app with a Three.js heart in the background, multi-step questions, and answer submission to a webhook.

## Structure

```text
date-app/
  .env.example
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  src/
    App.jsx
    main.jsx
    styles.css
    components/
      HeartBackground.jsx
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npm run dev
```

## Backend Without Your Own Server: Formspree

The simplest option is Formspree because you get a URL endpoint, and responses arrive in their dashboard and by email.

1. Open `https://formspree.io/` and create an account.
2. Create a new form.
3. Copy the endpoint, which looks like this:

```text
https://formspree.io/f/abcdwxyz
```

4. Paste the URL into `.env`:

```bash
VITE_WEBHOOK_URL=https://formspree.io/f/abcdwxyz
```

5. Restart the dev server if it is already running.

The app sends a `POST` JSON payload:

```json
{
  "accepted": true,
  "day": "Saturday",
  "time": "20h",
  "food": "Pizza",
  "locationIndex": 1,
  "location": {
    "label": "Surprise 2",
    "lat": 43.8486,
    "lng": 18.3564,
    "mapsUrl": "https://maps.google.com/?q=43.8486,18.3564"
  },
  "timestamp": "2026-05-28T21:00:00.000Z"
}
```

The location is sent to you, but it is not shown on the final screen.

## Replacing Locations

Locations are at the top of `src/App.jsx` in the `LOCATIONS` constant.

Change only `lat`, `lng`, and `mapsUrl`:

```js
const LOCATIONS = [
  {
    label: 'Surprise 1',
    lat: 43.8563,
    lng: 18.4131,
    mapsUrl: 'https://maps.google.com/?q=43.8563,18.4131'
  }
];
```

## Deploy: Vercel

Vercel is the fastest option for a Vite app, and you get a shareable link right away.

1. Create a GitHub repo and push the project:

```bash
git init
git add .
git commit -m "Initial date invite app"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. Open `https://vercel.com/` and choose **Add New Project**.
3. Import the GitHub repo.
4. Vercel will detect Vite. The build command should be:

```bash
npm run build
```

5. Output directory:

```text
dist
```

6. In the Vercel project, open **Settings -> Environment Variables** and add:

```text
VITE_WEBHOOK_URL=https://formspree.io/f/YOUR_FORM_ID
```

7. Click deploy. After deployment, you will get a URL you can share.

## Build Check

```bash
npm run build
```
