import { Client } from "../lib/client";
import { Http } from "../lib/http";
import { CONTENT_TYPE } from "../lib/enums";
import { convertRequestToCurl } from "../lib/utils";

// Mock the convertRequestToCurl utility
jest.mock("../lib/utils", () => ({
  convertRequestToCurl: jest.fn().mockReturnValue("curl command"),
}));

describe("Client", () => {
  let client: Client;
  // Create a fake Http instance with a jest mock for its request method
  let fakeHttp: Partial<Http> & { request: jest.Mock };

  beforeEach(() => {
    // Clear static circuits between tests
    Client.circuits.clear();

    fakeHttp = {
      request: jest.fn(),
    };
    client = new Client(fakeHttp as Http);
  });

  test("should resolve with client response without JSON parsing", async () => {
    const fakeResponse = {
      body: "Plain text body",
      response: {
        statusCode: 200,
        headers: {},
      },
    };

    // Provide type annotations to avoid implicit any errors
    fakeHttp.request.mockImplementation(
      (url: string, options: any, callback: (err: Error | null, res?: any) => void) => {
        callback(null, fakeResponse);
      }
    );

    const response = await client.request("testCircuit", "http://example.com", { headers: {} });
    expect(response).toEqual(fakeResponse);
  });

  test("should resolve with parsed JSON when json option is true", async () => {
    const fakeResponse = {
      body: '{"key":"value"}',
      response: {
        statusCode: 200,
        headers: { "content-type": "application/json" },
      },
    };

    fakeHttp.request.mockImplementation(
      (url: string, options: any, callback: (err: Error | null, res?: any) => void) => {
        callback(null, fakeResponse);
      }
    );

    const response = await client.request("testCircuit", "http://example.com", { json: true, headers: {} });
    // Expect the response to contain a parsed json property
    expect(response).toEqual(fakeResponse);
    expect(response.json).toEqual({ key: "value" });
  });

  test("should reject when JSON parsing fails", async () => {
    const fakeResponse = {
      body: "invalid json",
      response: {
        statusCode: 200,
        headers: { "content-type": "application/json" },
      },
    };

    fakeHttp.request.mockImplementation(
      (url: string, options: any, callback: (err: Error | null, res?: any) => void) => {
        callback(null, fakeResponse);
      }
    );

    // Expect the promise to reject due to JSON.parse failure
    await expect(
      client.request("testCircuit", "http://example.com", { json: true, headers: {} })
    ).rejects.toThrow();
  });

  test("should add curl command header if global option flag is set", async () => {
    // Set global options with flag names
    client.setGlobalOptions({
      flagHeaderNameToShowCurlOnResponse: "X-Show-Curl",
      responseHeaderNameForCurl: "X-Curl",
    });

    const fakeResponse = {
      body: "Plain text body",
      response: {
        statusCode: 200,
        headers: {},
      },
    };

    fakeHttp.request.mockImplementation(
      (url: string, options: any, callback: (err: Error | null, res?: any) => void) => {
        callback(null, fakeResponse);
      }
    );

    // Provide a header with the flag so that the curl command is added
    const requestOptions = { headers: { "X-Show-Curl": "true" } };

    const response = await client.request("testCircuit", "http://example.com", requestOptions);
    expect(response.response.headers["X-Curl"]).toBe("curl command");
  });

  test("should reject when http.request returns an error", async () => {
    const error = new Error("Network error");

    fakeHttp.request.mockImplementation(
      (url: string, options: any, callback: (err: Error | null, res?: any) => void) => {
        callback(error, null);
      }
    );

    await expect(client.request("testCircuit", "http://example.com", {})).rejects.toBe(error);
  });

  test("should reject when http.request returns null response", async () => {
    fakeHttp.request.mockImplementation(
      (url: string, options: any, callback: (err: Error | null, res?: any) => void) => {
        callback(null, null);
      }
    );

    await expect(client.request("testCircuit", "http://example.com", {})).rejects.toBeNull();
  });
});
