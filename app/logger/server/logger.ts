export type LogLevels = "error" | "warn" | "info" | "debug";
type LeveledLogFunction = (message: string, ...args: unknown[]) => void;

export interface ILogger {
  error: LeveledLogFunction;
  warn: LeveledLogFunction;
  info: LeveledLogFunction;
  debug: LeveledLogFunction;
  log: (level: LogLevels, message: string, ...args: unknown[]) => void;
  makeChildLoggerFor(module: string): ILogger;
}

export interface AdaptedLoggerInstanceFactory<AdaptedLogger> {
  makeLogger(): AdaptedLogger;
}
