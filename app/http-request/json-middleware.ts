import type { IHttpRequestTransformer } from "~/http-request/http-request";

const jsonMiddleware: IHttpRequestTransformer = (context) => {
  if (context.options.body) {
  }
};
