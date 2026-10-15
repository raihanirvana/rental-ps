import { useBookingActions } from '../../hooks/useBookingActions.js';
import { BookingConfirmation } from './BookingConfirmation.jsx';
import { BookingSummary } from './BookingSummary.jsx';
import { CustomerForm } from './CustomerForm.jsx';
import { DateField } from './DateField.jsx';
import { DurationPicker } from './DurationPicker.jsx';
import { SlotSection } from './SlotSection.jsx';
import { UnitPicker } from './UnitPicker.jsx';

function ScheduleFields({ flow, actions }) {
  const { catalog, choice } = flow;
  return (
    <div className="field-row">
      <DateField
        value={choice.date}
        range={catalog.bookableDates}
        valid={flow.dateValid}
        onChange={actions.pickDate}
      />
      <DurationPicker
        durations={catalog.rules.durationsMinutes}
        value={choice.durationMinutes}
        onChange={actions.pickDuration}
      />
    </div>
  );
}

// Pilihan jadwal dikunci selama booking disimpan agar tidak berubah di tengah request.
function SchedulePanel({ flow, actions }) {
  return (
    <section className="booking-panel" aria-label="Pilihan jadwal">
      <fieldset className="fieldset-plain" disabled={flow.submission.submitting}>
        <UnitPicker
          units={flow.catalog.units}
          value={flow.choice.unitId}
          onChange={actions.pickUnit}
        />
        <ScheduleFields flow={flow} actions={actions} />
        <SlotSection flow={flow} onPick={actions.pickSlot} />
      </fieldset>
      {flow.step === 'details' ? (
        <CustomerForm flow={flow} onSubmit={actions.submitBooking} />
      ) : null}
    </section>
  );
}

export function BookingWorkspace({ flow }) {
  const actions = useBookingActions(flow);
  const { submission, availability } = flow;
  if (submission.status === 'done') {
    const quoteTotal = availability.status === 'ready' ? availability.data.quote.total : null;
    return (
      <BookingConfirmation
        result={submission.result}
        quoteTotal={quoteTotal}
        onNewBooking={actions.startOver}
      />
    );
  }
  return (
    <div className="booking-layout">
      <SchedulePanel flow={flow} actions={actions} />
      <BookingSummary flow={flow} onContinue={actions.continueToDetails} />
    </div>
  );
}
