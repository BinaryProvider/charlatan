import { OpenAPI } from 'openapi-types';
import { Path } from 'path-parser';
import { Token } from 'path-parser/dist/tokeniser';
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
      const fragments = tokens?.filter(token => token.type === 'fragment');
      const root = parsedPath.path.match(/[^/]+([^/]+)/)[0];
      const params = tokens.slice(2).filter(token => token.type !== 'delimiter');

      const endpoint = endpoints.find(endpoint => {
        return endpoint.path.toLowerCase() === root.toLowerCase();
      }) ?? this.parseEndpoint(parsedPath, endpoints);
      
      // this.parseRouting(definition, endpoint, params);
    });

    return [...new Set(endpoints)];
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

  private static parseRouting(definition: unknown, endpoint: EndpointData, params: Token[]): void {
    const verbs = Object.keys(definition ?? []);
    const routePath = `/${endpoint.path}/${params.map(token => token.type === 'url-parameter' ? `:${token.val}` : `${token.val}`).join('/')}`;

    // console.log(params.map(t => t.match).join('/'));

    const route: EndpointRoute = {
      methods: verbs.map(verb => {
        const responses = definition[verb]?.responses;
        const response = responses ? responses['200'] : null;
        const schema = response?.schema;
        const properties = schema?.properties;

        return {
          verb: verb.toUpperCase(),
          response: properties
        };
      }),
      path: routePath,
    };

    endpoint.routes.push(route);
  }
}