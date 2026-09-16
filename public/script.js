const rsvpButtons = document.querySelectorAll('.rsvp-btn');
const form = document.getElementById('rsvp-form');
const nameInput = document.getElementById('name-input');
const guestCountField = document.getElementById('guest-count-field');
const guestCountInput = document.getElementById('guest-count-input');
const cancelBtn = document.getElementById('cancel-btn');
const formError = document.getElementById('form-error');
const goingList = document.getElementById('going-list');
const maybeList = document.getElementById('maybe-list');
const goingCount = document.getElementById('going-count');
const maybeCount = document.getElementById('maybe-count');

let selectedResponse = null;

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function showForm(response) {
  selectedResponse = response;
  rsvpButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.response === response);
  });
  form.classList.remove('hidden');
  guestCountField.classList.toggle('hidden', response === 'no');
  formError.classList.add('hidden');
  nameInput.focus();

  const savedName = localStorage.getItem('rsvpName');
  if (savedName) nameInput.value = savedName;
}

function hideForm() {
  form.classList.add('hidden');
  rsvpButtons.forEach((btn) => btn.classList.remove('selected'));
  selectedResponse = null;
}

rsvpButtons.forEach((btn) => {
  btn.addEventListener('click', () => showForm(btn.dataset.response));
});

cancelBtn.addEventListener('click', hideForm);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.add('hidden');

  const name = nameInput.value.trim();
  if (!name) {
    formError.textContent = 'Please enter your name.';
    formError.classList.remove('hidden');
    return;
  }

  const guestCount = selectedResponse === 'no' ? 1 : parseInt(guestCountInput.value, 10) || 1;

  try {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, response: selectedResponse, guestCount }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    localStorage.setItem('rsvpName', name);
    hideForm();
    await loadGuests();
  } catch (err) {
    formError.textContent = err.message;
    formError.classList.remove('hidden');
  }
});

function renderList(container, entries, totalCountEl, totalCount) {
  container.innerHTML = '';
  totalCountEl.textContent = `(${totalCount})`;

  if (entries.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = 'No one yet — be the first!';
    container.appendChild(li);
    return;
  }

  entries.forEach((entry) => {
    const li = document.createElement('li');

    const avatar = document.createElement('span');
    avatar.className = 'guest-avatar';
    avatar.textContent = initials(entry.name);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = entry.name;

    li.appendChild(avatar);
    li.appendChild(nameSpan);

    if (entry.guestCount > 1) {
      const plus = document.createElement('span');
      plus.className = 'guest-plus';
      plus.textContent = `+${entry.guestCount - 1}`;
      li.appendChild(plus);
    }

    container.appendChild(li);
  });
}

async function loadGuests() {
  try {
    const res = await fetch('/api/rsvps');
    const data = await res.json();

    const going = data.rsvps.filter((r) => r.response === 'yes');
    const maybe = data.rsvps.filter((r) => r.response === 'maybe');

    renderList(goingList, going, goingCount, data.counts.yes);
    renderList(maybeList, maybe, maybeCount, data.counts.maybe);
  } catch (err) {
    console.error('Failed to load guests', err);
  }
}

loadGuests();
