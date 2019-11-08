import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {Client} from "../lib/client";
import {Http} from "../lib/http";
import {CONTENT_TYPE} from "../lib/enums";

const CircuitBreaker = require("../opossum-state-fixed");

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
      body: '{"test":4}',
      response: {
        headers: {
          'content-type': CONTENT_TYPE.ApplicationJson
        }
      }
    };
    const name = faker.random.word();
    const requestOptions = {json: true};
    const url = faker.internet.url();

    const responseCallback = sandbox.stub();

    httpMock
      .expects('request')
      .withExactArgs(url, requestOptions, sinon.match.func)
      .callsArgWith(2, null, httpResponse);

    // Act
    const response = await client.request(name, url, requestOptions);

    // Assert
    expect(response).to.deep.eq({
      body: '{"test":4}',
      json: {
        test: 4
      },
      response: {
        headers: {
          'content-type': CONTENT_TYPE.ApplicationJson
        }
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
      .withExactArgs(url, {}, sinon.match.func)
      .callsArgWith(2, null, httpResponse);


    // Act
    const response = await client.request(name, url);

    // Assert
    expect(response).to.deep.eq({
      body: '{"test":4}',
    });
  });

  it('should call http handler (http error)', (done) => {
    // Arrange
    const error = faker.random.word();
    const name = faker.random.word();
    const url = faker.internet.url();

    httpMock
      .expects('request')
      .withExactArgs(url, {}, sinon.match.func)
      .callsArgWith(2, error, undefined);


    // Act
    client
      .request(name, url)
      .then(_ => done("Expected to throw"))
      .catch(_ => done())
  });
});
