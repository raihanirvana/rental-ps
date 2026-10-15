import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = fileURLToPath(new URL('../../', import.meta.url));

// Direktori dan database sementara; database pengembangan tidak pernah disentuh.
export function createTempDirectory() {
  const directory = mkdtempSync(join(tmpdir(), 'sesi-play-verify-'));
  return { directory, databasePath: join(directory, 'verify.sqlite') };
}

export function removeTempDirectory(directory) {
  rmSync(directory, { recursive: true, force: true });
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function assertChildRunning(child) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) {
    throw new Error('Server berhenti sebelum siap.');
  }
}

async function waitForHealth(url, child, logs) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    assertChildRunning(child);
    try {
      const listening = logs.some((line) => line.includes('Sesi Play: '));
      if (listening && (await fetch(`${url}/api/health`)).ok) {
        return;
      }
    } catch {
      // Belum mendengarkan; coba lagi.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Server tidak siap dalam 10 detik.');
}

function childEnvironment(databasePath, port, env) {
  return {
    ...process.env,
    NODE_ENV: 'production',
    HOST: '127.0.0.1',
    PORT: String(port),
    DATABASE_PATH: databasePath,
    NODE_NO_WARNINGS: '1',
    TRUST_PROXY: 'false',
    ALLOWED_ORIGINS: '',
    DEMO_TTL_MINUTES: '720',
    DEMO_SESSION_LIMIT: '30',
    API_RATE_LIMIT: '300',
    DEMO_MAX_WORKSPACES: '200',
    ...env,
  };
}

// Menyalakan server proyek sebagai child process dengan port acak. `stop` hanya menghentikan
// proses milik harness ini.
export async function startServer({ databasePath, env = {} }) {
  const port = await freePort();
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: rootDirectory,
    env: childEnvironment(databasePath, port, env),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr.on('data', (chunk) => logs.push(String(chunk)));
  child.on('error', () => logs.push('Proses server gagal dibuat.'));
  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForHealth(url, child, logs);
  } catch (error) {
    await stopChild(child);
    throw error;
  }
  const stop = () => stopChild(child);
  return { url, logs, stop };
}

function stopChild(child) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    timer.unref();
    child.kill('SIGTERM');
  });
}
