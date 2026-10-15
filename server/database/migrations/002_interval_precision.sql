-- Unixepoch memotong pecahan detik; constraint durasi lama belum menolak akhir .500Z.
-- Tambahkan guard tanpa mengubah checksum migrasi awal yang sudah diterapkan.
CREATE TRIGGER bookings_end_on_grid
BEFORE INSERT ON bookings
WHEN strftime('%M:%f', NEW.ends_at) NOT IN ('00:00.000', '30:00.000')
BEGIN
  SELECT RAISE(ABORT, 'INVALID_INTERVAL_PRECISION');
END;

CREATE TRIGGER unit_blocks_end_on_grid
BEFORE INSERT ON unit_blocks
WHEN strftime('%M:%f', NEW.ends_at) NOT IN ('00:00.000', '30:00.000')
BEGIN
  SELECT RAISE(ABORT, 'INVALID_INTERVAL_PRECISION');
END;

-- Reservasi non-cancelled tidak boleh menyimpan timestamp pembatalan parsial.
CREATE TRIGGER bookings_cancel_fields_insert
BEFORE INSERT ON bookings
WHEN NEW.status <> 'cancelled' AND NEW.cancelled_at IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'INVALID_CANCELLATION_FIELDS');
END;

CREATE TRIGGER bookings_cancel_fields_update
BEFORE UPDATE OF status, cancelled_at ON bookings
WHEN NEW.status <> 'cancelled' AND NEW.cancelled_at IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'INVALID_CANCELLATION_FIELDS');
END;
