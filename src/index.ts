import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPI } from 'openapi-types';
import { CoreProject } from './core-project';
import { EndpointParser } from './endpoint-parser';
import { ModelParser } from './model-parser';
import { CoreProjectData } from './models/core-project-data';
import { SchemaParser } from './schema-parser';

const data: CoreProjectData = {
  name: 'pet-store-api',
  version: '1.0.0',
  outDir: 'out',
  swagger: './temp/swagger.json',
  // swagger: 'https://petstore.swagger.io/v2/swagger.json',
  // swagger: 'https://raw.githubusercontent.com/fannheyward/Bookstore/master/pb/book.swagger.json',
  definitions: ['../temp/definitions.ts']
};

SwaggerParser.dereference(data.swagger, async (error: Error, api: OpenAPI.Document) => {
  if (error) {
    console.log(error);
    return;
  }

  const models = ModelParser.parseModels(api);
  const endpoints = EndpointParser.parseEndpoints(api);
  const customDefinitions = await SchemaParser.parseCustomDefinitions(data.definitions);

  SchemaParser.createDefinitions(endpoints, customDefinitions);

  CoreProject.initialize(data);
  CoreProject.createModels(data, models);
  CoreProject.createEndpoints(data, endpoints);
  CoreProject.createSchemas(data, endpoints);
});