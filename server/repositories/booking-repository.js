const insertBookingSql = `
  INSERT INTO bookings (id, workspace_id, unit_id, reference, source, created_by_role,
    starts_at, ends_at, duration_minutes, unit_name, unit_kind, hourly_rate, total_price,
    customer_name, phone, status, cancelled_at, cancelled_by, cancel_reason, completed_at,
    created_at, updated_at)
  VALUES ($id, $workspaceId, $unitId, $reference, $source, $createdByRole,
    $startsAt, $endsAt, $durationMinutes, $unitName, $unitKind, $hourlyRate, $totalPrice,
    $customerName, $phone, $status, $cancelledAt, $cancelledBy, $cancelReason, $completedAt,
    $createdAt, $updatedAt)`;

export function insertBooking(database, booking) {
  database.prepare(insertBookingSql).run(booking);
}

// Hanya interval booking yang memblokir slot; tanpa nama/nomor pelanggan.
const blockingIntervalsSql = `
  SELECT starts_at, ends_at FROM bookings
  WHERE workspace_id = ? AND unit_id = ? AND status <> 'cancelled'
    AND starts_at < ? AND ends_at > ?
  ORDER BY starts_at`;

export function listBlockingBookingIntervals(database, { workspaceId, unitId, from, to }) {
  return database.prepare(blockingIntervalsSql).all(workspaceId, unitId, to, from);
}

const bookingColumns = `
  id, unit_id, reference, source, created_by_role, starts_at, ends_at, duration_minutes,
  unit_name, unit_kind, hourly_rate, total_price, customer_name, phone, status,
  cancelled_at, cancelled_by, cancel_reason, completed_at, created_at, updated_at`;

export function findBooking(database, workspaceId, bookingId) {
  return database
    .prepare(`SELECT ${bookingColumns} FROM bookings WHERE workspace_id = ? AND id = ?`)
    .get(workspaceId, bookingId);
}

export function referenceExists(database, workspaceId, reference) {
  const row = database
    .prepare('SELECT 1 AS found FROM bookings WHERE workspace_id = ? AND reference = ?')
    .get(workspaceId, reference);
  return Boolean(row);
}

// Kategori "booking saya": hanya booking asal pengunjung (bukan seed) di workspace sendiri.
const mineFilters = {
  upcoming: "status = 'confirmed' AND ends_at > $now",
  finished: "(status = 'completed' OR (status = 'confirmed' AND ends_at <= $now))",
  cancelled: "status = 'cancelled'",
};
const mineOrder = {
  upcoming: 'starts_at ASC',
  finished: 'starts_at DESC',
  cancelled: 'starts_at DESC',
};

export function listVisitorBookings(database, { workspaceId, view, now, limit, offset }) {
  const where = `workspace_id = $workspaceId AND source = 'visitor' AND ${mineFilters[view]}`;
  // node:sqlite menolak parameter bernama yang tidak dipakai SQL (filter cancelled tanpa $now).
  const params = mineFilters[view].includes('$now') ? { workspaceId, now } : { workspaceId };
  const total = database.prepare(`SELECT count(*) AS total FROM bookings WHERE ${where}`);
  const rows = database.prepare(
    `SELECT ${bookingColumns} FROM bookings WHERE ${where}
     ORDER BY ${mineOrder[view]}, id LIMIT $limit OFFSET $offset`,
  );
  return { total: total.get(params).total, rows: rows.all({ ...params, limit, offset }) };
}

const cancelSql = `
  UPDATE bookings
  SET status = 'cancelled', cancelled_at = $now, cancelled_by = $role, cancel_reason = $reason,
    updated_at = $now
  WHERE workspace_id = $workspaceId AND id = $bookingId AND status = 'confirmed'`;

export function cancelBookingRow(database, change) {
  return database.prepare(cancelSql).run(change).changes === 1;
}

const insertRequestSql = `
  INSERT INTO booking_requests (workspace_id, idempotency_key, request_hash, booking_id,
    created_at)
  VALUES ($workspaceId, $idempotencyKey, $requestHash, $bookingId, $createdAt)`;

export function findBookingRequest(database, workspaceId, idempotencyKey) {
  return database
    .prepare(
      `SELECT request_hash, booking_id FROM booking_requests
       WHERE workspace_id = ? AND idempotency_key = ?`,
    )
    .get(workspaceId, idempotencyKey);
}

export function insertBookingRequest(database, request) {
  database.prepare(insertRequestSql).run(request);
}
