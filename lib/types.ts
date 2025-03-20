import * as CircuitBreaker from "opossum";

interface HttpRequestOptions {
  method?: string;
  body?: object | string;
  json?: boolean;
  form?: Record<string, string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | null> | string;
  headers?: Record<string, string>;
  followRedirect?: boolean;
  httpTimeout?: number;
  compressRequest?: boolean;
}

interface RequestOptions extends CircuitBreaker.Options, HttpRequestOptions {

}

interface ClientResponse {
  body: string;
  response: {
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
  };
  json?: object;
}

export {
  ClientResponse,
  HttpRequestOptions,
  RequestOptions
}
