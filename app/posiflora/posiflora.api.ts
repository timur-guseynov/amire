const posifloraApiUrl = process.env.POSIFLORA_API_BASE_URL + "api/";

interface PosifloraFetchOptions<RequestBody> {
  method: "get" | "post" | "put" | "patch";
  body?: RequestBody;
  accessToken?: string;
}

export async function posifloraFetch<RequestBody, ResponseBody>(
  url: string,
  options?: PosifloraFetchOptions<RequestBody>
): Promise<ResponseBody> {
  const resultingOptions = prepareOptions(options);
  const response = await fetch(posifloraApiUrl + url, resultingOptions);
  return response.json();
}

function prepareOptions<RequestBody>(
  options?: PosifloraFetchOptions<RequestBody>
): RequestInit {
  const resultingOptions: RequestInit = {
    method: options?.method ?? "get",
  };

  if (options?.body) {
    resultingOptions.body = JSON.stringify(options.body);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/vnd.api+json",
  };
  if (options?.accessToken) {
    headers["Authorization"] = "Bearer " + options.accessToken;
  }
  resultingOptions.headers = headers;

  return resultingOptions;
}
