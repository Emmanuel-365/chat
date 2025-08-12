/* eslint-disable @typescript-eslint/no-require-imports */
import pino from "pino";

let logger: pino.Logger;

if (typeof window === 'undefined') { // Server-side
  // On charge logflare uniquement côté serveur
  const { logflarePinoVercel } = require('pino-logflare');  // Utilisation de `require` pour éviter le module côté client
  
  const { stream } = logflarePinoVercel({
    apiKey: process.env.NEXT_PUBLIC_LOGFLARE_API_KEY!,
    sourceToken: process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN!
  });

  logger = pino(
    {
      level: "debug",
      base: {
        env: process.env.NODE_ENV || "development",
        revision: process.env.VERCEL_GIT_COMMIT_SHA,
      },
    },
    stream
  );
} else { // Client-side (browser)
  // Configuration du logger côté client sans interaction avec logflare
  logger = pino({
    browser: {
      transmit: {
        level: "info",
        send: async (level, logEvent) => {
          // Pour éviter l'utilisation de worker_threads, on log simplement sur la console côté client
          console.log(`[${level}]`, logEvent.messages);
        },
      },
    },
    level: "debug",
    base: {
      env: process.env.NODE_ENV || "development",
    },
  });
}

export default logger;
