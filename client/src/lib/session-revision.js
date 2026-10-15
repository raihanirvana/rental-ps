// Identitas request lokal, bukan token/peran. Respons lama tidak boleh mengubah sesi baru.
let revision = 0;

export function sessionRevision() {
  return revision;
}

export function advanceSessionRevision() {
  revision += 1;
  return revision;
}

export function isCurrentSessionRevision(value) {
  return value === revision;
}
