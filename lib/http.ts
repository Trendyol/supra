import { request as undiciRequest } from "undici";
import { Compression } from "./compression";
import { ClientResponse, HttpRequestOptions } from "./types";
import { CONTENT_TYPE } from "./enums";
import { stringify } from "querystring";
import zlib from "zlib";

export class Http {
  /**
   * Executes an HTTP request using Undici.
   *
   * @param url - The request URL.
   * @param requestOptions - Options for the HTTP request.
   * @param cb - Callback function returning either an error or the client response.
   */
  request(
    url: string,
    requestOptions: HttpRequestOptions,
    cb: (err: null | Error, clientResponse?: ClientResponse) => void
  ): void {
    // Prepare request body (JSON stringified or raw string)
    const requestBody =
      typeof requestOptions.body === "object"
        ? JSON.stringify(requestOptions.body)
        : typeof requestOptions.body === "string"
        ? requestOptions.body
        : undefined;

    // Prepare form data if no body is present
    const requestFormContent =
      !requestBody && requestOptions.form
        ? typeof requestOptions.form === "object"
          ? stringify(requestOptions.form)
          : typeof requestOptions.form === "string"
          ? requestOptions.form
          : undefined
        : undefined;

    // Prepare request headers with compression support
    const headers: Record<string, string> = {
      ...requestOptions.headers,
      "accept-encoding": Compression.getSupportedStreams(),
    };

    // Set Content-Type based on provided options and body content
    if (requestOptions.json || requestBody) {
      headers["content-type"] = CONTENT_TYPE.ApplicationJson;
    } else if (requestFormContent) {
      headers["content-type"] = CONTENT_TYPE.FormUrlEncoded;
    }

    const writableContent = requestBody || requestFormContent;

    /**
     * Performs the actual HTTP request using Undici.
     *
     * @param bodyToSend - The request payload as a Buffer or string.
     */
    const doRequest = (bodyToSend: Buffer | string | undefined) => {
      // Set Content-Length header if a payload is provided
      if (bodyToSend) {
        headers["content-length"] = Buffer.isBuffer(bodyToSend)
          ? String(bodyToSend.byteLength)
          : String(Buffer.byteLength(bodyToSend));
      }

      const method = (requestOptions.method || "GET").toUpperCase();
      const maxRedirections = requestOptions.followRedirect ? 10 : 0;
      const timeoutValue = requestOptions.httpTimeout || 30000; // Default timeout: 30 seconds

      undiciRequest(url, {
        method,
        headers,
        body: bodyToSend,
        maxRedirections,
        bodyTimeout: timeoutValue,
      })
        .then(async (res) => {
          const { statusCode, headers: resHeaders, body } = res;
          const chunks: Buffer[] = [];

          // Collect response body chunks into a complete Buffer
          for await (const chunk of body) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const fullBuffer = Buffer.concat(chunks);

          // Normalize the "content-encoding" header (may be an array)
          const encodingValue = resHeaders["content-encoding"];
          const contentEncoding = Array.isArray(encodingValue)
            ? encodingValue[0]
            : encodingValue || "";
          const ceLower = contentEncoding.toLowerCase();

          let decoded: string;
          try {
            if (ceLower === "gzip") {
              decoded = zlib.gunzipSync(fullBuffer).toString("utf8");
            } else if (ceLower === "br") {
              decoded = zlib.brotliDecompressSync(fullBuffer).toString("utf8");
            } else {
              decoded = fullBuffer.toString("utf8");
            }
          } catch (err) {
            return cb(err as Error);
          }

          const clientResponse: ClientResponse = {
            body: decoded,
            response: {
              statusCode,
              headers: resHeaders,
            },
          };

          cb(null, clientResponse);
        })
        .catch((err) => {
          cb(err);
        });
    };

    // If compression is enabled, compress the request payload using gzip
    if (writableContent && requestOptions.compressRequest) {
      Compression.compressBody(writableContent, (err, buffer) => {
        if (err || !buffer) {
          doRequest(writableContent);
        } else {
          headers["content-encoding"] = "gzip";
          doRequest(buffer);
        }
      });
    } else {
      doRequest(writableContent);
    }
  }
}
