const supra = require("../dist");

const req = supra.request("requestName", "http://localhost:8080", {
  enabled: false,
  method: "get",
  httpTimeout: 1,
  json: true,
});

req
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    console.error(err);
  });
