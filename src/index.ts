#!/usr/bin/env node

import SwaggerParser from '@apidevtools/swagger-parser';
import { config as configureEnvironment } from 'dotenv';
import { OpenAPI } from 'openapi-types';
import { CLI } from './cli';
import { Data } from './data';
import { EndpointParser } from './endpoint-parser';
import { ModelParser } from './model-parser';
import { ProjectData } from './models/project-data';
import { Project } from './project';
import { SchemaParser } from './schema-parser';

configureEnvironment();

if (Data.args['help']) {
  CLI.help();
  process.exit();
}

CLI.splash();

const data = Data.initialize();

let attempts = 0;
const maxAttempts = 3;
const retryDelay = 5000;

const parseSwagger = (data: ProjectData) => {
  SwaggerParser.dereference(
    data.swagger,
    async (error: Error, api: OpenAPI.Document) => {
      if (error) {
        CLI.error(error.message);
        if (attempts < maxAttempts) {
          attempts++;
          CLI.info(`Retrying (attempt ${attempts} of ${maxAttempts})...`);
          setTimeout(() => {
            parseSwagger(data);
          }, retryDelay);
        }
        return;
      }

      const options = data?.options ?? Object.assign({});
      const models = ModelParser.parseModels(api, options);
      const endpoints = EndpointParser.parseEndpoints(api, options);
      const customDefinitions = await SchemaParser.parseCustomDefinitions(
        data.schemas ?? []
      );
      const extensions = await Project.parseFiles(data.extensions ?? []);
      const masterData = await Project.parseFiles(data.masterdata ?? []);

      SchemaParser.createSchemaDefinitions(endpoints, customDefinitions);

      await Project.initialize(data);

      Project.createModels(data, models, options);

      if (!data.models) {
        Project.createRC(data, options);
        Project.createEndpoints(data, endpoints, options);
        Project.createSchemas(data, endpoints);
        Project.createExtensions(data, extensions);
        Project.createMasterdata(data, masterData);
      }

      CLI.success('------------------------------', true);
      CLI.success('API generated successfully!', true);
      CLI.text(`^+Location: ^:${data.outDir}`, true);
      CLI.success('------------------------------', true, true);
    }
  );
};

if (!data) {
  CLI.error('Could not initialize data!');
} else {
  CLI.note('Parsing Swagger definition...');
  parseSwagger(data);
}
