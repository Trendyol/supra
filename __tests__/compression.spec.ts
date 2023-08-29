import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {Compression} from "../lib/compression";
import zlib from "zlib";

const sandbox = sinon.createSandbox();
let compression: Compression;

describe('[compression.ts]', () => {
  const createRequest = (headers?: object) => ({
    pipe: () => {
    },
    on: () => {
    },
    headers: {...headers}
  });
  const createDecompressStream = () => ({
    on: () => {
    }
  });

  beforeEach(() => {
    compression = new Compression()
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new Compression', () => {
    // Arrange
    const compression = new Compression();

    // Assert
    expect(compression).to.be.instanceOf(Compression);
  });

  it('should decompress gzip', async () => {
    // Arrange
    const decompressionText = faker.random.word();
    const request = createRequest({
      'content-encoding': 'gzip'
    }) as any;
    const requestMock = sandbox.mock(request);
    const decompressStream = createDecompressStream();
    const decompressMock = sandbox.mock(decompressStream);

    const responseStub = sandbox.stub();

    requestMock
      .expects('pipe')
      .withArgs(decompressStream);

    decompressMock
      .expects('on')
      .withArgs('data', sinon.match.func)
      .callsArgWith(1,  Buffer.from(decompressionText));

    decompressMock
      .expects('on')
      .withArgs('error', sinon.match.func);

    decompressMock
      .expects('on')
      .withArgs('end', sinon.match.func)
      .callsArg(1);

    sandbox.stub(zlib, 'createGunzip').returns(decompressStream as any);

    // Act
    await Compression.handle(request, responseStub);

    // Assert
    expect(responseStub.calledWithExactly(null, decompressionText)).to.eq(true);
  });

  it('should decompress brotli', async () => {
    // Arrange
    const decompressionText = faker.random.word();
    const request = createRequest({
      'content-encoding': 'br'
    }) as any;
    const requestMock = sandbox.mock(request);
    const decompressStream = createDecompressStream();
    const decompressMock = sandbox.mock(decompressStream);

    const responseStub = sandbox.stub();

    requestMock
      .expects('pipe')
      .withArgs(decompressStream);

    decompressMock
      .expects('on')
      .withArgs('data', sinon.match.func)
      .callsArgWith(1, Buffer.from(decompressionText));

    decompressMock
      .expects('on')
      .withArgs('error', sinon.match.func);

    decompressMock
      .expects('on')
      .withArgs('end', sinon.match.func)
      .callsArg(1);

    sandbox.stub(zlib, 'createBrotliDecompress').returns(decompressStream as any);

    // Act
    Compression.handle(request, responseStub);

    // Assert
    expect(responseStub.calledWithExactly(null, decompressionText)).to.eq(true);
  });

  it('should return stream content without decompression', async () => {
    // Arrange
    const decompressionText = faker.random.word();
    const request = createRequest() as any;
    const requestMock = sandbox.mock(request);

    const responseStub = sandbox.stub();

    requestMock
      .expects('on')
      .withArgs('data', sinon.match.func)
      .callsArgWith(1,  Buffer.from(decompressionText));

    requestMock
      .expects('on')
      .withArgs('error', sinon.match.func);

    requestMock
      .expects('on')
      .withArgs('end', sinon.match.func)
      .callsArg(1);

    // Act
    Compression.handle(request, responseStub);

    // Assert
    expect(responseStub.calledWithExactly(null, decompressionText)).to.eq(true);
  });

  it('should return reject when stream failed', () => {
    // Arrange
    const request = createRequest() as any;
    const requestMock = sandbox.mock(request);
    const error = faker.random.word();

    const responseStub = sandbox.stub();

    requestMock
      .expects('on')
      .withArgs('data', sinon.match.func);

    requestMock
      .expects('on')
      .withArgs('error', sinon.match.func)
      .callsArgWith(1, error);

    requestMock
      .expects('on')
      .withArgs('end', sinon.match.func)
      .callsArg(1);

    // Act
    Compression
      .handle(request, responseStub);

    expect(responseStub.calledWithExactly(error)).to.eq(true);

  });

  it('should return supported content encoding types', () => {
    // Act
    const types = Compression.getSupportedStreams();

    // Assert
    expect(types).to.be.a('string');
  });

  it('should compress request body', (done) => {
    // Arrange
    const compressionText = Math.random().toString();
    const unzippedBuffer = Buffer.from(compressionText, 'utf8');
    const zippedBuffer = Buffer.from(Math.random().toString(), 'utf8');
    const gzipStub = sandbox.stub(zlib, 'gzip')
      .callsArgWith(1, undefined, zippedBuffer)
      .callsFake(() => done());
    const stub = sandbox.stub();

    // Act
    Compression.compressBody(compressionText, stub);

    // Assert
    expect(stub.calledWithExactly(undefined, zippedBuffer)).to.eq(true);
    expect((gzipStub as any).calledWithExactly(unzippedBuffer, sinon.match.func as any)).to.eq(true);
  });

});
