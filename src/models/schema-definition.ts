export interface SchemaDefinition {
  name: string;
  definition: unknown;
  index?: number;
  count?: number;
  data?: unknown;
  routes?: SchemaDefinitionHandler[];
}

export interface SchemaDefinitionHandler {
  path: string;
  handler?: unknown;
  response?: SchemaDefinitionResponse[];
}

export interface SchemaDefinitionResponse {
  verb: string;
  data: unknown;
}