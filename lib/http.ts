import http from "http";
import https from "https";
import {Compression} from "./compression";
import {ClientResponse, HttpRequestOptions} from "./types";
import {CONTENT_TYPE} from "./enums";


class Http {
  httpAgent = new http.Agent({
    keepAlive: true
  });
  httpsAgent = new https.Agent({
    keepAlive: true
  });

  request(url: string, requestOptions: HttpRequestOptions): Promise<ClientResponse> {
    const requestProvider = url.startsWith('https') ? {
      agent: this.httpsAgent,
      client: https
    } : {
      agent: this.httpAgent,
      client: http
    };

    const requestBody = typeof requestOptions.body === "object" ?
      JSON.stringify(requestOptions.body) :
      typeof requestOptions.body === "string" ?
        requestOptions.body : undefined;

    const options = this.createRequestOptions(url, requestOptions, requestProvider.agent, requestBody);

    return new Promise(resolve => {
      const request = requestProvider.client.request(url, options, response => {
        Compression.handle(response)
          .then(body => resolve({
            body,
            response
          }))
      });

      if (requestBody) {
        request.write(requestBody);
      }

      request.end();
    });
  }

  private createRequestOptions(url: string, options: HttpRequestOptions, agent: http.Agent | https.Agent, bodyContent?: string) {
    const mergedOptions = {
      method: options.method || 'get',
      agent,
      headers: {
        ...options.headers,
        'accept-encoding': Compression.getSupportedStreams()
      }
    } as https.RequestOptions | http.RequestOptions;

    if (options.json) {
      mergedOptions.headers!['content-type'] = CONTENT_TYPE.ApplicationJson;
    }

    if (bodyContent) {
      mergedOptions.headers!['content-length'] = bodyContent.length;
      mergedOptions.headers!['content-type'] = CONTENT_TYPE.ApplicationJson;
    }

    return mergedOptions;
  }
}

export {
  Http
}
