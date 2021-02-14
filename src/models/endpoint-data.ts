import { SchemaDefinition } from "./schema-definition";

export interface EndpointRoute {
  methods: EndpointMethod[];
  method?: string;
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
