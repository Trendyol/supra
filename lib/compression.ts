import zlib from "zlib";
import * as http from "http";

class Compression {
  private static decompressStream(res: http.IncomingMessage, cb: (err: Error | null, body?: string) => void, handlerStream?: zlib.BrotliDecompress | zlib.Gunzip): void {
    const buffer: Uint8Array[] =[];
    const stream = handlerStream || res;

    stream.on('data', bufferChunk => {
      buffer.push(bufferChunk);
    });
  
    stream.on('error', err => {
      cb(err);
    });

    stream.on('end', (_: void) => {
      const fullBuffer = Buffer.concat(buffer);
      cb(null, fullBuffer.toString('utf8'));
    });
    
    if (handlerStream) {
      res.pipe(handlerStream);
    }
  }

  static compressBody(text: string, cb: (err: Error | null, data: Buffer) => void): void {
    const buf = Buffer.from(text, 'utf8');
    zlib.gzip(buf, (err, data) => {
      cb(err, data);
    });
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
