import {Client} from "./client";
import {Http} from "./http";

const http = new Http();
const client = new Client(http);




export = client;
