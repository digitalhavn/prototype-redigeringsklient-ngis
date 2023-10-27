import { putFeature } from '../../ngisClient';
import { NGISFeature } from '../../types/feature';
import { findPath, setLoading } from '../../util';
import { getFeatureSchema, getPossibleFeatureTypes } from '../../validation';
import { JSONSchema4 } from 'json-schema';
import { showUpdateMessage } from '../alerts/update';
import { addToOrCreateLayer, fetchData, map } from '../../main';
import L from 'leaflet';

const newFeature: NGISFeature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [0, 0, 0] },
  properties: {},
};

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

const renderPropertyInputs = (featuretype: string) => {
  const inputs = document.querySelector('#choose-feature-properties') as HTMLDivElement;
  inputs.innerHTML = '';

  const { schema } = getFeatureSchema(featuretype);

  const { properties, required } = schema?.properties.properties as JSONSchema4;

  newFeature.properties = { featuretype };

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
      checkbox.onchange = () => {
	if (checkbox.checked && !properties[propertyName].includes(possibleValue.const)) {
		properties[propertyName] = [...properties[propertyName], possibleValue.const];
	} else if (!checkbox.checked && properties[propertyName].includes(possibleValue.const)) {
		properties[propertyName] = properties[propertyName].filter((value) => value !== possibleValue.const);
	}
      }

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

  input.onchange = () => {
    if (!input?.value) {
      delete properties[propertyName];
    } else if (input?.type === 'number') {
      properties[propertyName] = parseInt(input.value, 10);
    } else if (property.type === 'boolean') {
      properties[propertyName] = (input as HTMLInputElement).checked;
    } else {
      properties[propertyName] = input.value;
    }
  };
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

const handleSubmit = async () => {
	console.log(newFeature);
  Object.entries(newFeature.properties).forEach(([property, value]) => {
    if (
      (typeof value === 'object' && Object.keys(value).length === 0) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete newFeature.properties[property];
    }
  });
  console.log(newFeature);

  const path = findPath(newFeature);
  const customIcon = L.icon({
    iconUrl: `/havnesymboler/${path}`,
    iconSize: [15, 15],
  });

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  const drawControlFull = new L.Control.Draw({
    position: 'topright',
    edit: {
      featureGroup: drawnItems,
    },
    draw: {
      marker: {
        icon: customIcon,
      },
      circle: false,
      polygon: false,
      circlemarker: false,
      rectangle: false,
    },
  });

  const drawControlEditOnly = new L.Control.Draw({
    position: 'topright',
    edit: {
      featureGroup: drawnItems,
    },
    draw: {
      polyline: false,
      marker: false,
      circle: false,
      polygon: false,
      circlemarker: false,
      rectangle: false,
    },
  });

  map.addControl(drawControlFull);

  const coordinates = [0, 0, 0];

  map.on(L.Draw.Event.CREATED, ({ layer }) => {
    coordinates[0] = layer._latlng.lat;
    coordinates[1] = layer._latlng.lng;
    drawnItems.addLayer(layer);
    map.removeControl(drawControlFull);
    map.addControl(drawControlEditOnly);
  });

  map.on(L.Draw.Event.DELETED, ({ layer }) => {
    drawnItems.removeLayer(layer);
    map.removeControl(drawControlEditOnly);
    map.addControl(drawControlFull);
  });

  map.on(L.Draw.Event.EDITED, async () => {
    setLoading(true);

    console.log(coordinates);

    try {
      const editFeaturesSummary = await putFeature(newFeature, coordinates, 'Create');

      if (editFeaturesSummary.features_created > 0) {
        newFeature.geometry.coordinates = coordinates;
        showUpdateMessage();
      }
    } catch (error) {
      console.log(error);
    }

    map.removeControl(drawControlEditOnly);
    map.removeLayer(drawnItems);

    await fetchData();

    setLoading(false);
  });

  // const { validate } = getFeatureSchema(newFeature.properties.featuretype);

  // if (!validate?.(newFeature)) {
  //   e.preventDefault();
  //   console.log(validate?.errors);
  //   const errorMessages = validate
  //     ?.errors!.map((error) => {
  //       console.log(error);
  //       if (error.keyword === 'const') {
  //         return `${error.instancePath.split('/')[2]} must be equal to ${error.params.allowedValue}`;
  //       } else {
  //         return `${error.instancePath.split('/')[2]} ${error.message}`;
  //       }
  //     })
  //     .join(', ');
  //   const responseField = document.createElement('div');
  //   responseField.style.color = 'red';
  //   responseField.textContent = `Validation errors: ${errorMessages}`;
  //   return document.querySelector('[data-modal]')?.append(responseField);
  // }
};
