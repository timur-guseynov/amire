import type {
  IMiddlewareManager,
  Middleware,
} from "~/http-request/middleware-manager";

export interface IHttpRequestOptions {
  method: "get" | "post" | "put" | "patch";
  body?: unknown;
  contentType?: string;
}

export interface IHttpRequestContext {
  options: IHttpRequestOptions;
  url: string;
}

export type IHttpRequestTransformer = Middleware<IHttpRequestContext>;
export type IHttpRequestErrorHandler = Middleware<unknown>;

export interface IHttpRequest<Response> {
  dispatch(path: string, options?: IHttpRequestOptions): Promise<Response>;
  use(...middlewares: IHttpRequestTransformer[]): this;
  useErrorHandler(...errorHandlers: IHttpRequestErrorHandler[]): this;
}

export interface IHttpRequestBackend<Response> {
  dispatch(path: string, options: IHttpRequestOptions): Promise<Response>;
}

export class HttpRequest<Response> implements IHttpRequest<Response> {
  constructor(
    private backend: IHttpRequestBackend<Response>,
    private middlewareManager: IMiddlewareManager<IHttpRequestContext>,
    private errorHandlerManager: IMiddlewareManager<unknown>
  ) {}

  use(...middlewares: IHttpRequestTransformer[]): this {
    this.middlewareManager.use(...middlewares);
    return this;
  }

  useErrorHandler(...errorHandlers: IHttpRequestErrorHandler[]): this {
    this.errorHandlerManager.use(...errorHandlers);
    return this;
  }

  async dispatch(
    path: string,
    options?: IHttpRequestOptions
  ): Promise<Response> {
    let context: IHttpRequestContext = {
      options: options ?? { method: "get" },
      url: path,
    };

    try {
      await this.middlewareManager.run(context);
    } catch (e) {
      await this.errorHandlerManager.run(e);
      throw e;
    }

    return this.backend.dispatch(context.url, context.options);
  }
}
