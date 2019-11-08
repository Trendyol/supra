import {Client} from "./client";
import {Http} from "./http";

const http = new Http();
const client = new Client(http);

client.request('requestName', 'https://m.trendyol.com', {
  enabled: true,
  allowWarmUp: true,
  httpTimeout: 1000,
  json: true
})
  .then(res => {
    console.log(typeof res.body)
  })
  .catch(err => {
    console.log('err', err);
  });

export = client;
