"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var opossum_1 = require("opossum");
var opossum_hystrix_1 = require("opossum-hystrix");
var enums_1 = require("./enums");
var Client = /** @class */ (function () {
    function Client(http) {
        this.http = http;
    }
    Client.metricsStream = function (_, response) {
        response.writeHead(200, {
            'content-type': enums_1.CONTENT_TYPE.TextEventStream,
            'cache-control': enums_1.CACHE_CONTROL.NoCache,
            'connection': enums_1.CONNECTION.KeepAlive
        });
        response.write('retry: 10000\n');
        response.write('event: connecttime\n');
        opossum_hystrix_1["default"]
            .stream
            .pipe(response);
    };
    Client.prototype.request = function (name, url, options) {
        var circuit = Client.circuits.get(name) || this.createCircuit(name, options);
        return circuit
            .fire(url, options);
    };
    Client.prototype.createCircuit = function (name, options) {
        var _this = this;
        var requestSender = function (url, requestOptions) {
            return _this.http
                .request(url, requestOptions)
                .then(function (res) { return (__assign(__assign({}, res), { json: options && options.json && res.body ? JSON.parse(res.body) : {} })); });
        };
        var circuit = new opossum_1["default"](requestSender, __assign({ name: name }, options));
        Client.reporter.add(circuit);
        Client.circuits.set(name, circuit);
        return circuit;
    };
    Client.circuits = new Map();
    Client.reporter = new opossum_hystrix_1["default"]([]);
    return Client;
}());
exports.Client = Client;
