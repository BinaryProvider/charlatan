import { JSONServer } from './json-server';
import { Options } from './options';

const server = new JSONServer();
server.start({ port: Options.port });