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
var http_1 = require("http");
var https_1 = require("https");
var compression_1 = require("./compression");
var enums_1 = require("./enums");
var Http = /** @class */ (function () {
    function Http() {
        this.httpAgent = new http_1["default"].Agent({
            keepAlive: true
        });
        this.httpsAgent = new https_1["default"].Agent({
            keepAlive: true
        });
    }
    Http.prototype.request = function (url, requestOptions) {
        var requestBody = typeof requestOptions.body === "object" ?
            JSON.stringify(requestOptions.body) :
            typeof requestOptions.body === "string" ?
                requestOptions.body : undefined;
        var options = this.createRequestOptions(url, requestOptions, requestBody);
        return new Promise(function (resolve) {
            var request = http_1["default"].request(url, options, function (response) {
                compression_1.Compression.handle(response)
                    .then(function (body) { return resolve({
                    body: body,
                    response: response
                }); });
            });
            if (requestBody) {
                request.write(requestBody);
            }
            request.end();
        });
    };
    Http.prototype.createRequestOptions = function (url, options, bodyContent) {
        var agent = url.startsWith('https') ? this.httpsAgent : this.httpAgent;
        var mergedOptions = {
            method: options.method || 'get',
            agent: agent,
            headers: __assign(__assign({}, options.headers), { 'accept-encoding': compression_1.Compression.getSupportedStreams() })
        };
        if (options.json) {
            mergedOptions.headers['content-type'] = enums_1.CONTENT_TYPE.ApplicationJson;
        }
        if (bodyContent) {
            mergedOptions.headers['content-length'] = bodyContent.length;
            mergedOptions.headers['content-type'] = enums_1.CONTENT_TYPE.ApplicationJson;
        }
        return mergedOptions;
    };
    return Http;
}());
exports.Http = Http;
