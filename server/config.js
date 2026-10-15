import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = fileURLToPath(new URL('../', import.meta.url));
const envPath = resolve(rootDirectory, '.env');

// Variabel yang sudah ada di environment tetap menang atas isi .env.
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

function readPort(value, name) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} harus berupa bilangan bulat antara 1 dan 65535.`);
  }
  return port;
}

function readDatabasePath(value) {
  if (value.trim() === '') {
    throw new Error('DATABASE_PATH tidak boleh kosong.');
  }
  return value === ':memory:' ? value : resolve(rootDirectory, value);
}

function readDemoTtlMinutes(value) {
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 10080) {
    throw new Error('DEMO_TTL_MINUTES harus berupa bilangan bulat antara 1 dan 10080.');
  }
  return minutes;
}

// Nilai Express "trust proxy": false, jumlah hop, atau daftar alamat/subnet proxy.
// `true` ditolak karena membuat X-Forwarded-* dari klien mana pun dipercaya.
function readTrustProxy(value) {
  if (value === undefined || value === '' || value === 'false') {
    return false;
  }
  if (value === 'true') {
    throw new Error('TRUST_PROXY=true memercayai semua proxy; isi jumlah hop atau alamat.');
  }
  return /^\d+$/.test(value) ? Number(value) : value;
}

export const config = {
  host: process.env.HOST ?? '127.0.0.1',
  port: readPort(process.env.PORT ?? '3001', 'PORT'),
  webPort: readPort(process.env.WEB_PORT ?? '5173', 'WEB_PORT'),
  environment: process.env.NODE_ENV ?? 'development',
  // Umur workspace demo; sesi mengikuti umur workspace dan tidak diperpanjang ganti peran.
  demoTtlMinutes: readDemoTtlMinutes(process.env.DEMO_TTL_MINUTES ?? '720'),
  trustProxy: readTrustProxy(process.env.TRUST_PROXY),
  // Path relatif dihitung dari root proyek; ':memory:' untuk pemeriksaan sementara.
  databasePath: readDatabasePath(process.env.DATABASE_PATH ?? './data/sesi-play.sqlite'),
  webDirectory: resolve(rootDirectory, 'client/dist'),
};
