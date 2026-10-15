import { useCallback, useState } from 'react';
import { isDateInRange, selectedSlot } from '../lib/booking-selection.js';
import { customerPayload } from '../lib/customer-form.js';
import { useAvailability } from './useAvailability.js';
import { useBookingSelection } from './useBookingSelection.js';
import { useBookingSubmit } from './useBookingSubmit.js';
import { useCustomerDetails } from './useCustomerDetails.js';

// Konflik jadwal dari server: kembali ke langkah jadwal, segarkan slot, pertahankan isian.
function useScheduleRecovery(selection, availability, setStep) {
  const [message, setMessage] = useState(null);
  const { clearStartTime } = selection;
  const { reload } = availability;
  const recover = useCallback(
    (error) => {
      setMessage(error.message);
      clearStartTime();
      reload();
      setStep('schedule');
    },
    [clearStartTime, reload, setStep],
  );
  return { message, setMessage, recover };
}

function useScheduleData(catalog, preferredKind) {
  const selection = useBookingSelection(catalog, preferredKind);
  const { choice } = selection;
  const dateValid = isDateInRange(choice.date, catalog.bookableDates);
  const availability = useAvailability(choice, Boolean(choice.unitId) && dateValid);
  const slot = selectedSlot(availability, choice.startTime);
  const original = catalog.units.find((item) => item.id === choice.unitId) ?? null;
  const unit = availability.status === 'ready' ? availability.data.unit : original;
  catalog = {
    ...catalog,
    units: catalog.units.map((item) => (item.id === unit?.id ? unit : item)),
  };
  return { catalog, selection, choice, dateValid, availability, slot, unit };
}

export function useBookingFlow(catalog, preferredKind) {
  const data = useScheduleData(catalog, preferredKind);
  const [step, setStep] = useState('schedule');
  const schedule = useScheduleRecovery(data.selection, data.availability, setStep);
  const submission = useBookingSubmit(schedule.recover);
  const customer = useCustomerDetails();
  return { ...data, step, setStep, schedule, submission, customer };
}

export function buildBookingPayload(flow) {
  const { unitId, date, startTime, durationMinutes } = flow.choice;
  const quoteId = flow.availability.data.quote.id;
  return {
    unitId,
    date,
    startTime,
    durationMinutes,
    quoteId,
    ...customerPayload(flow.customer.values),
  };
}
