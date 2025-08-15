/* eslint-disable @typescript-eslint/no-require-imports */
import pino from "pino";

let logger: pino.Logger;

if (typeof window === 'undefined') { // Server-side
  const hasLogflare = process.env.NEXT_PUBLIC_LOGFLARE_API_KEY && process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN;

  if (hasLogflare) {
    try {
      const { logflarePinoVercel } = require('pino-logflare');
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
    } catch (e) {
        console.error('Could not load pino-logflare, falling back to console logger', e);
        logger = pino({ level: "debug" });
    }
  } else {
    console.warn("Logflare environment variables not set. Falling back to console logger.");
    logger = pino({
      level: "debug",
      base: {
        env: process.env.NODE_ENV || "development",
        revision: process.env.VERCEL_GIT_COMMIT_SHA,
      },
    });
  }
} else { // Client-side (browser)
  logger = pino({
    browser: {
      transmit: {
        level: "info",
        send: async (level, logEvent) => {
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
