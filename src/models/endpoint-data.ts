export interface EndpointRoute {
  methods: EndpointMethod[];
  path: string;
}

export interface EndpointMethod {
  verb: string;
  response: unknown;
}

export interface EndpointData {
  index: number;
  name: string;
  path: string;
  count: number;
  definition: string;
  routes: EndpointRoute[];
}