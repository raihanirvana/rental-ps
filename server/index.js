import { createApp } from './app.js';
import { config } from './config.js';
import { openDatabase } from './database/connection.js';
import { migrateDatabase } from './database/migrate.js';
import { scheduleWorkspaceCleanup } from './services/workspace-cleanup.js';

const cleanupIntervalMs = 10 * 60 * 1000;

const database = openDatabase(config.databasePath);
migrateDatabase(database);
const cleanupTimer = scheduleWorkspaceCleanup(database, cleanupIntervalMs);
const app = createApp(database);
const server = app.listen(config.port, config.host, () => {
  console.log(`Sesi Play: http://${config.host}:${config.port} (${config.environment})`);
});

function stopServer() {
  clearInterval(cleanupTimer);
  server.close(() => {
    database.close();
  });
}

function handleStartupError(error) {
  console.error(`Server belum bisa berjalan: ${error.message}`);
  clearInterval(cleanupTimer);
  database.close();
  process.exitCode = 1;
}

server.on('error', handleStartupError);
process.once('SIGINT', stopServer);
process.once('SIGTERM', stopServer);
