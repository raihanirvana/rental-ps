const steps = [
  ['schedule', 'Jadwal'],
  ['details', 'Data diri'],
  ['done', 'Konfirmasi'],
];

export function BookingSteps({ step }) {
  return (
    <ol className="progress-steps" aria-label="Langkah booking">
      {steps.map(([id, label], index) => (
        <li key={id} aria-current={id === step ? 'step' : undefined}>
          <b aria-hidden="true">{index + 1}</b>
          {label}
        </li>
      ))}
    </ol>
  );
}
