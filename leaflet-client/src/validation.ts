import Ajv, { JSONSchemaType } from 'ajv';
import { State } from './state';
import { AnyValidateFunction } from 'ajv/dist/core';
import { JSONSchema4 } from 'json-schema';

export const ajv = new Ajv();
ajv.addFormat('date-time', {
  validate: (dateTime: string) => dateTime !== null,
});
ajv.addFormat('date', {
  validate: (date: string) => date !== null,
});
ajv.addKeyword({
  keyword: 'mandatoryboundaryfeature',
  // TODO: do some actual validation here when we know what this keyword means
  validate: (schema: any) => schema !== null,
  schemaType: 'boolean',
  type: 'object',
});

export const getPossibleFeatureTypes = (): string[] => {
  return State.schema?.properties.features.items.anyOf
    .filter(
      (item: any) =>
        item.properties.geometry.oneOf[0].properties.type.enum[0] !== 'Polygon' && item.title !== 'ElKobling',
    )
    .map((item: JSONSchema4) => item.title);
};

export const findSchemaByTitle = (title: string): JSONSchemaType<any> | undefined => {
  return State.schema?.properties.features.items.anyOf.find((item: JSONSchema4) => item.title === title);
};

/**
 * Get {@link Ajv} validation function based on feature type.
 * Schema is cached for later use
 *
 * @param feature
 * @returns validate function or null if no schema is found for the feature
 */
export const getFeatureSchema = (
  featureType: string,
): { validate: AnyValidateFunction<unknown> | undefined | null; schema: JSONSchemaType<any> | null } => {
  const validate = ajv.getSchema(featureType);

  if (validate) {
    return { validate, schema: validate.schema as JSONSchemaType<any> };
  }

  const relevantSchema = findSchemaByTitle(featureType);

  if (!relevantSchema) {
    return { validate: null, schema: null };
  }

  ajv.compile(relevantSchema);
  ajv.addSchema(relevantSchema, featureType);
  return { validate: ajv.getSchema(featureType), schema: relevantSchema };
};
