import * as http from "http";
import * as CircuitBreaker from "opossum";

interface RequestOptions extends CircuitBreaker.Options {
  json?: boolean;
  timeout?: number;
}

interface ClientResponse {
  body: string;
  json: object;
  response: http.IncomingMessage
}


export {
  ClientResponse,
  RequestOptions
}
