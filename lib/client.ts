import {Http} from "./http";
import {ClientResponse, HttpRequestOptions, RequestOptions} from "./types";
import CircuitBreaker from "opossum";
import HystrixReporter from "opossum-hystrix"
import {CACHE_CONTROL, CONNECTION, CONTENT_TYPE} from "./enums";
import http from "http";

class Client {
  private http: Http;
  static circuits: Map<string, CircuitBreaker<any, ClientResponse>> = new Map();
  static reporter = new HystrixReporter([]);

  constructor(http: Http) {
    this.http = http;
  }

  static metricsStream(_: http.IncomingMessage, response: http.ServerResponse) {
    response.writeHead(200, {
      'content-type': CONTENT_TYPE.TextEventStream,
      'cache-control': CACHE_CONTROL.NoCache,
      'connection': CONNECTION.KeepAlive
    });
    response.write('retry: 10000\n');
    response.write('event: connecttime\n');

    HystrixReporter
      .stream
      .pipe(response);
  }

  request(name: string, url: string, options?: RequestOptions): Promise<ClientResponse> {
    const circuit = Client.circuits.get(name) || this.createCircuit(name, options as any);

    return circuit
      .fire(url, options)
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

    Client.reporter.add(circuit);
    Client.circuits.set(name, circuit);

    return circuit;
  }
}

export {
  Client
}
