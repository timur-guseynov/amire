import type { Logger as OriginalPinoLogger } from "pino";
import type { ILogger, LogLevels } from "~/logger/server/logger";
import { PinoLoggerFactory } from "~/logger/server/pino/pino-logger-factory";

const pinoLoggerFactory = new PinoLoggerFactory();

export class PinoLogger implements ILogger {
  private loggerInstance: OriginalPinoLogger;

  constructor(pinoLogger?: OriginalPinoLogger) {
    this.loggerInstance = pinoLogger ?? pinoLoggerFactory.makeLogger();
  }

  error(message: string, ...args: unknown[]): void {
    this.loggerInstance.error(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.loggerInstance.warn(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.loggerInstance.info(message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.loggerInstance.debug(message, ...args);
  }

  log(level: LogLevels, message: string, ...args: unknown[]): void {
    this[level](message, ...args);
  }

  makeChildLoggerFor(module: string): ILogger {
    return new PinoLogger(this.loggerInstance.child({ module }));
  }
}
