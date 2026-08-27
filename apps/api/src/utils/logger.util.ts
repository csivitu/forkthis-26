/**
 * Standard logger utility for consistent backend logging.
 * You can easily swap this out with Pino or Winston later if needed.
 */

// Basic console color codes for visually distinguishing log levels
const colors = {
  reset: "\x1b[0m",
  info: "\x1b[36m", // Cyan
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  debug: "\x1b[35m", // Magenta
};

const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(
      `${colors.info}[INFO]${colors.reset} [${getTimestamp()}] - ${message}`,
      ...args
    );
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(
      `${colors.warn}[WARN]${colors.reset} [${getTimestamp()}] - ${message}`,
      ...args
    );
  },
  error: (message: string, ...args: any[]) => {
    console.error(
      `${colors.error}[ERROR]${colors.reset} [${getTimestamp()}] - ${message}`,
      ...args
    );
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `${colors.debug}[DEBUG]${colors.reset} [${getTimestamp()}] - ${message}`,
        ...args
      );
    }
  },
};

export default logger;