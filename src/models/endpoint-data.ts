export interface EndpointRoute {
  methods: EndpointMethod[];
  path: string;
}

export interface EndpointMethod {
  verb: string;
  response: unknown;
}

export interface EndpointData {
  name: string;
  path: string;
  definition: string;
  routes: EndpointRoute[];
}