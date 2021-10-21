import * as http from "http";
import * as CircuitBreaker from "opossum";

interface HttpRequestOptions {
  method?: 'get' | 'post' | 'delete' | 'put' | 'head' | 'patch';
  body?: string | object;
  form?: string | object;
  followRedirect?: boolean;
  json?: boolean;
  headers?: Record<string, string>;
  httpTimeout?: number;
  compressRequest?: boolean;
}

interface RequestOptions extends CircuitBreaker.Options, HttpRequestOptions {

}

interface ClientResponse {
  body?: string;
  json?: object;
  response: http.IncomingMessage
}

export {
  ClientResponse,
  HttpRequestOptions,
  RequestOptions
}
