import http from "http";
import https from "https";
import {Compression} from "./compression";
import {ClientResponse, HttpRequestOptions} from "./types";
import {CONTENT_TYPE} from "./enums";
import Url from "fast-url-parser";
import {stringify} from "querystring";

class Http {
  httpAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 30,
    keepAliveMsecs: 30000,
  });
  httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 30,
    keepAliveMsecs: 30000,
  });

  request(url: string, requestOptions: HttpRequestOptions, cb: (err: null | Error, clientResponse?: ClientResponse) => void): void {
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

    const requestFormContent = !requestBody ?
      typeof requestOptions.form === "object" ?
        stringify(requestOptions.form as any) :
        typeof requestOptions.form === "string" ?
          requestOptions.form : undefined : undefined;


    const options = this.createRequestOptions(url, requestOptions, requestProvider.agent, requestBody, requestFormContent);

    const request = requestProvider.client.request(options, response => {
      Compression
        .handle(response, (err, body) => {
          if (err) return cb(err);

          cb(null, {
            body,
            response
          });
        });
    });

    request.setNoDelay(true);

    if (options.timeout) {
      request.setTimeout(options.timeout, () => {
        request.abort();
      });
    }

    request
      .on('error', e => {
        cb(e);
      });

    const writableContent = requestBody || requestFormContent;
    if (writableContent) {
      if (requestOptions.compressRequest) {
        Compression.compressBody(writableContent, (err, buffer) => {
          if (err || !buffer) {
            request.setHeader('content-length', Buffer.byteLength(writableContent));
            request.write(writableContent);
          } else {
            request.setHeader('content-encoding', 'gzip');
            request.setHeader('content-length', Buffer.byteLength(buffer));
            request.write(buffer);
          }
          request.end();
        });
      } else {
        request.setHeader('content-length', Buffer.byteLength(writableContent));
        request.write(writableContent);
        request.end();
      }
    } else {
      request.end();
    }
  }

  private createRequestOptions(targetUrl: string, options: HttpRequestOptions, agent: http.Agent | https.Agent, bodyContent?: string, formContent?: string) {
    const url = Url.parse(targetUrl);

    const mergedOptions: any = {
      method: options.method || 'get',
      agent,
      hostname: url.hostname,
      port: url.port,
      protocol: url._protocol + ':',
      path: url.pathname + (url.search || ''),
      headers: {
        ...options.headers,
        'accept-encoding': Compression.getSupportedStreams()
      }
    } as https.RequestOptions | http.RequestOptions;

    if (typeof options.followRedirect === "boolean") {
      mergedOptions.followRedirect = options.followRedirect;
    }

    if (options.httpTimeout) {
      mergedOptions.timeout = options.httpTimeout;
    }

    if (options.json) {
      mergedOptions.headers!['content-type'] = CONTENT_TYPE.ApplicationJson;
    }

    if (bodyContent) {
      mergedOptions.headers!['content-type'] = CONTENT_TYPE.ApplicationJson;
    } else if (formContent) {
      mergedOptions.headers!['content-type'] = CONTENT_TYPE.FormUrlEncoded;
    }

    return mergedOptions;
  }
}

export {
  Http
}
