import {Http} from "./http";
import {ClientResponse, RequestOptions} from "./types";
import CircuitBreaker from "opossum";
import OpossumHystrix from "opossum-hystrix"

class Client {
  http: Http;
  static circuits: Map<string, CircuitBreaker<any, ClientResponse>> = new Map();
  static reporter = new OpossumHystrix([]);

  constructor(http: Http) {
    this.http = http;
  }

  static metricsStream(request: any, response: any) {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    response.write('retry: 10000\n');
    response.write('event: connecttime\n');

    OpossumHystrix.stream.pipe(response);
  }

  request(name: string, url: string, options?: RequestOptions): Promise<ClientResponse> {
    const circuit = Client.circuits.get(name) || this.createCircuit(name, options as any);

    return circuit
      .fire(url)
  }

  private createCircuit(name: string, options: CircuitBreaker.Options): CircuitBreaker<any, ClientResponse> {
    const circuit = new CircuitBreaker((url: string, options?: RequestOptions): Promise<ClientResponse> => {
      return this.http
        .request(url)
        .then(res => ({
            ...res,
            json: options && options.json ? JSON.parse(res.body) : {}
          }
        ));
    }, {name, ...options});

    Client.reporter.add(circuit);
    Client.circuits.set(name, circuit);

    return circuit;
  }
}

export {
  Client
}
