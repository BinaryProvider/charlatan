import { OpenAPI } from 'openapi-types';
import { Path } from 'path-parser';

export interface EndpointData {
  name: string;
  path: string;
  routes?: EndpointRoute[];
}

export interface EndpointRoute {
  path: string;
}

export class EndpointParser {
  public static createEndpoints(api: OpenAPI.Document): EndpointData[] {
    const paths = api['paths'];

    if (!paths) return [];

    const endpoints = [];

    Object.keys(paths ?? [])?.forEach(path => {
      const definition = paths[path];

      const formattedPath = path.replace(/{(.*)}/g, (match) => {
        return match.replace('{', ':').slice(0, match.length - 1);
      });

      const parsedPath = new Path(formattedPath);
      const endpoint = this.createEndpoint(definition, parsedPath);
      endpoints.push(endpoint);
      console.log('---');
    });

    return endpoints;
  }

  private static createEndpoint(definition: unknown, path: Path): EndpointData {
    const verbs = Object.keys(definition ?? []);
    const urlParams = path.urlParams;
    const queryParams = path.queryParams;
    const fragments = path.tokens.filter(token => token.type === 'fragment');
    const root = fragments[0].match;
    const routes = fragments.slice(1);
    const rootPath = `/${root}`;

    console.log(verbs);
    // Identify if this is an existing endpoint or a new one
    // Add custom routes if existing

    const endpoint: EndpointData = {
      name: root.toPascalCase(),
      path: root.toHyphenCase()
    };

    return endpoint;
  }
}