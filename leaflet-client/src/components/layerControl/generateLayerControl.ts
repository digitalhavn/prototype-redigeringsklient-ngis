import { MAP_OPTIONS, START_LOCATION } from '../../config';
import { layers, map, toggleLayer } from '../../main';

type details = {
  count: number;
  gType: string;
};

export const generateLayerControl = (featuretypes: [string, string][]) => {
  const objectCollapsible = document.getElementById('object-content')! as HTMLDivElement;
  objectCollapsible.innerHTML = '';
  const areaCollapsible = document.getElementById('area-content')! as HTMLDivElement;
  areaCollapsible.innerHTML = '';

  const featuretypeMap = new Map<string, details>();
  featuretypes.forEach((ft: [string, string]) => {
    if (!featuretypeMap.has(ft[0])) {
      featuretypeMap.set(ft[0], { gType: ft[1], count: 1 });
    } else {
      featuretypeMap.set(ft[0], { count: featuretypeMap.get(ft[0])!.count + 1, gType: ft[1] });
    }
  });
  featuretypeMap.forEach((value: details, key: string) => {
    createCheckbox(key, value, objectCollapsible, areaCollapsible);
  });
};

const createCheckbox = (
  featuretype: string,
  details: details,
  objectCollapsible: HTMLDivElement,
  areaCollapsible: HTMLDivElement,
) => {
  const checkboxLabel = document.createElement('label');
  checkboxLabel.className = 'c-checkbox-label';
  checkboxLabel.textContent = `${featuretype} (${details.count})`;
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  const checkboxId = `checkbox-${featuretype}`;
  checkbox.id = checkboxId;
  checkbox.value = featuretype;
  checkbox.checked = map.hasLayer(layers[featuretype]);
  const customCheckbox = document.createElement('span');
  customCheckbox.className = 'c-checkmark-span';
  checkboxLabel.setAttribute('for', checkboxId);
  checkbox.onchange = () => {
    toggleLayer(checkbox);
  };

  checkboxLabel.appendChild(checkbox);
  checkboxLabel.appendChild(customCheckbox);
  details.gType === 'Point'
    ? objectCollapsible?.appendChild(checkboxLabel)
    : areaCollapsible?.appendChild(checkboxLabel);
};

(document.querySelector('#reset-map-button') as HTMLButtonElement).onclick = () =>
  map.flyTo(START_LOCATION, MAP_OPTIONS.zoom);
