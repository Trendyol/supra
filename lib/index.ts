import {Client} from "./client";
import {Http} from "./http";
import {createServer} from "http";

const request2 = require("requestretry");

const express = require('express');

const app = express();
const http = new Http();
const client = new Client(http);


app.get('/hystrix.stream', Client.metricsStream);
app.get('/yey', (req: any, res: any) => {
  client.request('browsingConfigurationRequest', 'https://api.trendyol.com/mwebbrowsinggw/', {
    timeout: 300,
    allowWarmUp: true,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
    enabled: false
  })
    .then(response => res.end(response.body))
    .catch(_ => res.status(500).send('Failed'))
});


app.listen(8080);


