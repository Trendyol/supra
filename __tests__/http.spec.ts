import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {Http} from "../lib/http";
import http from "http";
import {Compression} from "../lib/compression";

const sandbox = sinon.createSandbox();
let httpInstance: Http;

describe('[http.ts]', () => {
  const createRequestOptions = (url: string, options?: object) => {
    const mock: any = {
      url,
      requestOptions: {...options},
      response: {},
      requestInstance: {
        end: sandbox.stub(),
        write: sandbox.stub()
      },
      responseBody: faker.random.word(),
      supportedTypes: faker.random.word(),
    };

    mock.requestStub = sandbox.stub(http, 'request').callsArgWith(2, mock.response).returns(mock.requestInstance as any);
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

    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.requestInstance.end.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith(mocks.url, {
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

    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.requestInstance.end.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith(mocks.url, {
      method: 'get',
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

    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.requestInstance.end.calledOnce).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith(mocks.url, {
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


  it('should send get request with default options for https post', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      method: 'post',
      body: {
        test: 5
      }
    });

    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.requestInstance.end.calledOnce).to.eq(true);
    expect(mocks.requestInstance.write.calledWithExactly(JSON.stringify(mocks.requestOptions.body))).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith(mocks.url, {
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

  it('should send get request with default options for https post without object', async () => {
    // Arrange
    const mocks = createRequestOptions('https://m.trendyol.com', {
      method: 'post',
      body: faker.random.word()
    });


    // Act
    const finalResponse = await httpInstance.request(mocks.url, mocks.requestOptions as any);

    // Assert
    expect(mocks.requestStub.calledOnce).to.eq(true);
    expect(mocks.requestInstance.end.calledOnce).to.eq(true);
    expect(mocks.requestInstance.write.calledWithExactly(mocks.requestOptions.body)).to.eq(true);
    expect(mocks.compressionStub.calledWithExactly(mocks.response as any)).to.eq(true);
    expect(mocks.compressionSupportedStreamsStub.calledOnce).to.eq(true);
    expect(mocks.requestStub.calledWith(mocks.url, {
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
});
