import { Http } from "./http";
import { ClientResponse, HttpRequestOptions, RequestOptions } from "./types";
import CircuitBreaker from "opossum";
import { CONTENT_TYPE } from "./enums";
import { generateCurl } from "./utils";
(CircuitBreaker as any) = require("../opossum-state-fixed");

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
    const circuit = Client.circuits.get(name) || this.createCircuit(name, options as any);

    return circuit.fire(url, options || {});
  }

  private createCircuit(name: string, options: RequestOptions): CircuitBreaker<any, ClientResponse> {
    const requestSender = (url: string, requestOptions: HttpRequestOptions): Promise<ClientResponse> => {
      return new Promise<ClientResponse>((resolve, reject) => {
        this.http.request(url, requestOptions, (err, res) => {
          if (err || !res) {
            reject(err);
          } else {
            if (
              requestOptions &&
              requestOptions.headers &&
              this.globalOptions.flagHeaderNameToShowCurlOnResponse &&
              requestOptions.headers[this.globalOptions.flagHeaderNameToShowCurlOnResponse]
            ) {
              res.response.headers[this.globalOptions.responseHeaderNameForCurl] = generateCurl(url, requestOptions);
            }
            if (
              options &&
              options.json &&
              res.body &&
              res.response.headers["content-type"] &&
              res.response.headers["content-type"].startsWith(CONTENT_TYPE.ApplicationJson)
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
          }
        });
      });
    };

    const circuit = new CircuitBreaker(requestSender, { name, ...options });

    Client.circuits.set(name, circuit);

    return circuit;
  }
}

export { Client };
