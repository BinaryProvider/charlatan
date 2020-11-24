import { OpenAPI } from 'openapi-types';
import { Path } from 'path-parser';
import { CoreProjectOptions } from './models/core-project-data';
import { EndpointData, EndpointRoute } from './models/endpoint-data';

export class EndpointParser {
  public static parseEndpoints(api: OpenAPI.Document, options?: CoreProjectOptions): EndpointData[] {
    const paths = api['paths'];

    if (!paths) return [];

    const endpoints: EndpointData[] = [];

    Object.keys(paths ?? [])?.forEach(path => {
      const definition = paths[path];

      path = path.replace(/^(.*?)\/v[0-9]/, '');

      const formattedPath = path.replace(/{(.*)}/g, (match) => {
        return match.replace('{', ':').slice(0, match.length - 1);
      });

      const parsedPath = new Path(formattedPath);
      const root = parsedPath.path.match(/[^/]+([^/]+)/)[0];

      const endpoint = endpoints.find(endpoint => {
        return endpoint.path.toLowerCase() === root.toLowerCase();
      }) ?? this.parseEndpoint(parsedPath, endpoints);
      
      this.parseRouting(formattedPath, definition, endpoint);
    });
  
    this.formatEndpoints(endpoints, options);

    return endpoints;
  }

  private static parseEndpoint(parsedPath: Path, endpoints: EndpointData[]): EndpointData {
    const root = parsedPath.path.match(/[^/]+([^/]+)/)[0];

    const endpoint: EndpointData = {
      name: root.toPascalCase(),
      path: root.toHyphenCase(),
      schema: null,
      routes: []
    };

    endpoints.push(endpoint);

    return endpoint;
  }

  private static parseRouting(path: string, definition: unknown, endpoint: EndpointData): void {
    const verbs = Object.keys(definition ?? []);

    const route: EndpointRoute = {
      path,
      methods: verbs.map(verb => {
        const responses = definition[verb]?.responses;
        const response = responses ? responses['200'] : null;
        const content = response?.content;
        const responseType = content ? content['application/json'] : null;
        const schema = response?.schema ?? responseType?.schema;
        const type = schema?.type;
        const properties = type === 'array' ? schema?.items?.properties : schema?.properties;

        return {
          verb: verb.toUpperCase(),
          response: properties
        };
      }),
    };

    endpoint.routes.push(route);
  }

  private static formatEndpoints(endpoints: EndpointData[], options?: CoreProjectOptions) {
    if (!options) return;

    endpoints.forEach(endpoint => {
      this.formatEndpointName(endpoint, options);
    });
  }

  private static formatEndpointName(endpoint: EndpointData, options: CoreProjectOptions) {
    if (!options.endpoint || !options.endpoint['name']) return;
    const find = options.endpoint['name'].find;
    const replace = options.endpoint['name'].replace;
    endpoint.name = endpoint.name.replace(find, replace);
    console.log(endpoint);
  }
}