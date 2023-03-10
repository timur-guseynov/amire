import type {
  IHttpRequestBackend,
  IHttpRequestOptions,
} from "~/http-request/http-request";

export class FetchBackend implements IHttpRequestBackend<Response> {
  dispatch(path: string, options: IHttpRequestOptions): Promise<Response> {
    const req: RequestInit = {
      method: options.method,
    };
    return fetch(path);
  }
}
