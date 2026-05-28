# Will You Go On a Date With Me?

Interaktivna React/Vite mini-aplikacija sa Three.js srcem u pozadini, pitanjima kroz više koraka i slanjem odgovora na webhook.

## Struktura

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

## Lokalni setup

1. Instaliraj dependencies:

```bash
npm install
```

2. Napravi lokalni env fajl:

```bash
cp .env.example .env
```

3. Pokreni aplikaciju:

```bash
npm run dev
```

## Backend bez vlastitog servera: Formspree

Najjednostavnija opcija je Formspree jer dobiješ URL endpoint i odgovori stižu u njihov dashboard i na email.

1. Otvori `https://formspree.io/` i napravi account.
2. Kreiraj novi form.
3. Kopiraj endpoint koji izgleda ovako:

```text
https://formspree.io/f/abcdwxyz
```

4. U `.env` zalijepi URL:

```bash
VITE_WEBHOOK_URL=https://formspree.io/f/abcdwxyz
```

5. Restartuj dev server ako je već pokrenut.

Aplikacija šalje `POST` JSON payload:

```json
{
  "accepted": true,
  "day": "Subota",
  "time": "20h",
  "food": "Pizza",
  "locationIndex": 1,
  "location": {
    "label": "Iznenađenje 2",
    "lat": 43.8486,
    "lng": 18.3564,
    "mapsUrl": "https://maps.google.com/?q=43.8486,18.3564"
  },
  "timestamp": "2026-05-28T21:00:00.000Z"
}
```

Lokacija se šalje tebi, ali se ne prikazuje na završnom ekranu.

## Zamjena lokacija

Lokacije su na vrhu `src/App.jsx` u konstanti `LOCATIONS`.

Promijeni samo `lat`, `lng` i `mapsUrl`:

```js
const LOCATIONS = [
  {
    label: 'Iznenađenje 1',
    lat: 43.8563,
    lng: 18.4131,
    mapsUrl: 'https://maps.google.com/?q=43.8563,18.4131'
  }
];
```

## Deploy: Vercel

Vercel je najbrža opcija za Vite aplikaciju i odmah dobiješ jedan link.

1. Napravi GitHub repo i pushuj projekat:

```bash
git init
git add .
git commit -m "Initial date invite app"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. Otvori `https://vercel.com/` i izaberi **Add New Project**.
3. Importuj GitHub repo.
4. Vercel će prepoznati Vite. Build komanda treba biti:

```bash
npm run build
```

5. Output directory:

```text
dist
```

6. U Vercel projektu otvori **Settings → Environment Variables** i dodaj:

```text
VITE_WEBHOOK_URL=https://formspree.io/f/YOUR_FORM_ID
```

7. Klikni deploy. Nakon deploya dobiješ URL koji možeš podijeliti.

## Build provjera

```bash
npm run build
```
