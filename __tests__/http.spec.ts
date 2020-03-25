import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {Http} from "../lib/http";
import http from "http";
import https from "https";
import {Compression} from "../lib/compression";
import {stringify} from "querystring";

const URL = require('fast-url-parser');

const sandbox = sinon.createSandbox();
let httpInstance: Http;


describe('[http.ts]', () => {
  const createRequestOptions = (url: string, options?: object, compressionError: string | null = null, timeout: boolean = false) => {
    const requestInstance = {
      end: () => {
      },
      write: () => {
      },
      on: () => {
      },
      abort: () => {
      }
    };
    const mock: any = {
      url,
      requestOptions: {...options},
      response: {},
      requestInstance,
      requestInstanceMock: sandbox.mock(requestInstance) as sinon.SinonMock,
      responseBody: faker.random.word(),
      supportedTypes: faker.random.word(),
    };

    if (!timeout) {
      mock.requestStub = sandbox.stub(url.startsWith('https') ? https : http, 'request').callsArgWith(1, mock.response).returns(mock.requestInstance as any);
    } else {
      mock.requestStub = sandbox.stub(url.startsWith('https') ? https : http, 'request').returns(mock.requestInstance as any)
    }

    if (compressionError) {
      mock.compressionStub = sandbox.stub(Compression, 'handle').callsArgWith(1, compressionError);
    } else {
      mock.compressionStub = sandbox.stub(Compression, 'handle').callsArgWith(1, null, mock.responseBody);
    }


    mock.compressionSupportedStreamsStub = sandbox.stub(Compression, 'getSupportedStreams').returns(mock.supportedTypes);

    return mock;
  };

  beforeEach(() => {
    httpInstance = new Http()
  });


  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new Http', () => {
    // Arrange
    const http = new Http();

    // Assert
    expect(http).to.be.instanceOf(Http);
  });

  it('should send get request with default options for http', () => {
    // Arrange
    const mocks = createRequestOptions('http://m.trendyol.com');
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      port: null,
      protocol: url._protocol + ':',
      method: 'get',
      agent: httpInstance.httpAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });

  it('should send get request with default options for http (compression error)', () => {
    // Arrange
    const error = faker.random.word();
    const mocks = createRequestOptions('http://m.trendyol.com', undefined, error);
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      port: null,
      protocol: url._protocol + ':',
      method: 'get',
      agent: httpInstance.httpAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(error)).to.eq(true);
  });

  it('should send get request with default options for https', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com');
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      method: 'get',
      port: null,
      protocol: url._protocol + ':',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });

  it('should send get request with default options for https with json parsing', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      json: true
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url._protocol + ':',
      method: 'get',
      port: null,
      agent: httpInstance.httpsAgent,
      headers: {
        'content-type': 'application/json',
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });

  it('should send get request with default options for https with disabled follow redirect', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      followRedirect: false
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url._protocol + ':',
      method: 'get',
      port: null,
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes
      },
      followRedirect: false
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });


  it('should send post(form) request with default options for https', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      method: 'post',
      form: {
        test: 5
      }
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('write').withArgs(stringify(mocks.requestOptions.form)).once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      protocol: url._protocol + ':',
      path: url.pathname,
      port: null,
      method: 'post',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes,
        'content-length': Buffer.byteLength(stringify(mocks.requestOptions.form)),
        'content-type': 'application/x-www-form-urlencoded'
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });

  it('should send post request with default options for https', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      method: 'post',
      body: {
        test: 5
      }
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('write').withArgs(JSON.stringify(mocks.requestOptions.body)).once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      protocol: url._protocol + ':',
      path: url.pathname,
      port: null,
      method: 'post',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes,
        'content-length': Buffer.byteLength(JSON.stringify(mocks.requestOptions.body)),
        'content-type': 'application/json'
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });

  it('should send post request with default options for https without object', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      method: 'post',
      body: faker.random.word()
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('write').withArgs(mocks.requestOptions.body).once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions as any, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url._protocol + ':',
      port: null,
      method: 'post',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes,
        'content-length': Buffer.byteLength(mocks.requestOptions.body),
        'content-type': 'application/json'
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });

  it('should send post(form) request with default options for https without object', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      method: 'post',
      form: faker.random.word()
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('write').withArgs(mocks.requestOptions.form).once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions as any, cbStub);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any, sinon.match.func)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url._protocol + ':',
      port: null,
      method: 'post',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes,
        'content-length': Buffer.byteLength(mocks.requestOptions.form),
        'content-type': 'application/x-www-form-urlencoded'
      }
    }, sinon.match.func)).to.eq(true);
    expect(cbStub.calledWith(null, {
      body: mocks.responseBody,
      response: mocks.response
    })).to.eq(true);
  });

  it('should send get request with default options for https with json parsing timeout', (done) => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      json: true,
      httpTimeout: 20
    }, null, true);
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).returnsThis();
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('abort').callsFake((_: any) => {
      cbStub(true);
    });

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
    setTimeout(() => {
      expect(mocks.requestStub.calledOnce).to.eq(true);
      expect(mocks.requestStub.calledWith({
        hostname: url.hostname,
        path: url.pathname,
        protocol: url._protocol + ':',
        method: 'get',
        timeout: 20,
        port: null,
        agent: httpInstance.httpsAgent,
        headers: {
          'content-type': 'application/json',
          'accept-encoding': mocks.supportedTypes
        }
      }, sinon.match.func)).to.eq(true);
      expect(cbStub.calledWith(true)).to.eq(true);
      done();
    }, 300);
  });

  it('Deletes timeout when error', (done) => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      json: true
    }, null, true);
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func).callsArgWith(1, true);
    mocks.requestInstanceMock.expects('end').once();

    const cbStub = sandbox.stub();

    // Act
    httpInstance.request(mocks.url, mocks.requestOptions, cbStub);

    // Assert
      expect(mocks.requestStub.calledOnce).to.eq(true);
      expect(mocks.requestStub.calledWith({
        hostname: url.hostname,
        path: url.pathname,
        protocol: url._protocol + ':',
        method: 'get',
        port: null,
        agent: httpInstance.httpsAgent,
        headers: {
          'content-type': 'application/json',
          'accept-encoding': mocks.supportedTypes
        }
      }, sinon.match.func)).to.eq(true);
      expect(cbStub.calledWith(true)).to.eq(true);
      done();
  });
});
