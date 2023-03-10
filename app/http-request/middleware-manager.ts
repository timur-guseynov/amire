export interface Middleware<Context> {
  (context: Context): void | Promise<void>;
}

export interface IMiddlewareManager<Context> {
  use(...middlewares: Middleware<Context>[]): void;
  run(context: Context): Promise<void>;
}

export class MiddlewareManager<Context> implements IMiddlewareManager<Context> {
  private middlewares: Middleware<Context>[] = [];

  use(...middlewares: Middleware<Context>[]): void {
    this.middlewares.push(...middlewares);
  }

  async run(context: Context): Promise<void> {
    for (const middleware of this.middlewares) {
      await middleware(context);
    }
  }
}
