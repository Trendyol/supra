import {expect} from "chai";
import client from "../lib"
import {Client} from "../lib/client";


describe('[index.ts]', () => {
  it('should create new ', () => {
    // Assert
    expect(client).to.be.instanceOf(Client);
  });
});
