import { OpenAPI } from 'openapi-types';
import { Path } from 'path-parser';
import { Token } from 'path-parser/dist/tokeniser';
import { EndpointData, EndpointRoute } from './models/endpoint-data';

export class EndpointParser {
  public static createEndpoints(api: OpenAPI.Document): EndpointData[] {
    const paths = api['paths'];

    if (!paths) return [];

    const endpoints: EndpointData[] = [];

    Object.keys(paths ?? [])?.forEach(path => {
      const definition = paths[path];

      const formattedPath = path.replace(/{(.*)}/g, (match) => {
        return match.replace('{', ':').slice(0, match.length - 1);
      });

      const parsedPath = new Path(formattedPath);

      const tokens = parsedPath?.tokens;
      const fragments = tokens?.filter(token => token.type === 'fragment');
      const root = fragments[0].match;
      const params = tokens.slice(2).filter(token => token.type !== 'delimiter');

      const endpoint = endpoints.find(endpoint => {
        return endpoint.name.toLowerCase() === root.toLowerCase();
      }) ?? this.createEndpoint(parsedPath, endpoints);
      
      const routing = this.parseRouting(definition, endpoint, params);
      endpoint.routes.push(routing);
    });

    return endpoints;
  }

  private static createEndpoint(path: Path, endpoints: EndpointData[]): EndpointData {
    const fragments = path.tokens.filter(token => token.type === 'fragment');
    const root = fragments[0].match;

    const endpoint: EndpointData = {
      name: root.toPascalCase(),
      path: root.toHyphenCase(),
      routes: []
    };

    endpoints.push(endpoint);

    return endpoint;
  }

  private static parseRouting(definition: unknown, endpoint: EndpointData, params: Token[]): EndpointRoute {
    const verbs = Object.keys(definition ?? []);
    const routePath = `/${endpoint.path}${params.map(token => token.type === 'url-parameter' ? `/:${token.val}` : `/${token.val}`).join('/')}`;

    const route: EndpointRoute = {
      methods: verbs.map(verb => {
        return {
          verb: verb.toUpperCase()
        };
      }),
      path: routePath,
    };

    return route;
  }
}