import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// Satu koneksi per proses (satu instance penulis). WAL agar baca tidak menunggu tulis.
export function openDatabase(path) {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const database = new DatabaseSync(path);
  database.exec('PRAGMA busy_timeout = 5000;');
  database.exec('PRAGMA foreign_keys = ON;');
  database.exec('PRAGMA journal_mode = WAL;');
  return database;
}
