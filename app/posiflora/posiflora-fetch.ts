interface IPosifloraFetchOptions {
  method: "get" | "post" | "put" | "patch";
  body?: unknown;
  contentType?: string;
}

export interface PosifloraFetchRequestTransformer {
  (req: RequestInit): void;
}

export interface IPosifloraFetch {
  do<ResponseBody>(
    path: string,
    options?: IPosifloraFetchOptions
  ): Promise<ResponseBody>;
  use(...middlewares: PosifloraFetchRequestTransformer[]): this;
}

interface PosifloraApiErrorResponse {
  status: string;
  title: string;
  detail?: string;
}

interface PosifloraApiErrorResponseBody {
  errors: PosifloraApiErrorResponse[];
}

function isFetchError(error: Error): boolean {
  return error.name === "FetchError";
}

export class PosifloraApiError extends Error {
  constructor(
    public urlPath: string,
    message: string,
    public errors?: PosifloraApiErrorResponse[]
  ) {
    super(`[${urlPath}] ${message}`);
    this.name = this.constructor.name;
  }

  static fromApiErrorResponse(
    urlPath: string,
    { errors }: PosifloraApiErrorResponseBody
  ): PosifloraApiError {
    const message =
      errors.length === 1
        ? PosifloraApiError.makeMessageFromApiError(errors[0])
        : `Several errors were returned: ${errors.map(
            (error) => `\r\n${PosifloraApiError.makeMessageFromApiError(error)}`
          )}`;

    return new PosifloraApiError(urlPath, message);
  }

  private static makeMessageFromApiError({
    status,
    title,
    detail,
  }: PosifloraApiErrorResponse): string {
    let message = `${status}: ${title}`;
    if (detail) {
      message += `. ${detail}`;
    }
    return message;
  }
}

export class PosifloraFetch implements IPosifloraFetch {
  private middlewares: PosifloraFetchRequestTransformer[] = [];

  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl + "api/v1";
  }

  use(...middlewares: PosifloraFetchRequestTransformer[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  async do<ResponseBody>(
    path: string,
    options?: IPosifloraFetchOptions
  ): Promise<ResponseBody> {
    const urlPath = this.baseUrl + path;

    const resultingOptions = this.runMiddlewares(
      PosifloraFetch.prepareOptions(options)
    );

    let response;
    try {
      response = await fetch(urlPath, resultingOptions);
    } catch (e) {
      if (e instanceof Error && isFetchError(e)) {
        throw new PosifloraApiError(urlPath, e.message);
      }

      throw e;
    }

    const responseBody: ResponseBody | PosifloraApiErrorResponseBody =
      await response.json();

    if (response.status !== 200) {
      throw PosifloraApiError.fromApiErrorResponse(
        urlPath,
        responseBody as PosifloraApiErrorResponseBody
      );
    }

    return responseBody as ResponseBody;
  }

  private runMiddlewares(req: RequestInit): RequestInit {
    this.middlewares.forEach((fn) => fn(req));
    return req;
  }

  private static prepareOptions(options?: IPosifloraFetchOptions): RequestInit {
    const resultingOptions: RequestInit = {
      method: options?.method ?? "get",
      headers: {
        "Content-Type": options?.contentType ?? "application/vnd.api+json",
      },
    };

    if (options?.body) {
      resultingOptions.body = JSON.stringify(options.body);
    }

    return resultingOptions;
  }
}
