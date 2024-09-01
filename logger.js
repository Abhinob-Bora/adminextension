let value = true;

if (value) {
  (function () {
    const levels = {
      debug: "DEBUG",
      info: "INFO",
      warn: "WARN",
      error: "ERROR",
    };

    const log = (level, ...messages) => {
      console.log(`[${level}]:`, ...messages);
    };

    window.logger = {
      debug: (msg) => log(levels.debug, msg),
      info: (msg) => log(levels.info, msg),
      warn: (msg) => log(levels.warn, msg),
      error: (msg) => log(levels.error, msg),
    };
  })();
} else {
  // Define a no-op function for logging if value is false
  window.logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
}
