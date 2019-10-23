import {Client} from "./client";
import {Http} from "./http";

const http = new Http();
const client = new Client(http);


client.request('browsingConfigurationRequest', 'https://postman-echo.com/get?test=5', {
  timeout: 300,
  allowWarmUp: true,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
  enabled: false,
  method: 'get',
  body: {
    test: 44
  },
  json: true
})
  .then(response => console.log(response.json))
  .catch(_ => console.log(_));




