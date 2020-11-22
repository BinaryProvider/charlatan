export interface EndpointRoute {
  methods: EndpointMethod[];
  path: string;
}

export interface EndpointMethod {
  verb: string;
}

export interface EndpointData {
  name: string;
  path: string;
  routes: EndpointRoute[];
}