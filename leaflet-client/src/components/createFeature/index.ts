import { putFeature } from '../../ngisClient';
import { NGISFeature } from '../../types/feature';
import { findPath, getPropertyInput, makeRequest } from '../../util';
import { getFeatureSchema, getGeometryType, getPossibleFeatureTypes } from '../../validation';
import { JSONSchema4 } from 'json-schema';
import { fetchData, map } from '../../main';
import L from 'leaflet';

import './createFeature.css';

const newFeature: NGISFeature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [] },
  properties: {},
};

export const renderCreateFeature = () => {
  const modal = document.querySelector('[data-modal]') as HTMLDialogElement;
  const openModalBtn = document.querySelector('#create-feature-button') as HTMLButtonElement;

  openModalBtn.onclick = () => {
    modal.showModal();
    handleOpenCreateFeatureModal();
  };

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

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.formMethod = 'dialog';
  submit.textContent = 'Plasser objekt';
  inputs.append(submit);
};

const handleSubmit = async () => {
  // Delete empty properties
  Object.entries(newFeature.properties).forEach(([property, value]) => {
    if (
      (typeof value === 'object' && Object.keys(value).length === 0) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete newFeature.properties[property];
    }
  });

  const path = findPath(newFeature);
  const customIcon = L.icon({
    iconUrl: `/havnesymboler/${path}`,
    iconSize: [15, 15],
  });

  const geometryType = getGeometryType(newFeature.properties.featuretype);
  newFeature.geometry.type = geometryType;

  // Start draw
  if (geometryType === 'Point') {
    new L.Draw.Marker(map, { icon: customIcon }).enable();
  } else if (geometryType === 'LineString') {
    new L.Draw.Polyline(map).enable();
  }

  // When marker is placed or line is drawn, create new feature
  map.on(L.Draw.Event.CREATED, async ({ layer }) => {
    const coordinates =
      geometryType === 'Point'
        ? [layer._latlng.lat, layer._latlng.lng, 0]
        : [...layer._latlngs.map(({ lat, lng }: { lat: number; lng: number }) => [lat, lng, 0])];

    await makeRequest(async () => {
      const editFeaturesSummary = await putFeature(newFeature, coordinates, 'Create');

      if (editFeaturesSummary.features_created > 0) {
        (document.querySelector('[name="feature-type"]') as HTMLSelectElement).value = '';
        (document.querySelector('#choose-feature-properties') as HTMLDivElement).innerHTML = '';
        map.removeEventListener(L.Draw.Event.CREATED);
      }
    });

    await fetchData();
  });
};
