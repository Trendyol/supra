import {Http} from "./http";
import {ClientResponse, HttpRequestOptions, RequestOptions} from "./types";
import CircuitBreaker from "opossum";

class Client {
  private http: Http;
  static circuits: Map<string, CircuitBreaker<any, ClientResponse>> = new Map();

  constructor(http: Http) {
    this.http = http;
  }

  request(name: string, url: string, options?: RequestOptions): Promise<ClientResponse> {
    const circuit = Client.circuits.get(name) || this.createCircuit(name, options as any);

    return circuit
      .fire(url, options || {})
  }

  private createCircuit(name: string, options: RequestOptions): CircuitBreaker<any, ClientResponse> {
    const requestSender = (url: string, requestOptions: HttpRequestOptions): Promise<ClientResponse> => {
      return this.http
        .request(url, requestOptions)
        .then(res => {
            if (options && options.json && res.body) {
              res.json = JSON.parse(res.body);
            }
            return res;
          }
        );
    };

    const circuit = new CircuitBreaker(requestSender, {name, ...options});

    Client.circuits.set(name, circuit);

    return circuit;
  }
}

export {
  Client
}
