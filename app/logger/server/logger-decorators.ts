import type { ILogger, LogLevels } from "~/logger/server/logger";

interface LogOptions {
  arguments?: boolean;
  output?: boolean;
  level?: LogLevels;
}

const logCallDefaultOptions: LogOptions = {
  level: "debug",
  output: true,
  arguments: true,
};

interface LoggerOptions extends LogOptions {
  logger: ILogger;
}

export function Logger({ logger, ...options }: LoggerOptions) {
  return function (target: Function) {
    const defaultOptions = {
      ...logCallDefaultOptions,
      ...options,
    };

    const descriptors = Object.getOwnPropertyDescriptors(target.prototype);
    for (const [propertyName, propertyDescriptor] of Object.entries(
      descriptors
    )) {
      if (propertyDescriptor.value.log === undefined) {
        continue;
      }

      const logOptions = {
        ...defaultOptions,
        ...(propertyDescriptor.value.log as LogOptions),
      };
      const originalMethod = propertyDescriptor.value;
      propertyDescriptor.value = function (...args: unknown[]) {
        logger.log(logOptions.level!, `${target.name}.${propertyName} CALL`);

        if (logOptions.arguments && args.length) {
          logger.log(
            logOptions.level!,
            `${target.name}.${propertyName} ARGUMENTS %O`,
            ...args
          );
        }

        let output = originalMethod.apply(this, args);

        if (logOptions.output) {
          const doOutputLog = (output: unknown) => {
            logger.log(
              logOptions.level!,
              ` ${target.name}.${propertyName} OUTPUT %O`,
              output
            );
            return output;
          };

          if (typeof output?.then === "function") {
            output = output.then(doOutputLog);
          } else {
            doOutputLog(output);
          }
        }

        return output;
      };

      Object.defineProperty(target.prototype, propertyName, propertyDescriptor);
    }
  };
}

export function LogCall(options?: LogOptions) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value.log = {
      ...options,
    };
  };
}
