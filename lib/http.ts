import http from "http";
import https from "https";
import {Compression} from "./compression";
import {ClientResponse} from "./types";


class Http {
  private httpAgent = new http.Agent({
    keepAlive: true
  });
  private httpsAgent = new https.Agent({
    keepAlive: true
  });

  request(url: string): Promise<Omit<ClientResponse, 'json'>> {
    const agent = url.startsWith('https') ? this.httpsAgent : this.httpAgent;

    const options = this.createRequestOptions({
      method: 'get',
      agent
    });

    return new Promise((resolve, reject) => {
      const request = http.request(url, options, response => {
        Compression.handle(response)
          .then(body => resolve({
            body,
            response
          }))
      });

      request.end();
    });
  }

  private createRequestOptions(options: { method: string, headers?: Record<string, string>, json?: boolean, agent: http.Agent | https.Agent }) {
    return {
      method: options.method,
      agent: options.agent,
      headers: {
        ...options.headers,
        ...options.json ? {'Content-Type': 'application/json'} : {},
        'accept-encoding': Compression.getSupportedStreams()
      }
    } as https.RequestOptions | http.RequestOptions;
  }
}

export {
  Http
}
