import { SchemaDefinition } from './schema-definition';

export interface EndpointRoute {
  methods: EndpointMethod[];
  path: string;
  handler?: unknown;
}

export interface EndpointMethod {
  verb: string;
  response: unknown;
  responseData?: unknown;
}

export interface EndpointData {
  name: string;
  path: string;
  schema: SchemaDefinition;
  routes: EndpointRoute[];
}