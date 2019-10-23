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

    requestMock
      .expects('pipe')
      .withArgs(decompressStream);

    decompressMock
      .expects('on')
      .withArgs('data', sinon.match.func)
      .callsArgWith(1, decompressionText);

    decompressMock
      .expects('on')
      .withArgs('error', sinon.match.func);

    decompressMock
      .expects('on')
      .withArgs('end', sinon.match.func)
      .callsArg(1);

    sandbox.stub(zlib, 'createGunzip').returns(decompressStream as any);

    // Act
    const decompressed = await Compression.handle(request);

    // Assert
    expect(decompressed).to.eq(decompressionText);
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

    requestMock
      .expects('pipe')
      .withArgs(decompressStream);

    decompressMock
      .expects('on')
      .withArgs('data', sinon.match.func)
      .callsArgWith(1, decompressionText);

    decompressMock
      .expects('on')
      .withArgs('error', sinon.match.func);

    decompressMock
      .expects('on')
      .withArgs('end', sinon.match.func)
      .callsArg(1);

    sandbox.stub(zlib, 'createBrotliDecompress').returns(decompressStream as any);

    // Act
    const decompressed = await Compression.handle(request);

    // Assert
    expect(decompressed).to.eq(decompressionText);
  });

  it('should return stream content without decompression', async () => {
    // Arrange
    const decompressionText = faker.random.word();
    const request = createRequest() as any;
    const requestMock = sandbox.mock(request);


    requestMock
      .expects('on')
      .withArgs('data', sinon.match.func)
      .callsArgWith(1, decompressionText);

    requestMock
      .expects('on')
      .withArgs('error', sinon.match.func);

    requestMock
      .expects('on')
      .withArgs('end', sinon.match.func)
      .callsArg(1);

    // Act
    const decompressed = await Compression.handle(request);

    // Assert
    expect(decompressed).to.eq(decompressionText);
  });

  it('should return reject when stream failed', (done) => {
    // Arrange
    const decompressionText = faker.random.word();
    const request = createRequest() as any;
    const requestMock = sandbox.mock(request);
    const error = faker.random.word();

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
      .handle(request)
      .then(_ => done('Failed to throw'))
      .catch(_ => done());
  });

  it('should return supported content encoding types', () => {
    // Act
    const types = Compression.getSupportedStreams();

    // Assert
    expect(types).to.be.a('string');
  });
});
