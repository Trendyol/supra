import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {Http} from "../lib/http";
import http from "http";
import https from "https";
import {Compression} from "../lib/compression";
import {SinonMock} from "sinon";

const URL = require('fast-url-parser');

const sandbox = sinon.createSandbox();
let httpInstance: Http;


describe('[http.ts]', () => {
  const createRequestOptions = (url: string, options?: object) => {
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

    mock.requestStub = sandbox.stub(url.startsWith('https') ? https : http, 'request').callsArgWith(1, mock.response).returns(mock.requestInstance as any);
    mock.compressionStub = sandbox.stub(Compression, 'handle').resolves(mock.responseBody);
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

  it('should send get request with default options for http', async () => {
    // Arrange
    const mocks = createRequestOptions('http://m.trendyol.com');
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('timeout', sinon.match.func);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func);
    mocks.requestInstanceMock.expects('end').once();


    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url._protocol + ':',
      method: 'get',
      agent: httpInstance.httpAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(finalResponse).to.deep.eq({
      body: mocks.responseBody,
      response: mocks.response
    });
  });

  it('should send get request with default options for https', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com');
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('timeout', sinon.match.func);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func);
    mocks.requestInstanceMock.expects('end').once();

    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      method: 'get',
      protocol: url._protocol + ':',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(finalResponse).to.deep.eq({
      body: mocks.responseBody,
      response: mocks.response
    });
  });

  it('should send get request with default options for https with json parsing', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      json: true
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('timeout', sinon.match.func);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func);
    mocks.requestInstanceMock.expects('end').once();

    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url._protocol + ':',
      method: 'get',
      agent: httpInstance.httpsAgent,
      headers: {
        'content-type': 'application/json',
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(finalResponse).to.deep.eq({
      body: mocks.responseBody,
      response: mocks.response
    });
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
    mocks.requestInstanceMock.expects('on').withArgs('timeout', sinon.match.func);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func);
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('write').withArgs(JSON.stringify(mocks.requestOptions.body)).once();

    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      protocol: url._protocol + ':',
      path: url.pathname,
      method: 'post',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes,
        'content-length': JSON.stringify(mocks.requestOptions.body).length,
        'content-type': 'application/json'
      }
    }, sinon.match.func)).to.eq(true);
    expect(finalResponse).to.deep.eq({
      body: mocks.responseBody,
      response: mocks.response
    });
  });

  it('should send post request with default options for https without object', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      method: 'post',
      body: faker.random.word()
    });
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('on').withArgs('timeout', sinon.match.func);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func);
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('write').withArgs(mocks.requestOptions.body).once();


    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions as any);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      protocol: url._protocol + ':',
      method: 'post',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes,
        'content-length': mocks.requestOptions.body.length,
        'content-type': 'application/json'
      }
    }, sinon.match.func)).to.eq(true);
    expect(finalResponse).to.deep.eq({
      body: mocks.responseBody,
      response: mocks.response
    });
  });

  it('should send get request with default options for https for timeout', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {timeout: 100});
    const url = URL.parse(mocks.url);
    mocks.requestInstanceMock.expects('abort').once();
    mocks.requestInstanceMock.expects('end').once();
    mocks.requestInstanceMock.expects('on').withArgs('timeout', sinon.match.func).callsArg(1);
    mocks.requestInstanceMock.expects('on').withArgs('error', sinon.match.func);




    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith({
      hostname: url.hostname,
      path: url.pathname,
      timeout: 100,
      method: 'get',
      protocol: url._protocol + ':',
      agent: httpInstance.httpsAgent,
      headers: {
        'accept-encoding': mocks.supportedTypes
      }
    }, sinon.match.func)).to.eq(true);
    expect(finalResponse).to.deep.eq({
      body: mocks.responseBody,
      response: mocks.response
    });
  });
});
