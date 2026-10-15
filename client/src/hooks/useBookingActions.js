import { buildBookingPayload } from './useBookingFlow.js';

// Pilihan baru menghapus pesan konflik sebelumnya.
function pickers({ selection, schedule }) {
  const withClearedMessage = (action) => (value) => {
    schedule.setMessage(null);
    action(value);
  };
  return {
    pickUnit: withClearedMessage(selection.setUnit),
    pickDate: withClearedMessage(selection.setDate),
    pickDuration: withClearedMessage(selection.setDuration),
    pickSlot: withClearedMessage(selection.setStartTime),
  };
}

// Error isian di browser: fokus ke field invalid pertama, request tidak dikirim.
function submitBooking(flow, event) {
  event.preventDefault();
  if (!flow.slot || flow.submission.submitting) {
    return;
  }
  const firstInvalid = Object.keys(flow.customer.validate())[0];
  if (firstInvalid) {
    document.getElementById(`booking-${firstInvalid}`)?.focus();
    return;
  }
  flow.submission.submit(buildBookingPayload(flow));
}

function startOver(flow) {
  flow.submission.reset();
  flow.customer.clear();
  flow.selection.clearStartTime();
  flow.availability.reload();
  flow.setStep('schedule');
}

export function useBookingActions(flow) {
  return {
    ...pickers(flow),
    continueToDetails: () => flow.slot && flow.setStep('details'),
    submitBooking: (event) => submitBooking(flow, event),
    startOver: () => startOver(flow),
  };
}
