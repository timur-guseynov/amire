import { WinstonLoggerFactory } from "~/logger/server/winston/winston-logger-factory";

import type { Logger as OriginalWinstonLogger } from "winston";
import type { ILogger, LogLevels } from "~/logger/server/logger";

const winstonLoggerFactory = new WinstonLoggerFactory();

export class WinstonLogger implements ILogger {
  private loggerInstance: OriginalWinstonLogger;

  constructor(winstonLogger?: OriginalWinstonLogger) {
    this.loggerInstance = winstonLogger ?? winstonLoggerFactory.makeLogger();
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
    this.loggerInstance.log(level, message, ...args);
  }

  makeChildLoggerFor(module: string): ILogger {
    return new WinstonLogger(this.loggerInstance.child({ module }));
  }
}
