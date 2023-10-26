import { NGISFeature } from '../../types/feature';
import { getFeatureSchema, getPossibleFeatureTypes } from '../../validation';
import { JSONSchema4 } from 'json-schema';

const newFeature: NGISFeature = { type: 'Feature', geometry: { type: 'Point', coordinates: [] }, properties: {} };

export const createFeature = () => {
  const modal = document.querySelector('[data-modal]') as HTMLDialogElement;
  const openModalBtn = document.querySelector('#create-feature-button') as HTMLButtonElement;

  openModalBtn.onclick = () => {
    modal.showModal();
    handleOpenCreateFeatureModal();
  };

  modal.addEventListener('click', (e) => {
    const dialogBounds = modal.getBoundingClientRect();
    if (
      e.clientX < dialogBounds.left ||
      e.clientX > dialogBounds.right ||
      e.clientY < dialogBounds.top ||
      e.clientY > dialogBounds.bottom
    ) {
      modal.close();
    }
  });

  const cancelButton = document.querySelector('#close-modal-button') as HTMLButtonElement;
  cancelButton.onclick = () => modal.close();
};

const handleOpenCreateFeatureModal = () => {
  const form = document.querySelector('#create-feature-form') as HTMLFormElement;
  form.onsubmit = handleSubmit;

  const featureTypeSelect = document.querySelector('[name="feature-type"]') as HTMLSelectElement;

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Velg featuretype';
  defaultOption.disabled = true;
  defaultOption.selected = featureTypeSelect.value === '';

  const featureTypeOptions = getPossibleFeatureTypes().reduce((options: HTMLOptionElement[], featureType) => {
    const option = document.createElement('option');
    option.value = featureType;
    option.textContent = featureType;
    // Remember which value was selected before closing last time
    option.selected = featureTypeSelect.value === featureType;
    return [...options, option];
  }, []);

  featureTypeSelect.innerHTML = '';
  featureTypeSelect.append(defaultOption);
  featureTypeSelect.append(...featureTypeOptions);
  featureTypeSelect.onchange = () => renderPropertyInputs(featureTypeSelect.value);
};

const renderPropertyInputs = (featureType: string) => {
  const inputs = document.querySelector('#choose-feature-properties') as HTMLDivElement;
  inputs.innerHTML = '';

  const { schema } = getFeatureSchema(featureType);

  const { properties, required } = schema?.properties.properties as JSONSchema4;

  newFeature.properties = {};

  Object.entries(properties!)
    .filter(([propertyName]) => !['identifikasjon', 'featuretype', 'oppdateringsdato'].includes(propertyName))
    .forEach(([propertyName, property]) =>
      inputs.append(getPropertyInput(propertyName, property, required as string[], newFeature.properties)),
    );

  return inputs;
};

/**
 *
 * @param propertyName
 * @param property
 * @param required
 * @returns
 */
const getPropertyInput = (
  propertyName: string,
  property: JSONSchema4,
  required: string[] | undefined,
  properties: any,
): HTMLElement => {
  if (property.type === 'object') {
    properties[propertyName] = {};

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = propertyName;

    fieldset.append(legend);

    Object.entries(property.properties!).forEach(([nestedPropertyName, nestedProperty]) =>
      fieldset.append(
        getPropertyInput(
          nestedPropertyName,
          nestedProperty,
          property.required as string[] | undefined,
          properties[propertyName],
        ),
      ),
    );
    return fieldset;
  }

  if (property.type === 'array') {
    properties[propertyName] = [];

    // Create checkboxes
    const possibleValues = (property.items as JSONSchema4)?.oneOf;

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = propertyName;

    if (required && required.includes(propertyName)) {
      const req = document.createElement('span');
      req.className = 'req';
      req.textContent = '*';
      legend.append(req);
    }

    fieldset.append(legend);

    (possibleValues as { const: string; title: string }[]).forEach((possibleValue) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = possibleValue.const;
      checkbox.id = checkbox.name = `${propertyName}-${possibleValue.const}`;

      const label = document.createElement('label');
      label.htmlFor = `${propertyName}-${possibleValue.const}`;
      label.textContent = possibleValue.title;

      fieldset.append(checkbox, label);
    });
    return fieldset;
  }

  const label = document.createElement('label');
  label.textContent = propertyName;
  label.htmlFor = propertyName;

  let input: HTMLInputElement | HTMLSelectElement | undefined = undefined;

  if (property.type === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = properties[propertyName] = false;
    input.name = input.id = propertyName;
  } else if (property.oneOf) {
    // Create select
    const possibleValues = property.oneOf ?? (property.items as JSONSchema4).oneOf;
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
    input.type = ['number', 'integer'].includes(property.type as string)
      ? 'number'
      : property.format && property.format === 'date'
      ? 'date'
      : 'text';
    input.name = input.id = propertyName;
  }

  input.onchange = () =>
    input?.value !== ''
      ? (properties[propertyName] = property.type === 'boolean' ? (input as HTMLInputElement).checked : input?.value)
      : delete properties[propertyName];

  if (property.type !== 'boolean' && required && required.includes(propertyName)) {
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

const handleSubmit = (e: SubmitEvent) => {
  e.preventDefault();
  console.log(newFeature);
};
