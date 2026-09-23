const logLevel = process.env.LOG_LEVEL || 'info';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

const logger = {
  error: (...args) => {
    if (levels.error <= levels[logLevel]) console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    if (levels.warn <= levels[logLevel]) console.warn('[WARN]', ...args);
  },
  info: (...args) => {
    if (levels.info <= levels[logLevel]) console.info('[INFO]', ...args);
  },
  debug: (...args) => {
    if (levels.debug <= levels[logLevel]) console.log('[DEBUG]', ...args);
  },
};

export default logger;
