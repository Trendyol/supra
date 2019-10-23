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

  request(url: string, requestOptions: HttpRequestOptions): Promise<Omit<ClientResponse, 'json'>> {
    const requestBody = typeof requestOptions.body === "object" ?
      JSON.stringify(requestOptions.body) :
      typeof requestOptions.body === "string" ?
        requestOptions.body : undefined;

    const options = this.createRequestOptions(url, requestOptions, requestBody);

    return new Promise(resolve => {
      const request = http.request(url, options, response => {
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

  private createRequestOptions(url: string, options: HttpRequestOptions, bodyContent?: string) {
    const agent = url.startsWith('https') ? this.httpsAgent : this.httpAgent;

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
