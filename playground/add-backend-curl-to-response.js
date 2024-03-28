const supra = require("../dist");

// Add the following code to the gateway startup file
supra.setGlobalOptions({
  flagHeaderNameToShowCurlOnResponse: "x-show-curl",
  responseHeaderNameForCurl: "x-request-curl",
});

(async () => {
  const request = await supra.request("PLACEHOLDER", "https://dummyjson.com/posts/add", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      // Add the following header for the request to show the curl in the response
      "x-show-curl": "true",
    },
    body: JSON.stringify({
      title: "I am in love with someone.",
      userId: 5,
    }),
  });

  const { response } = request;

  console.log("[DEBUG] Response Headers:", response.headers);
})();
