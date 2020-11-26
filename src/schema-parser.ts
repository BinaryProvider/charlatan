import stringifyObject from 'stringify-object';
import { EndpointData } from './models/endpoint-data';
import { SchemaDefinition } from './models/schema-definition';

export class SchemaParser {
  static readonly DEFINITION_HANDLERS = {
    ['number']: SchemaParser.generateNumber,
    ['string']: SchemaParser.generateString,
    ['boolean']: SchemaParser.generateBoolean,
    ['array']: SchemaParser.generateArray,
  };

  public static createSchemaDefinitions(endpoints: EndpointData[], customSchemaDefinitions: SchemaDefinition[]): void {
    this.setInitialSchemaDefinitionIndexes(customSchemaDefinitions);
  
    endpoints?.forEach(async (endpoint, index) => {
      const customDefinition = this.parseCustomSchemaDefinition(endpoint, customSchemaDefinitions); 
      const defaultSchema = this.createSchemaDefinition(endpoint);
      const customSchema = this.applyCustomSchemaDefinition(endpoint, customDefinition);

      // console.log('DEFAULT:', defaultSchema);
      // console.log('CUSTOM:', customSchema);

      endpoint.schema = { ...defaultSchema, ...customSchema };

      // if (customDefinition) {
      //   this.applyCustomSchemaDefinition(endpoint, customDefinition);
      // } else {
      //   this.createSchemaDefinition(endpoint);
      // }
    });
  }

  public static async parseCustomDefinitions(files: string[]): Promise<SchemaDefinition[]>{
    return await Promise.all(files.map(file => import(file)));
  }

  private static setInitialSchemaDefinitionIndexes(customDefinitions: SchemaDefinition[]): void {
    customDefinitions.map(definitions => {
      Object.keys(definitions).forEach((key, index) => {
        const definition = definitions[key];
        definition.index = definition.index ?? index + 1;
      });
    });
  }

  private static createSchemaDefinition(endpoint: EndpointData): any {
    const routes = endpoint.routes.filter(route => route.methods.find(method => method.verb.toLowerCase() === 'get'));

    routes.forEach(route => {
      route.methods = route.methods.filter(method => method.verb.toLowerCase() === 'get');
    });

    const response = routes[0]?.methods[0]?.response;

    if (!response) {
      return null;
    }
    
    const definition = this.generateObject(response);

    return {
      name: endpoint.name,
      index: null,
      count: 10,
      definition: SchemaParser.stringify(definition)
    };
  }

  private static stringify(definition: unknown): string {
    return stringifyObject(definition, { indent: '    ' });
  }

  private static applyCustomSchemaDefinition(endpoint: EndpointData, customDefinition: SchemaDefinition): any {
    if (!customDefinition) return;

    const schema = {
      ...customDefinition,
    };

    if (customDefinition.definition) {
      schema.definition = SchemaParser.stringify(customDefinition.definition);
    }

    if (schema.routes) {
      schema?.routes.forEach(schema => {
        const routes = endpoint.routes.filter(route => {
          return route.path === schema.path;
        });

        const route = routes.length > 0 ? routes[0] : null;
        if (!route) return;

        if (schema.response) {
          route.methods.forEach(method => {
            const response = schema.response.find(response => response.verb && response.verb.toLowerCase() === method.verb.toLowerCase());
            method.responseData = SchemaParser.stringify(response.data);
          });
        }

        if (schema.handler) {
          route.handler = SchemaParser.stringify(schema.handler);
        }
      });
    }

    return schema;
  }

  private static parseCustomSchemaDefinition(endpoint: EndpointData, customDefinitions: unknown[]): SchemaDefinition {
    const filteredDefinitions = customDefinitions.find(definition => {
      return Object.keys(definition['default'] ?? []).some(property => {
        return (
          property.toLowerCase() === endpoint.name.toLowerCase()
        );
      });
    });

    return filteredDefinitions ? filteredDefinitions[endpoint.name] : undefined;
  }

  private static generateGeneric(property: unknown, isArrayProperty?: boolean): unknown {
    return SchemaParser.generateString(property, isArrayProperty);
  }

  private static generateObject(object: unknown): unknown {
    const definition = Object.assign({});
    const properties = Object.keys(object);

    if (!object || !properties) return definition;

    properties.forEach(key => {
      const property = object[key];
      const type = property?.type;
      const createPropertyDefinition = SchemaParser.DEFINITION_HANDLERS[type] ?? SchemaParser.generateGeneric;
      definition[key] = createPropertyDefinition(property);
    });

    return definition;
  }

  private static generateArray(property: unknown, num?: number) {
    const items = property['items'];
    const type = items?.type;
    const handler = SchemaParser.DEFINITION_HANDLERS[type] ?? SchemaParser.generateGeneric;

    return [{
      ...handler(property, true),
      length: num ?? 10,      
    }];
  }

  private static generateNumber(): unknown {
    return {
      chance: 'integer({"min": 1, "max": 99999})'
    };
  }

  private static generateString(property: unknown, isArrayProperty?: boolean): unknown {
    return isArrayProperty ? {
      faker: 'lorem.words()'
    } : {
      eval: 'faker.lorem.words()'
    };
  }

  private static generateBoolean(): unknown {
    return {
      chance: 'bool()'
    };
  }
}