import zlib from "zlib";
import * as http from "http";

class Compression {
  private static decompressStream(res: http.IncomingMessage, cb: (err: Error | null, body?: string) => void, handlerStream?: zlib.BrotliDecompress | zlib.Gunzip): void {
    let buffer: string = '';
    const stream = handlerStream || res;

    stream.on('data', bufferChunk => {
      buffer += bufferChunk;
    });

    stream.on('error', err => {
      cb(err);
    });

    stream.on('end', (_: void) => {
      cb(null, buffer);
    });

    if (handlerStream) {
      res.pipe(handlerStream);
    }
  }

  static handle(res: http.IncomingMessage, cb: (err: Error | null, body?: string) => void): void {
    const encoding = res.headers["content-encoding"];

    if (encoding === 'gzip') {
      Compression.decompressStream(res, cb, zlib.createGunzip());
    } else if (encoding === 'br') {
      Compression.decompressStream(res, cb, zlib.createBrotliDecompress());
    } else {
      Compression.decompressStream(res, cb);
    }
  }

  static getSupportedStreams() {
    return 'gzip, deflate, br';
  }
}

export {
  Compression
}
