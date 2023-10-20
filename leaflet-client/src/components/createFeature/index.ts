import { getFeatureSchema, getPossibleFeatureTypes } from '../../validation';
import { JSONSchema4 } from 'json-schema';

export const createFeature = () => {
  const modal = document.querySelector('[data-modal]') as HTMLDialogElement;
  const openModalBtn = document.querySelector('#temp-create-feature-btn') as HTMLButtonElement;

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
  form.onsubmit = (e) => handleSubmit(e, form);

  const featureTypeSelect = document.querySelector('[name="feature-type"]') as HTMLInputElement;
  featureTypeSelect.innerHTML = '';
  getPossibleFeatureTypes().forEach((featureType) => {
    const option = document.createElement('option');
    option.value = featureType;
    option.textContent = featureType;
    featureTypeSelect.append(option);
  });
  featureTypeSelect.onchange = () => renderPropertyInputs(featureTypeSelect.value);
};

const renderPropertyInputs = (featureType: string) => {
  const inputs = document.querySelector('#choose-feature-properties') as HTMLDivElement;
  inputs.innerHTML = '';

  const { schema } = getFeatureSchema(featureType);

  const { properties, required } = schema?.properties.properties as JSONSchema4;

  Object.entries(properties!)
    .filter(([propertyName]) => !['identifikasjon', 'featuretype', 'oppdateringsdato'].includes(propertyName))
    .forEach(([propertyName, property]) => getPropertyInput(propertyName, property, required as string[], inputs));

  return inputs;
};

const getPropertyInput = (
  propertyName: string,
  property: JSONSchema4,
  required: string[] | undefined,
  inputs: HTMLDivElement,
): void => {
  if (property.type === 'object') {
    const objectHeader = document.createElement('h2');
    objectHeader.textContent = propertyName;
    inputs.append(objectHeader);

    Object.entries(property.properties!).forEach(([nestedPropertyName, nestedProperty]) =>
      getPropertyInput(nestedPropertyName, nestedProperty, property.required as string[] | undefined, inputs),
    );
    return inputs.append(document.createElement('hr'));
  }

  if (property.type === 'array') {
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
    return inputs.append(fieldset);
  }

  const label = document.createElement('label');
  label.textContent = propertyName;
  label.htmlFor = propertyName;

  let input: HTMLInputElement | HTMLSelectElement | undefined = undefined;

  if (property.type === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = false;
    input.name = input.id = propertyName;
  } else if (property.oneOf) {
    // Create select
    const possibleValues = property.oneOf ?? (property.items as JSONSchema4).oneOf;
    input = document.createElement('select');
    input.name = input.id = propertyName;

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

  if (input && required && required.includes(propertyName)) {
    input.required = true;

    const req = document.createElement('span');
    req.className = 'req';
    req.textContent = '*';
    label.append(req);
  }

  const inputDiv = document.createElement('div');
  inputDiv.append(label, input);
  inputs.append(inputDiv);
};

const handleSubmit = (e: SubmitEvent, form: HTMLFormElement) => {
  e.preventDefault();
  const data = new FormData(form);
  console.log(Object.fromEntries(data.entries()));
};
