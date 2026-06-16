/**
 * Logger Utility
 * Centralized logging for all components
 */
export class Logger {
  private prefix: string;

  constructor(module: string) {
    this.prefix = `[${module}]`;
  }

  info(message: string): void {
    console.log(`${this.prefix} INFO: ${message}`);
  }

  debug(message: string): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`${this.prefix} DEBUG: ${message}`);
    }
  }

  warn(message: string): void {
    console.warn(`${this.prefix} WARN: ${message}`);
  }

  error(message: string, error?: any): void {
    console.error(`${this.prefix} ERROR: ${message}`, error || '');
  }
}
