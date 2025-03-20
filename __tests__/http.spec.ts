import { Http } from "../lib/http";
import { request as undiciRequest } from "undici";
import { Compression } from "../lib/compression";
import zlib from "zlib";

// Assume that CONTENT_TYPE values are as follows:
const CONTENT_TYPE = {
  ApplicationJson: "application/json",
  FormUrlEncoded: "application/x-www-form-urlencoded",
};

jest.mock("undici", () => ({
  request: jest.fn(),
}));

jest.mock("../lib/compression", () => ({
  Compression: {
    compressBody: jest.fn(),
    getSupportedStreams: jest.fn(() => "gzip, deflate"),
  },
}));

jest.mock("zlib", () => ({
  gunzipSync: jest.fn(),
  brotliDecompressSync: jest.fn(),
}));

describe("../lib/http", () => {
  let http: Http;

  beforeEach(() => {
    http = new Http();
    (undiciRequest as jest.Mock).mockReset();
    (Compression.compressBody as jest.Mock).mockReset();
    (zlib.gunzipSync as jest.Mock).mockReset();
    (zlib.brotliDecompressSync as jest.Mock).mockReset();
  });

  test("Should return a successful response for a GET request without a body", (done) => {
    const fakeResponse = {
      statusCode: 200,
      headers: {},
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("Hello, world!");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);

    http.request("http://example.com", { method: "GET" }, (err, clientResponse) => {
      expect(err).toBeNull();
      expect(clientResponse).toEqual({
        body: "Hello, world!",
        response: {
          statusCode: 200,
          headers: {},
        },
      });
      done();
    });
  });

  test("Should successfully decompress a response encoded with Gzip", (done) => {
    const fakeResponse = {
      statusCode: 200,
      headers: { "content-encoding": "gzip" },
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("compressed data");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);
    (zlib.gunzipSync as jest.Mock).mockReturnValue(Buffer.from("Decompressed text"));

    http.request("http://example.com", { method: "GET" }, (err, clientResponse) => {
      expect(err).toBeNull();
      expect(zlib.gunzipSync).toHaveBeenCalled();
      expect(clientResponse).toEqual({
        body: "Decompressed text",
        response: {
          statusCode: 200,
          headers: { "content-encoding": "gzip" },
        },
      });
      done();
    });
  });

  test("Should successfully decompress a response encoded with Brotli", (done) => {
    const fakeResponse = {
      statusCode: 200,
      headers: { "content-encoding": "br" },
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("compressed data");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);
    (zlib.brotliDecompressSync as jest.Mock).mockReturnValue(Buffer.from("Brotli decompressed"));

    http.request("http://example.com", { method: "GET" }, (err, clientResponse) => {
      expect(err).toBeNull();
      expect(zlib.brotliDecompressSync).toHaveBeenCalled();
      expect(clientResponse).toEqual({
        body: "Brotli decompressed",
        response: {
          statusCode: 200,
          headers: { "content-encoding": "br" },
        },
      });
      done();
    });
  });

  test("Should correctly handle a POST request with a JSON body", (done) => {
    const fakeResponse = {
      statusCode: 201,
      headers: {},
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("Created");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);

    const requestOptions = {
      method: "POST",
      body: { key: "value" },
      json: true,
    };

    http.request("http://example.com", requestOptions, (err, clientResponse) => {
      expect(err).toBeNull();
      expect(clientResponse).toEqual({
        body: "Created",
        response: {
          statusCode: 201,
          headers: {},
        },
      });
      // Check the headers in the undiciRequest call
      const calledArgs = (undiciRequest as jest.Mock).mock.calls[0][1];
      expect(calledArgs.headers["content-type"]).toBe(CONTENT_TYPE.ApplicationJson);
      done();
    });
  });

  test("If compressRequest is true, the request body should be compressed with gzip", (done) => {
    const fakeResponse = {
      statusCode: 200,
      headers: {},
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("Response");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);

    const requestOptions = {
      method: "POST",
      body: "Test body",
      compressRequest: true,
    };

    // Simulate a successful compression scenario
    (Compression.compressBody as jest.Mock).mockImplementation((body, callback) => {
      callback(null, Buffer.from("Compressed body"));
    });

    http.request("http://example.com", requestOptions, (err, clientResponse) => {
      expect(err).toBeNull();
      expect(clientResponse).toEqual({
        body: "Response",
        response: {
          statusCode: 200,
          headers: {},
        },
      });
      const calledArgs = (undiciRequest as jest.Mock).mock.calls[0][1];
      expect(calledArgs.body.toString()).toBe("Compressed body");
      expect(calledArgs.headers["content-encoding"]).toBe("gzip");
      done();
    });
  });

  test("If compression fails, the request should be sent with the original body", (done) => {
    const fakeResponse = {
      statusCode: 200,
      headers: {},
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("Response");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);

    const requestOptions = {
      method: "POST",
      body: "Test body",
      compressRequest: true,
    };

    // Simulate a compression failure
    (Compression.compressBody as jest.Mock).mockImplementation((body, callback) => {
      callback(new Error("Compression failed"), null);
    });

    http.request("http://example.com", requestOptions, (err, clientResponse) => {
      expect(err).toBeNull();
      expect(clientResponse).toEqual({
        body: "Response",
        response: {
          statusCode: 200,
          headers: {},
        },
      });
      const calledArgs = (undiciRequest as jest.Mock).mock.calls[0][1];
      expect(calledArgs.body).toBe("Test body");
      expect(calledArgs.headers["content-encoding"]).toBeUndefined();
      done();
    });
  });

  test("Callback should return an error when undiciRequest fails", (done) => {
    const error = new Error("Network error");
    (undiciRequest as jest.Mock).mockRejectedValue(error);

    http.request("http://example.com", { method: "GET" }, (err, clientResponse) => {
      expect(err).toBe(error);
      expect(clientResponse).toBeUndefined();
      done();
    });
  });

  test("Callback should return an error when decompression fails", (done) => {
    const fakeResponse = {
      statusCode: 200,
      headers: { "content-encoding": "gzip" },
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("data");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);
    (zlib.gunzipSync as jest.Mock).mockImplementation(() => {
      throw new Error("Decompression error");
    });

    http.request("http://example.com", { method: "GET" }, (err, clientResponse) => {
      expect(err).toBeInstanceOf(Error);
      expect(err?.message).toBe("Decompression error");
      expect(clientResponse).toBeUndefined();
      done();
    });
  });

  test("When form data is sent, the content-type should be set to application/x-www-form-urlencoded", (done) => {
    const fakeResponse = {
      statusCode: 200,
      headers: {},
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("Form response");
        },
      },
    };

    (undiciRequest as jest.Mock).mockResolvedValue(fakeResponse);

    const requestOptions = {
      method: "POST",
      form: { key: "value" },
    };

    http.request("http://example.com", requestOptions, (err, clientResponse) => {
      expect(err).toBeNull();
      expect(clientResponse).toEqual({
        body: "Form response",
        response: {
          statusCode: 200,
          headers: {},
        },
      });
      const calledArgs = (undiciRequest as jest.Mock).mock.calls[0][1];
      expect(calledArgs.headers["content-type"]).toBe(CONTENT_TYPE.FormUrlEncoded);
      done();
    });
  });
});
