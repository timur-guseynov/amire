import { createLogger, format, transports } from "winston";

import type { Logger as OriginalWinstonLogger } from "winston";
import type { AdaptedLoggerInstanceFactory } from "~/logger/server/logger";

export class WinstonLoggerFactory
  implements AdaptedLoggerInstanceFactory<OriginalWinstonLogger>
{
  private static jsonFormat = format.combine(format.timestamp(), format.json());

  makeLogger(): OriginalWinstonLogger {
    return createLogger({
      defaultMeta: {
        module: "amirè",
      },
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level} ${info.module} - ${info.message}`
        )
      ),
      transports: this.makeTransports(),
      exceptionHandlers: this.makeExceptionHandlers(),
      rejectionHandlers: this.makeRejectionHandlers(),
    });
  }

  private makeTransports() {
    const winstonTransports = [];

    if (process.env.NODE_ENV === "production") {
      winstonTransports.push(
        new transports.File({
          filename: "amire.log",
          format: WinstonLoggerFactory.jsonFormat,
        }),
        new transports.File({ filename: "amire.errors.log" })
      );
    } else {
      winstonTransports.push(new transports.Console());
    }

    return winstonTransports;
  }

  private makeExceptionHandlers() {
    if (process.env.NODE_ENV === "production") {
      return new transports.File({ filename: "amire.exceptions.log" });
    }
  }

  private makeRejectionHandlers() {
    if (process.env.NODE_ENV === "production") {
      return new transports.File({ filename: "amire.rejections.log" });
    }
  }
}
