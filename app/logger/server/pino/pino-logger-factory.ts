import { pino } from "pino";
import pretty from "pino-pretty";

import type { Logger as OriginalPinoLogger } from "pino";
import type { PrettyOptions } from "pino-pretty";
import type { AdaptedLoggerInstanceFactory } from "~/logger/server/logger";

export class PinoLoggerFactory
  implements AdaptedLoggerInstanceFactory<OriginalPinoLogger>
{
  makeLogger(): OriginalPinoLogger {
    return pino(this.makeTransport());
  }

  private makeTransport() {
    if (process.env.NODE_ENV === "production") {
      return this.makeFileTransports();
    }

    return this.makeConsoleTransport();
  }

  private makeFileTransports() {
    return pino.transport({
      targets: [
        {
          target: "pino/file",
          level: "error",
          options: { destination: "amire.errors.log", mkdir: true },
        },
        {
          target: "pino/file",
          level: "info",
          options: { destination: "amire.log", mkdir: true },
        },
      ],
    });
  }

  private makeConsoleTransport() {
    const options: PrettyOptions = {};

    if (process.env.NODE_ENV === "test") {
      options.sync = true;
    }

    return pretty(options);
  }
}
