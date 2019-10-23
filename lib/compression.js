"use strict";
exports.__esModule = true;
var zlib_1 = require("zlib");
var Compression = /** @class */ (function () {
    function Compression() {
    }
    Compression.decompressStream = function (res, handlerStream) {
        return new Promise(function (resolve, reject) {
            var buffer = '';
            var stream = handlerStream || res;
            stream.on('data', function (bufferChunk) {
                buffer += bufferChunk;
            });
            stream.on('error', function (err) {
                reject(err);
            });
            stream.on('end', function (_) {
                resolve(buffer);
            });
            if (handlerStream) {
                res.pipe(handlerStream);
            }
        });
    };
    Compression.handle = function (res) {
        var encoding = res.headers["content-encoding"];
        if (encoding === 'gzip')
            return Compression.decompressStream(res, zlib_1["default"].createGunzip());
        if (encoding === 'br')
            return Compression.decompressStream(res, zlib_1["default"].createBrotliDecompress());
        return Compression.decompressStream(res);
    };
    Compression.getSupportedStreams = function () {
        return 'gzip, deflate, br';
    };
    return Compression;
}());
exports.Compression = Compression;
