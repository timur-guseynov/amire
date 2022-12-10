import type { ILogger, LogLevels } from "~/logger/server/logger";

interface LogOptions {
  arguments?: boolean;
  output?: boolean;
  level?: LogLevels;
}

export function Logger(logger: ILogger) {
  return function (target: Function) {
    const descriptors = Object.getOwnPropertyDescriptors(target);
    for (const [propertyName, propertyDescriptor] of Object.entries(
      descriptors
    )) {
      if (propertyName === "constructor") {
        continue;
      }

      if (typeof propertyDescriptor.value !== "function") {
        continue;
      }

      if (!propertyDescriptor.value.log) {
        continue;
      }

      const logOptions = propertyDescriptor.value.log as LogOptions;
      const originalMethod = propertyDescriptor.value;
      propertyDescriptor.value = (...args: unknown[]) => {
        logger.log(logOptions.level!, `${target.name}.${propertyName} CALL`);

        if (logOptions.arguments && args.length) {
          logger.log(
            logOptions.level!,
            `${target.name}.${propertyName} ARGUMENTS %O`,
            args
          );
        }

        let output = originalMethod(...args);

        if (logOptions.output) {
          const doOutputLog = (output: unknown) => {
            logger.log(
              logOptions.level!,
              ` ${target.name}.${propertyName} OUTPUT %O`,
              output
            );
          };

          if (typeof output?.then === "function") {
            output = output.then(doOutputLog);
          } else {
            doOutputLog(output);
          }
        }

        return output;
      };
    }
  };
}

const logCallDefaultOptions: LogOptions = {
  level: "debug",
  output: true,
  arguments: true,
};

export function LogCall(options?: LogOptions) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value.log = {
      ...logCallDefaultOptions,
      ...options,
    };
  };
}
