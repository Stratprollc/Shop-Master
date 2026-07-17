// Hostinger Entrypoint Wrapper with Robust Logging
// This file runs after Hostinger triggers 'npm run build' which compiles 'server.ts' to 'dist/server.cjs'

function logCrash(error) {
  const message = `[${new Date().toISOString()}] CRASH ERROR: ${error?.stack || error || 'Unknown Error'}\n`;
  console.error(message);
  try {
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      fs.appendFileSync('server_crash.log', message);
    } else {
      import('fs').then((fs) => {
        fs.appendFileSync('server_crash.log', message);
      }).catch(() => {});
    }
  } catch (e) {
    // Ignore logging errors
  }
}

process.on('uncaughtException', (err) => {
  logCrash(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logCrash(reason);
});

console.log("[Hostinger Entrypoint Wrapper] Booting up...");

if (typeof require !== 'undefined') {
  try {
    const path = require('path');
    require(path.join(__dirname, 'dist', 'server.cjs'));
    console.log("[Hostinger Entrypoint Wrapper] Loaded server.cjs via CommonJS require.");
  } catch (err) {
    logCrash(err);
    process.exit(1);
  }
} else {
  import('./dist/server.cjs').then(() => {
    console.log("[Hostinger Entrypoint Wrapper] Loaded server.cjs via ES dynamic import.");
  }).catch((err) => {
    logCrash(err);
    process.exit(1);
  });
}

