import * as sinon from "sinon";
import * as faker from "faker";
import {expect} from "chai";
import {Client} from "../lib/client";
import {Http} from "../lib/http";
import HystrixReporter from "opossum-hystrix"

const sandbox = sinon.createSandbox();
let client: Client;

const http = new Http();

let httpMock: sinon.SinonMock;

describe('[client.ts]', () => {
  beforeEach(() => {
    httpMock = sandbox.mock(http);
    client = new Client(http);
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
    const request = {};
    const response = {};

    // Act


    // Assert
  });
});
