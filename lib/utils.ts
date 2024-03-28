import { HttpRequestOptions } from "./types";

export const convertRequestToCurl = (url: string, requestOptions: HttpRequestOptions) => {
  const headersText = Object.entries(requestOptions.headers || {})
    .map(([key, value]) => `-H '${key}: ${value}'`)
    .join(" ");
  const bodyText = requestOptions.body ? `--data '${JSON.stringify(requestOptions.body)}'`.replace(/\\/g, "") : "";

  return `curl -X '${requestOptions.method}' ${headersText} '${url}' ${bodyText}`;
};

// Example output:
// curl -X 'post' -H 'Content-Type: application/json' -H 'x-show-curl: true' 'https://dummyjson.com/posts/add' --data '"{"title":"Test.","userId":5}"'
