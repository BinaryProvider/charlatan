import { OpenAPI } from 'openapi-types';
import { Path } from 'path-parser';
import { EndpointData, EndpointRoute } from './models/endpoint-data';

export class EndpointParser {
  public static parseEndpoints(api: OpenAPI.Document): EndpointData[] {
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
      const tokens = parsedPath?.tokens;
      const root = parsedPath.path.match(/[^/]+([^/]+)/)[0];
      const params = tokens.slice(2).filter(token => token.type !== 'delimiter');

      const endpoint = endpoints.find(endpoint => {
        return endpoint.path.toLowerCase() === root.toLowerCase();
      }) ?? this.parseEndpoint(parsedPath, endpoints);
      
      this.parseRouting(formattedPath, definition, endpoint);
    });
  
    return endpoints;
  }

  private static parseEndpoint(parsedPath: Path, endpoints: EndpointData[]): EndpointData {
    const root = parsedPath.path.match(/[^/]+([^/]+)/)[0];

    const endpoint: EndpointData = {
      index: Number.MAX_VALUE,
      name: root.toPascalCase(),
      path: root.toHyphenCase(),
      definition: null,
      count: 10,
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
        const properties = schema?.properties;

        return {
          verb: verb.toUpperCase(),
          response: properties
        };
      }),
    };

    endpoint.routes.push(route);
  }
}