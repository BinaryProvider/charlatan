import { OpenAPI } from 'openapi-types';
import './global/string.extensions';
import { ModelData, ModelProperty } from './models/model-data';

export class ModelParser {
  public static parseModels(api: OpenAPI.Document): ModelData[] {
    const definitions = api['definitions'];

    if (!definitions) return [];

    const models = [];

    Object.keys(definitions ?? [])?.forEach(definition => {
      const model = this.parseModel(definitions, definition);
      models.push(model);
    });

    return models;
  }

  private static parseModel(definitions: unknown, name: string): ModelData {
    const model: ModelData = {
      name: name,
      properties: []
    };

    const definition = definitions[name];
    const properties = Object.keys(definition.properties ?? []);

    properties?.forEach(propertyKey => {
      const property: ModelProperty = {
        name: propertyKey.toCamelCase(),
        type: this.mapType(definition.properties[propertyKey].type)
      };

      model.properties.push(property);
    });

    return model;
  }

  private static mapType(type: string): string {
    const map = {
      string: 'string',
      boolean: 'bool',
      integer: 'number',
      array: 'any[]',
      object: 'any',
    };
  
    return map[type] ?? 'any';
  }
}