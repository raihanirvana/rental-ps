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
