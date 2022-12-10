import { pino } from "pino";

import type { Logger as OriginalPinoLogger } from "pino";
import type { PrettyOptions } from "pino-pretty";
import type ThreadStream from "thread-stream";
import type { AdaptedLoggerInstanceFactory } from "~/logger/server/logger";

export class PinoLoggerFactory
  implements AdaptedLoggerInstanceFactory<OriginalPinoLogger>
{
  makeLogger(): OriginalPinoLogger {
    return pino(
      {
        formatters: {
          level: (label) => ({
            label,
          }),
          log: (object) => ({
            module: "amirè",
            ...object,
          }),
        },
      },
      this.makeTransport()
    );
  }

  private makeTransport(): ThreadStream {
    if (process.env.NODE_ENV === "production") {
      return this.makeFileTransports();
    } else {
      return this.makeConsoleTransport();
    }
  }

  private makeFileTransports(): ThreadStream {
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

  private makeConsoleTransport(): ThreadStream {
    const options: PrettyOptions = {
      messageFormat: (log, messageKey) => `[${log.module}] ${log[messageKey]}`,
    };

    return pino.transport({
      target: "pino-pretty",
      options,
    });
  }
}
