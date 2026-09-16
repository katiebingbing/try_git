const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'rsvps.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readRsvps() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeRsvps(rsvps) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(rsvps, null, 2));
}

const VALID_RESPONSES = new Set(['yes', 'maybe', 'no']);

app.get('/api/rsvps', (req, res) => {
  const rsvps = readRsvps();
  res.json({
    rsvps,
    counts: {
      yes: rsvps.filter((r) => r.response === 'yes').reduce((sum, r) => sum + r.guestCount, 0),
      maybe: rsvps.filter((r) => r.response === 'maybe').reduce((sum, r) => sum + r.guestCount, 0),
      no: rsvps.filter((r) => r.response === 'no').length,
    },
  });
});

app.post('/api/rsvp', (req, res) => {
  const { name, response, guestCount } = req.body || {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (name.trim().length > 60) {
    return res.status(400).json({ error: 'Name is too long.' });
  }
  if (!VALID_RESPONSES.has(response)) {
    return res.status(400).json({ error: 'Response must be yes, maybe, or no.' });
  }

  const parsedGuestCount = Number.isInteger(guestCount) ? guestCount : 1;
  const safeGuestCount = Math.min(Math.max(parsedGuestCount, 1), 10);

  const rsvps = readRsvps();
  const cleanName = name.trim().slice(0, 60);
  const existingIndex = rsvps.findIndex(
    (r) => r.name.toLowerCase() === cleanName.toLowerCase()
  );

  const entry = {
    name: cleanName,
    response,
    guestCount: response === 'no' ? 1 : safeGuestCount,
    respondedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    rsvps[existingIndex] = entry;
  } else {
    rsvps.push(entry);
  }

  writeRsvps(rsvps);
  res.status(201).json({ ok: true, entry });
});

app.listen(PORT, () => {
  console.log(`Guest registration site running at http://localhost:${PORT}`);
});
