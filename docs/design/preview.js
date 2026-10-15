const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
const exampleBookings = {
  andi: { name: 'Andi', unit: 'PS4 A', time: '16.00–17.00 WIB', total: 15000, status: 'Selesai' },
  dimas: { name: 'Dimas', unit: 'PS4 B', time: '17.00–19.00 WIB', total: 30000, status: 'Selesai' },
  raka: {
    name: 'Raka',
    unit: 'PS5 A',
    time: '19.00–21.00 WIB',
    total: 50000,
    status: 'Sedang main',
  },
  naya: { name: 'Naya', unit: 'PS5 B', time: '20.00–22.00 WIB', total: 50000, status: 'Reservasi' },
  block: { name: 'Maintenance', unit: 'PS4 A', time: '20.00–21.30 WIB', status: 'Diblokir' },
};
let selectedMinute = 19 * 60;

function timeLabel(minutes) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const remainder = String(minutes % 60).padStart(2, '0');
  return `${hours}.${remainder}`;
}

function bookingSelection() {
  const unit = document.querySelector('input[name="unit"]:checked');
  const duration = Number(document.querySelector('input[name="duration"]:checked')?.value);
  return { unit: unit?.dataset.name, rate: Number(unit?.dataset.rate), duration };
}

function slotReason(start, duration) {
  if (start + duration > 23 * 60) {
    return 'Tutup';
  }
  if (start < 15 * 60 && start + duration > 13 * 60) {
    return 'Terisi';
  }
  if (start < 18 * 60 && start + duration > 17 * 60) {
    return 'Diblokir';
  }
  return '';
}

function setSummary(key, text) {
  document.querySelectorAll(`[data-summary="${key}"]`).forEach((element) => {
    element.textContent = text;
  });
}

function updateSummary() {
  const { unit, rate, duration } = bookingSelection();
  const date = document.querySelector('#booking-date')?.value;
  const formatted = date
    ? new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(`${date}T12:00:00+07:00`))
    : 'Pilih tanggal';
  setSummary('unit', unit);
  setSummary('date', formatted);
  setSummary('duration', `${duration / 60} jam`);
  setSummary('rate', `${rupiah.format(rate)} / jam`);
  setSummary('total', rupiah.format((rate * duration) / 60));
  const range = `${timeLabel(selectedMinute)}–${timeLabel(selectedMinute + duration)} WIB`;
  setSummary('time', selectedMinute === null ? 'Pilih jam mulai' : range);
  document.querySelector('#continue-booking').disabled = selectedMinute === null || !date;
}

function createSlot(start, duration) {
  const reason = slotReason(start, duration);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `slot${reason === 'Diblokir' ? ' slot--blocked' : ''}`;
  button.disabled = Boolean(reason);
  button.dataset.minute = start;
  button.setAttribute('aria-pressed', String(start === selectedMinute));
  button.setAttribute('aria-label', `${timeLabel(start)} WIB, ${reason || 'tersedia'}`);
  const label = document.createElement('span');
  label.textContent = timeLabel(start);
  button.append(label);
  if (reason) {
    const hint = document.createElement('small');
    hint.textContent = reason;
    button.append(hint);
  }
  return button;
}

function renderSlots() {
  const grid = document.querySelector('#slot-grid');
  const { duration } = bookingSelection();
  if (selectedMinute !== null && slotReason(selectedMinute, duration)) {
    selectedMinute = null;
  }
  const slots = [];
  for (let start = 10 * 60; start < 23 * 60; start += 30) {
    slots.push(createSlot(start, duration));
  }
  grid.replaceChildren(...slots);
  updateSummary();
}

function selectSlot(event) {
  const slot = event.target.closest('[data-minute]');
  if (!slot || slot.disabled) {
    return;
  }
  selectedMinute = Number(slot.dataset.minute);
  document.querySelectorAll('[data-minute]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button === slot));
  });
  updateSummary();
}

function showCustomerFields() {
  document.querySelector('#customer-fields').hidden = false;
  document.querySelector('#customer-title').focus();
  const steps = document.querySelectorAll('.progress-steps li');
  steps[0].removeAttribute('aria-current');
  steps[1].setAttribute('aria-current', 'step');
}

function showConfirmation(event) {
  event.preventDefault();
  document.querySelector('#confirmation-name').textContent = document
    .querySelector('#customer-name')
    .value.trim();
  const steps = document.querySelectorAll('.progress-steps li');
  steps[1].removeAttribute('aria-current');
  steps[2].setAttribute('aria-current', 'step');
  document.querySelector('#confirmation-dialog').showModal();
}

function setupBooking() {
  if (!document.querySelector('#slot-grid')) {
    return;
  }
  const unit = new URLSearchParams(window.location.search).get('unit');
  const matching = [...document.querySelectorAll('[name="unit"]')].find((el) => el.value === unit);
  if (matching) {
    matching.checked = true;
  }
  document.querySelectorAll('[name="unit"], [name="duration"]').forEach((input) => {
    input.addEventListener('change', renderSlots);
  });
  document.querySelector('#booking-date').addEventListener('change', updateSummary);
  document.querySelector('#slot-grid').addEventListener('click', selectSlot);
  document.querySelector('#continue-booking').addEventListener('click', showCustomerFields);
  document.querySelector('#customer-form').addEventListener('submit', showConfirmation);
  renderSlots();
}

function addDetail(list, label, value) {
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  list.append(term, description);
}

function showBookingDetail(key) {
  const booking = exampleBookings[key];
  const dialog = document.querySelector('#detail-dialog');
  const list = dialog.querySelector('#detail-list');
  list.replaceChildren();
  dialog.querySelector('#detail-description').textContent = booking.name;
  addDetail(list, 'Unit', booking.unit);
  addDetail(list, 'Jam', booking.time);
  addDetail(list, 'Status contoh', booking.status);
  if (booking.total) {
    addDetail(list, 'Nilai reservasi', rupiah.format(booking.total));
  }
  dialog.querySelector('#detail-action').hidden = !['raka', 'naya'].includes(key);
  dialog.querySelector('.dialog-notice')?.remove();
  dialog.showModal();
}

function showNotice(element) {
  const dialog = element.closest('dialog');
  let notice = dialog
    ? dialog.querySelector('.dialog-notice')
    : document.querySelector('#preview-note');
  if (!notice && dialog) {
    notice = document.createElement('p');
    notice.className = 'message dialog-notice';
    notice.setAttribute('role', 'status');
    dialog.append(notice);
  }
  if (notice) {
    notice.hidden = false;
    notice.textContent = element.dataset.notice;
  }
}

function setupReferenceActions() {
  document.addEventListener('click', (event) => {
    const close = event.target.closest('[data-close-dialog]');
    const booking = event.target.closest('[data-booking]');
    const notice = event.target.closest('[data-notice]');
    if (close) {
      close.closest('dialog').close();
    }
    if (booking) {
      showBookingDetail(booking.dataset.booking);
    }
    if (notice) {
      event.preventDefault();
      showNotice(notice);
    }
  });
}

function setupAgendaDate() {
  document.querySelector('#agenda-date')?.addEventListener('change', (event) => {
    event.target.value = '2026-10-16';
    showNotice(document.querySelector('[data-notice][type="button"]'));
  });
}

setupBooking();
setupReferenceActions();
setupAgendaDate();
