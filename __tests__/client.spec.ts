import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {Client} from "../lib/client";
import {Http} from "../lib/http";
import HystrixReporter from "opossum-hystrix"
import {CACHE_CONTROL, CONNECTION, CONTENT_TYPE} from "../lib/enums";
import CircuitBreaker = require("opossum");

const sandbox = sinon.createSandbox();
let client: Client;

const http = new Http();

let httpMock: sinon.SinonMock;

describe('[client.ts]', () => {
  beforeEach(() => {
    httpMock = sandbox.mock(http);
    client = new Client(http);
    Client.circuits.clear();
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  it('should create new Client', () => {
    // Arrange
    const client = new Client(http);

    // Assert
    expect(client).to.be.instanceOf(Client);
  });

  it('should export metrics stream', () => {
    // Arrange
    const request = {} as any;
    const response = {
      writeHead: sandbox.stub(),
      write: sandbox.stub()
    } as any;

    const pipeStub = sandbox.stub(HystrixReporter.stream, 'pipe');

    // Act
    client.metricsStream(request, response);

    // Assert
    expect(pipeStub.calledWithExactly(response)).to.eq(true);
    expect(response.writeHead.calledWithExactly(200, {
      'content-type': CONTENT_TYPE.TextEventStream,
      'cache-control': CACHE_CONTROL.NoCache,
      'connection': CONNECTION.KeepAlive
    })).to.eq(true);
    expect(response.write.calledWithExactly('retry: 10000\n')).to.eq(true);
    expect(response.write.calledWithExactly('event: connecttime\n')).to.eq(true);
  });

  it('should create new circuit', async () => {
    // Arrange
    const name = faker.random.word();
    const url = faker.internet.url();
    const responseData = faker.random.word();
    sandbox.stub(CircuitBreaker.prototype, 'fire').resolves(responseData);

    // Act
    const response = await client.request(name, url);

    // Assert
    expect(Client.circuits.size).to.eq(1);
    expect(response).to.eq(responseData);
  });

  it('should use existing circuit', async () => {
    // Arrange
    const name = faker.random.word();
    const url = faker.internet.url();
    const responseData = faker.random.word();
    sandbox.stub(CircuitBreaker.prototype, 'fire').resolves(responseData);

    // Act
    const response = await client.request(name, url);
    const response2 = await client.request(name, url);

    // Assert
    expect(Client.circuits.size).to.eq(1);
    expect(response).to.eq(responseData);
    expect(response2).to.eq(responseData);
  });

  it('should call http handler (json)', async () => {
    // Arrange
    const httpResponse = {
      body: '{"test":4}'
    };
    const name = faker.random.word();
    const requestOptions = {json: true};
    const url = faker.internet.url();

    httpMock
      .expects('request')
      .withExactArgs(url, requestOptions)
      .resolves(httpResponse);

    // Act
    const response = await client.request(name, url, requestOptions);

    // Assert
    expect(response).to.deep.eq({
      body: '{"test":4}',
      json: {
        test: 4
      }
    });
  });


  it('should call http handler (raw)', async () => {
    // Arrange
    const httpResponse = {
      body: '{"test":4}'
    };
    const name = faker.random.word();
    const url = faker.internet.url();

    httpMock
      .expects('request')
      .withExactArgs(url, undefined)
      .resolves(httpResponse);

    // Act
    const response = await client.request(name, url);

    // Assert
    expect(response).to.deep.eq({
      body: '{"test":4}',

    });
  });
});
