import { useCallback, useMemo, useState } from 'react';

const defaultDuration = 120;

function initialChoice(catalog, preferredKind) {
  const active = catalog.units.filter((unit) => unit.isActive);
  const preferred = active.find((unit) => unit.kind === preferredKind);
  return {
    unitId: (preferred ?? active[0])?.id ?? null,
    date: catalog.bookableDates.from,
    durationMinutes: defaultDuration,
    startTime: null,
  };
}

// Mengganti unit, tanggal atau durasi selalu melepas jam yang dipilih sebelumnya.
export function useBookingSelection(catalog, preferredKind) {
  const [choice, setChoice] = useState(() => initialChoice(catalog, preferredKind));
  const change = useCallback((patch) => {
    setChoice((current) => ({ ...current, startTime: null, ...patch }));
  }, []);
  const actions = useMemo(
    () => ({
      setUnit: (unitId) => change({ unitId }),
      setDate: (date) => change({ date }),
      setDuration: (durationMinutes) => change({ durationMinutes }),
      setStartTime: (startTime) => change({ startTime }),
      clearStartTime: () => change({}),
    }),
    [change],
  );
  return { choice, ...actions };
}
