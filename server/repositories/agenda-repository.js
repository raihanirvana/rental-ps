// Semua query dibatasi workspace; filter unit/status opsional memakai parameter terikat.
const bookingColumns = `
  id, unit_id, reference, source, created_by_role, starts_at, ends_at, duration_minutes,
  unit_name, unit_kind, hourly_rate, total_price, customer_name, phone, status,
  cancelled_at, cancelled_by, cancel_reason, completed_at, created_at, updated_at`;

const agendaBookingsSql = `
  SELECT ${bookingColumns} FROM bookings
  WHERE workspace_id = $workspaceId AND starts_at >= $from AND starts_at < $to
    AND ($unitId IS NULL OR unit_id = $unitId)
    AND ($status IS NULL OR status = $status)
  ORDER BY starts_at, unit_name, id`;

const agendaBlocksSql = `
  SELECT id, unit_id, source, starts_at, ends_at, note FROM unit_blocks
  WHERE workspace_id = $workspaceId AND starts_at >= $from AND starts_at < $to
    AND ($unitId IS NULL OR unit_id = $unitId)
  ORDER BY starts_at, id`;

export function listAgendaBookings(database, filter) {
  const { workspaceId, from, to, unitId, status } = filter;
  return database.prepare(agendaBookingsSql).all({ workspaceId, from, to, unitId, status });
}

export function listAgendaBlocks(database, { workspaceId, from, to, unitId }) {
  return database.prepare(agendaBlocksSql).all({ workspaceId, from, to, unitId });
}

const completeSql = `
  UPDATE bookings SET status = 'completed', completed_at = $now, updated_at = $now
  WHERE workspace_id = $workspaceId AND id = $bookingId AND status = 'confirmed'
    AND ends_at <= $now`;

// Guard di WHERE: hanya confirmed yang sudah berakhir yang berubah.
export function completeBookingRow(database, change) {
  return database.prepare(completeSql).run(change).changes === 1;
}
