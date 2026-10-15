-- Skema awal Sesi Play. Waktu disimpan sebagai ISO UTC dari Date#toISOString()
-- (contoh 2026-10-15T12:00:00.000Z) sehingga perbandingan string sama dengan urutan waktu.
-- Rupiah selalu integer. Zona bisnis WIB (+07:00, tanpa DST) dipakai pada CHECK jadwal.
-- Relasi anak memakai FK komposit (workspace_id, id) agar tidak bisa menyilang workspace.

CREATE TABLE workspaces (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  data_version INTEGER NOT NULL DEFAULT 1 CHECK (data_version >= 1),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  expires_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', expires_at) IS expires_at),
  seeded_at TEXT CHECK (
    seeded_at IS NULL OR strftime('%Y-%m-%dT%H:%M:%fZ', seeded_at) IS seeded_at
  ),
  CHECK (expires_at > created_at)
) STRICT;

CREATE INDEX workspaces_expires_idx ON workspaces (expires_at);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  role TEXT NOT NULL CHECK (role IN ('customer', 'owner')),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  expires_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', expires_at) IS expires_at),
  revoked_at TEXT CHECK (
    revoked_at IS NULL OR strftime('%Y-%m-%dT%H:%M:%fZ', revoked_at) IS revoked_at
  ),
  CHECK (expires_at > created_at)
) STRICT;

CREATE INDEX sessions_workspace_idx ON sessions (workspace_id);
CREATE INDEX sessions_expires_idx ON sessions (expires_at);

CREATE TABLE business_settings (
  workspace_id TEXT PRIMARY KEY REFERENCES workspaces (id) ON DELETE CASCADE,
  business_name TEXT NOT NULL CHECK (length(trim(business_name)) BETWEEN 2 AND 60),
  address TEXT NOT NULL CHECK (length(trim(address)) BETWEEN 2 AND 150),
  contact_note TEXT NOT NULL DEFAULT '' CHECK (length(contact_note) <= 200),
  updated_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) IS updated_at)
) STRICT;

CREATE TABLE units (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  seed_key TEXT CHECK (seed_key IS NULL OR length(seed_key) BETWEEN 1 AND 30),
  name TEXT NOT NULL COLLATE NOCASE CHECK (length(trim(name)) BETWEEN 2 AND 40),
  kind TEXT NOT NULL CHECK (kind IN ('PS4', 'PS5')),
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate BETWEEN 1000 AND 1000000),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  updated_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) IS updated_at),
  UNIQUE (workspace_id, id),
  UNIQUE (workspace_id, name),
  UNIQUE (workspace_id, seed_key)
) STRICT;

CREATE TABLE bookings (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  reference TEXT NOT NULL CHECK (length(reference) BETWEEN 6 AND 20),
  source TEXT NOT NULL CHECK (source IN ('visitor', 'seed')),
  created_by_role TEXT CHECK (created_by_role IS NULL OR created_by_role IN ('customer', 'owner')),
  starts_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', starts_at) IS starts_at),
  ends_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', ends_at) IS ends_at),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (60, 120, 180)),
  unit_name TEXT NOT NULL CHECK (length(trim(unit_name)) BETWEEN 2 AND 40),
  unit_kind TEXT NOT NULL CHECK (unit_kind IN ('PS4', 'PS5')),
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate BETWEEN 1000 AND 1000000),
  total_price INTEGER NOT NULL CHECK (total_price * 60 = hourly_rate * duration_minutes),
  customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) BETWEEN 2 AND 60),
  phone TEXT CHECK (
    phone IS NULL OR (
      length(replace(phone, '+', '')) BETWEEN 8 AND 15
      AND (phone GLOB '[0-9]*' OR phone GLOB '+[0-9]*')
      AND substr(phone, 2) NOT GLOB '*[^0-9]*'
    )
  ),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  cancelled_at TEXT CHECK (
    cancelled_at IS NULL OR strftime('%Y-%m-%dT%H:%M:%fZ', cancelled_at) IS cancelled_at
  ),
  cancelled_by TEXT CHECK (cancelled_by IS NULL OR cancelled_by IN ('customer', 'owner')),
  cancel_reason TEXT CHECK (cancel_reason IS NULL OR length(cancel_reason) <= 200),
  completed_at TEXT CHECK (
    completed_at IS NULL OR strftime('%Y-%m-%dT%H:%M:%fZ', completed_at) IS completed_at
  ),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  updated_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) IS updated_at),
  FOREIGN KEY (workspace_id, unit_id) REFERENCES units (workspace_id, id),
  UNIQUE (workspace_id, id),
  UNIQUE (workspace_id, reference),
  CHECK ((source = 'seed') = (created_by_role IS NULL)),
  CHECK (unixepoch(ends_at) - unixepoch(starts_at) = duration_minutes * 60),
  CHECK (strftime('%M:%f', starts_at) IN ('00:00.000', '30:00.000')),
  CHECK (time(starts_at, '+7 hours') >= '10:00:00'),
  CHECK (time(ends_at, '+7 hours') <= '23:00:00'),
  CHECK (date(starts_at, '+7 hours') = date(ends_at, '+7 hours')),
  CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL)),
  CHECK (status = 'cancelled' OR (cancelled_by IS NULL AND cancel_reason IS NULL)),
  CHECK ((status = 'completed') = (completed_at IS NOT NULL)),
  CHECK (completed_at IS NULL OR completed_at >= ends_at)
) STRICT;

CREATE INDEX bookings_unit_interval_idx ON bookings (workspace_id, unit_id, starts_at, ends_at);
CREATE INDEX bookings_workspace_starts_idx ON bookings (workspace_id, starts_at);

CREATE TABLE booking_requests (
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 100),
  request_hash TEXT NOT NULL CHECK (length(request_hash) = 64),
  booking_id TEXT NOT NULL,
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  PRIMARY KEY (workspace_id, idempotency_key),
  UNIQUE (workspace_id, booking_id),
  FOREIGN KEY (workspace_id, booking_id) REFERENCES bookings (workspace_id, id)
) STRICT;

CREATE TABLE unit_blocks (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 8 AND 64),
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('owner', 'seed')),
  starts_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', starts_at) IS starts_at),
  ends_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', ends_at) IS ends_at),
  note TEXT NOT NULL DEFAULT '' CHECK (length(note) <= 120),
  created_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', created_at) IS created_at),
  updated_at TEXT NOT NULL CHECK (strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) IS updated_at),
  FOREIGN KEY (workspace_id, unit_id) REFERENCES units (workspace_id, id),
  CHECK (ends_at > starts_at),
  CHECK ((unixepoch(ends_at) - unixepoch(starts_at)) % 1800 = 0),
  CHECK (strftime('%M:%f', starts_at) IN ('00:00.000', '30:00.000')),
  CHECK (time(starts_at, '+7 hours') >= '10:00:00'),
  CHECK (time(ends_at, '+7 hours') <= '23:00:00'),
  CHECK (date(starts_at, '+7 hours') = date(ends_at, '+7 hours'))
) STRICT;

CREATE INDEX unit_blocks_unit_interval_idx
  ON unit_blocks (workspace_id, unit_id, starts_at, ends_at);

-- Pengaman terakhir di database. Service tetap memeriksa konflik/status dalam transaksi
-- (RPS-004/005) dan mengembalikan 409 yang jelas; trigger ini mencegah data salah lolos.
-- Interval [mulai, selesai): bentrok bila lama.mulai < baru.selesai dan lama.selesai > baru.mulai.

CREATE TRIGGER units_limit_per_workspace
BEFORE INSERT ON units
WHEN (SELECT count(*) FROM units WHERE workspace_id = NEW.workspace_id) >= 20
BEGIN
  SELECT RAISE(ABORT, 'UNIT_LIMIT_REACHED');
END;

CREATE TRIGGER bookings_no_overlap
BEFORE INSERT ON bookings
WHEN NEW.status <> 'cancelled'
BEGIN
  SELECT RAISE(ABORT, 'SCHEDULE_CONFLICT')
  WHERE EXISTS (
    SELECT 1 FROM bookings AS other
    WHERE other.workspace_id = NEW.workspace_id AND other.unit_id = NEW.unit_id
      AND other.status <> 'cancelled'
      AND other.starts_at < NEW.ends_at AND other.ends_at > NEW.starts_at
  ) OR EXISTS (
    SELECT 1 FROM unit_blocks AS block
    WHERE block.workspace_id = NEW.workspace_id AND block.unit_id = NEW.unit_id
      AND block.starts_at < NEW.ends_at AND block.ends_at > NEW.starts_at
  );
END;

CREATE TRIGGER unit_blocks_no_overlap
BEFORE INSERT ON unit_blocks
BEGIN
  SELECT RAISE(ABORT, 'SCHEDULE_CONFLICT')
  WHERE EXISTS (
    SELECT 1 FROM bookings AS booking
    WHERE booking.workspace_id = NEW.workspace_id AND booking.unit_id = NEW.unit_id
      AND booking.status <> 'cancelled'
      AND booking.starts_at < NEW.ends_at AND booking.ends_at > NEW.starts_at
  ) OR EXISTS (
    SELECT 1 FROM unit_blocks AS other
    WHERE other.workspace_id = NEW.workspace_id AND other.unit_id = NEW.unit_id
      AND other.starts_at < NEW.ends_at AND other.ends_at > NEW.starts_at
  );
END;

-- Jam, unit, durasi dan snapshot harga tidak berubah setelah booking dibuat.
CREATE TRIGGER bookings_schedule_immutable
BEFORE UPDATE OF workspace_id, unit_id, reference, source, starts_at, ends_at, duration_minutes,
  unit_name, unit_kind, hourly_rate, total_price ON bookings
BEGIN
  SELECT RAISE(ABORT, 'BOOKING_IMMUTABLE');
END;

-- cancelled dan completed bersifat terminal.
CREATE TRIGGER bookings_terminal_status
BEFORE UPDATE OF status ON bookings
WHEN OLD.status IN ('cancelled', 'completed') AND NEW.status IS NOT OLD.status
BEGIN
  SELECT RAISE(ABORT, 'INVALID_STATUS_TRANSITION');
END;

-- Blok diubah dengan hapus lalu buat ulang, sehingga pemeriksaan bentrok tetap berlaku.
CREATE TRIGGER unit_blocks_schedule_immutable
BEFORE UPDATE OF workspace_id, unit_id, starts_at, ends_at ON unit_blocks
BEGIN
  SELECT RAISE(ABORT, 'BLOCK_IMMUTABLE');
END;
