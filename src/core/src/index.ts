import { JSONServer } from './json-server';

const server = new JSONServer();
server.start({ port: 3000 });