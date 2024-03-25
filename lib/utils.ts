import { HttpRequestOptions } from "./types";

export const generateCurl = (
  url: string,
  requestOptions: HttpRequestOptions
) => {
  const headersText = Object.entries(requestOptions.headers || {})
    .map((header) => `-H '${header[0]}: ${header[1]}'`)
    .join(" ");

  return `curl -X '${
    requestOptions.method
  }' ${headersText} '${url}' --data '${JSON.stringify(
    requestOptions.body
  )}'`.replace(/\\/g, "");
};
