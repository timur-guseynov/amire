import { PinoLogger } from "~/logger/server/pino/pino-logger";

export type { ILogger } from "./server/logger";
export * from "./server/logger-decorators";

export const logger = new PinoLogger();
