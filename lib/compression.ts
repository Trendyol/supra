import zlib from "zlib";
import * as http from "http";

class Compression {
  private static decompressStream(res: http.IncomingMessage, handlerStream?: zlib.BrotliDecompress | zlib.Gunzip): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer: string = '';
      const stream = handlerStream || res;

      stream.on('data', bufferChunk => {
        buffer += bufferChunk;
      });

      stream.on('error', err => {
        reject(err);
      });

      stream.on('end', (_: void) => {
        resolve(buffer);
      });

      if (handlerStream) {
        res.pipe(handlerStream);
      }
    })
  }

  static handle(res: http.IncomingMessage): Promise<string> {
    const encoding = res.headers["content-encoding"];
    if (encoding === 'gzip') return Compression.decompressStream(res, zlib.createGunzip());
    if (encoding === 'br') return Compression.decompressStream(res, zlib.createBrotliDecompress());
    return Compression.decompressStream(res);
  }

  static getSupportedStreams() {
    return 'gzip, deflate, br';
  }
}

export {
  Compression
}
