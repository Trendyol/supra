"use strict";
exports.__esModule = true;
var client_1 = require("./client");
var http_1 = require("./http");
var http = new http_1.Http();
var client = new client_1.Client(http);
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
    .then(function (response) { return console.log(response.json); })["catch"](function (_) { return console.log(_); });
