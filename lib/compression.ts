import zlib from "zlib";
import * as http from "http";

class Compression {
  static decompressGzip(res: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer: string = '';
      const gunzip = zlib.createGunzip();

      gunzip.on('data', bufferChunk => {
        buffer += bufferChunk
      });

      gunzip.on('error', err => {
        reject(err);
      });

      gunzip.on('end', (_: void) => {
        resolve(buffer);
      });

      res.pipe(gunzip);
    });
  }

  static decompressBrotli(res: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer: string = '';
      const stream = zlib.createBrotliDecompress();

      stream.on('data', bufferChunk => {
        buffer += bufferChunk;
      });

      stream.on('error', err => {
        reject(err);
      });

      stream.on('end', (_: void) => {
        resolve(buffer);
      });

      res.pipe(stream);
    })
  }

  static noCompression(res: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer: string = '';

      res.on('data', bufferChunk => {
        buffer += bufferChunk;
      });

      res.on('error', err => {
        reject(err);
      });

      res.on('end', (_: void) => {
        resolve(buffer);
      });
    })
  }

  static handle(res: http.IncomingMessage): Promise<string> {
    const encoding = res.headers["content-encoding"];
    if (encoding === 'gzip') return Compression.decompressGzip(res);
    if (encoding === 'br') return Compression.decompressBrotli(res);
    return Compression.noCompression(res);
  }

  static getSupportedStreams() {
    return 'gzip, deflate, br';
  }
}

export {
  Compression
}
