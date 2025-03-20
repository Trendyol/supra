import { Http } from "./http";
import { ClientResponse, HttpRequestOptions, RequestOptions } from "./types";
import CircuitBreaker from "opossum";
import { CONTENT_TYPE } from "./enums";
import { convertRequestToCurl } from "./utils";

class Client {
  private http: Http;
  static circuits: Map<string, CircuitBreaker<any, ClientResponse>> = new Map();
  private globalOptions: Record<string, string> = {};

  constructor(http: Http) {
    this.http = http;
  }

  setGlobalOptions(options: Record<string, string>) {
    this.globalOptions = options;
  }

  request(name: string, url: string, options?: RequestOptions): Promise<ClientResponse> {
    const circuit = Client.circuits.get(name) || this.createCircuit(name, options as RequestOptions);
    return circuit.fire(url, options || {});
  }

  private createCircuit(name: string, options: RequestOptions): CircuitBreaker<any, ClientResponse> {
    const requestSender = (url: string, requestOptions: HttpRequestOptions): Promise<ClientResponse> => {
      return new Promise<ClientResponse>((resolve, reject) => {
        this.http.request(url, requestOptions, (err, res) => {
          if (err || !res) {
            reject(err);
            return;
          }

          const headers = requestOptions.headers || {};
          const { flagHeaderNameToShowCurlOnResponse, responseHeaderNameForCurl } = this.globalOptions;

          if (headers[flagHeaderNameToShowCurlOnResponse]) {
            res.response.headers[responseHeaderNameForCurl] = convertRequestToCurl(url, requestOptions);
          }

          if (
            options &&
            options.json &&
            res.body &&
            res.response.headers["content-type"] &&
            (res.response.headers["content-type"] as string).startsWith(CONTENT_TYPE.ApplicationJson)
          ) {
            try {
              res.json = JSON.parse(res.body);
              resolve(res);
            } catch (error) {
              reject(error);
            }
          } else {
            resolve(res);
          }
        });
      });
    };

    const circuit = new CircuitBreaker(requestSender, {
      name,
      timeout: options.httpTimeout || 10000, // Default timeout 10 seconds
      errorThresholdPercentage: 50, // Open the circuit at 50% error rate
      resetTimeout: 30000, // Try the circuit again after 30 seconds
      ...(options as RequestOptions),
    });

    Client.circuits.set(name, circuit);
    return circuit;
  }
}

export { Client };
