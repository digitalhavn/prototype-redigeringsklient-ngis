import { Feature } from 'geojson';
import { JSONSchema4 } from 'json-schema';
import { createMultiSelect } from './components/multiselect/multiselect';

export const findPath = (feature: Feature) => {
  const { featuretype } = feature.properties!;
  const basePath = `${featuretype}/${featuretype}`;
  switch (featuretype) {
    case 'Beredskapspunkt':
      const beredskapstype = feature.properties!.beredskapstype[0];
      if (
        [
          'båtshake',
          'brannslange',
          'branslukningsapparat',
          'nødplakatinfopunkt',
          'oljelenser',
          'redningsbøye',
          'stige',
        ].includes(beredskapstype)
      ) {
        return `${basePath}_${beredskapstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'Havnesensor':
      const { sensortype } = feature.properties!;
      if (['kamera', 'strøm', 'temperatur', 'værstasjon', 'vannstand', 'vind'].includes(sensortype)) {
        return `${basePath}_${sensortype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'VAUttak':
      const { VAuttakstype } = feature.properties!;
      if (['ferskvann', 'gråvann', 'svartvann'].includes(VAuttakstype)) {
        return `${basePath}_${VAuttakstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'ElKobling':
      const { ElAnleggstype } = feature.properties!;
      if (['ladeanlegg', 'landstrøm', 'strømskap'].includes(ElAnleggstype)) {
        return `${basePath}_${ElAnleggstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'Drivstofftilkobling':
    case 'Kran':
      return `${basePath}_${feature.properties!.mobil ? 'mobil' : 'fast'}.png`;
    case 'Fortøyningsinnretning':
      return `${basePath}_${feature.properties!.fortøyningstype === 'bøye' ? 'bøye' : 'annen'}.png`;
    case 'Fender':
      return `${basePath}_${feature.properties!.fendertype === 'flytefender' ? 'flytende' : 'annen'}.png`;
    case 'Toalett':
    case 'Avfallspunkt':
      return `${basePath}.png`;
    default:
      return 'Annet.png';
  }
};

export const setLoading = (isLoading: boolean) => {
  const loader = document.getElementById('loading-container')!;
  loader.style.display = isLoading ? 'block' : 'none';
};

/**
 * If property type is "object", return a fieldset with nested properties.
 * If property type is "array", return a fieldset with checkboxes for all possibilities.
 * If property type is "boolean", return a checkbox.
 * If property schema has oneOf, return select with possible options.
 * Else return a regular {@link HTMLInputElement}
 *
 * @param propertyName name of property
 * @param propertySchema JSON schema for property
 * @param required list of required properties
 * @param properties properties to edit
 * @returns input based on property type
 */
export const getPropertyInput = (
  propertyName: string,
  propertySchema: JSONSchema4,
  required: string[] | undefined,
  properties: any,
): HTMLElement => {
  const tooltip = document.createElement('span');
  tooltip.className = 'tips';
  tooltip.textContent = propertySchema.description!;

  if (propertySchema.type === 'object') {
    properties[propertyName] = {};

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = propertyName;
    legend.append(tooltip);

    fieldset.append(legend);

    Object.entries(propertySchema.properties!).forEach(([nestedPropertyName, nestedProperty]) =>
      fieldset.append(
        getPropertyInput(
          nestedPropertyName,
          nestedProperty,
          propertySchema.required as string[] | undefined,
          properties[propertyName],
        ),
      ),
    );
    return fieldset;
  }

  if (propertySchema.type === 'array') {
    properties[propertyName] = [];

    // Create checkboxes
    const possibleValues = (propertySchema.items as JSONSchema4)?.oneOf;

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = propertyName;
    legend.append(tooltip);

    if (required && required.includes(propertyName)) {
      const req = document.createElement('span');
      req.className = 'req';
      req.textContent = '*';
      legend.append(req);
    }

    fieldset.append(legend);
    createMultiSelect(fieldset, possibleValues as { const: string; title: string }[], null, propertyName);

    return fieldset;
  }

  const label = document.createElement('label');
  label.textContent = propertyName;
  label.htmlFor = propertyName;
  label.append(tooltip);

  let input: HTMLInputElement | HTMLSelectElement | undefined = undefined;

  if (propertySchema.type === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = properties[propertyName] = false;
    input.name = input.id = propertyName;
  } else if (propertySchema.oneOf) {
    // Create select
    const possibleValues = propertySchema.oneOf ?? (propertySchema.items as JSONSchema4).oneOf;
    input = document.createElement('select');
    input.name = input.id = propertyName;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Velg ${propertyName}`;
    defaultOption.selected = true;
    defaultOption.disabled = true;
    input.append(defaultOption);

    (possibleValues as { const: string; title: string }[]).forEach((possibleValue) => {
      const option = document.createElement('option');
      option.value = possibleValue.const;
      option.textContent = possibleValue.title;
      input?.append(option);
    });
  } else {
    // Create input
    input = document.createElement('input');
    input.type = ['number', 'integer'].includes(propertySchema.type as string)
      ? 'number'
      : propertySchema.format && propertySchema.format === 'date'
      ? 'date'
      : 'text';
    input.name = input.id = propertyName;
  }

  input.onchange = () => {
    if (!input?.value) {
      delete properties[propertyName];
    } else if (input?.type === 'number') {
      properties[propertyName] = parseInt(input.value, 10);
    } else if (propertySchema.type === 'boolean') {
      properties[propertyName] = (input as HTMLInputElement).checked;
    } else {
      properties[propertyName] = input.value;
    }
  };
  input?.value !== ''
    ? (properties[propertyName] =
        propertySchema.type === 'boolean' ? (input as HTMLInputElement).checked : input?.value)
    : delete properties[propertyName];

  if (propertySchema.type !== 'boolean' && required && required.includes(propertyName)) {
    input.required = true;

    const req = document.createElement('span');
    req.className = 'req';
    req.textContent = '*';
    label.append(req);
  }

  const inputDiv = document.createElement('div');
  inputDiv.append(label, input);
  return inputDiv;
};
