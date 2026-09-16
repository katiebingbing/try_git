# Guest Registration Website

A Partiful-style event page where guests RSVP with just their **name** — no email or phone number required.

## Features

- Event details page (date, time, location, description)
- Yes / Maybe / Can't go RSVP buttons
- Name-only registration form (optional group size for "Yes"/"Maybe")
- Live guest list showing who's coming and who might come
- Data stored server-side in `data/rsvps.json`

## Running locally

```bash
npm install
npm start
```

Then open http://localhost:3000

## Customizing the event

Edit the event title, date, location, and description directly in `public/index.html`.
