import { toggleLayer } from '../../main';

type details = {
  count: number;
  gType: string;
};

export const generateLayerControl = (featuretypes: [string, string][]) => {
  const featuretypeMap = new Map<string, details>();
  featuretypes.forEach((ft: [string, string]) => {
    if (!featuretypeMap.has(ft[0])) {
      featuretypeMap.set(ft[0], { gType: ft[1], count: 1 });
    } else {
      featuretypeMap.set(ft[0], { count: featuretypeMap.get(ft[0])!.count + 1, gType: ft[1] });
    }
  });
  featuretypeMap.forEach((value: details, key: string) => {
    createCheckbox(key, value);
  });
};

const objectCollapisble = document.getElementById('object-content');
const areaCollapsible = document.getElementById('area-content');

const createCheckbox = (featuretype: string, details: details) => {
  const checkboxLabel = document.createElement('label');
  checkboxLabel.className = 'c-checkbox-label';
  checkboxLabel.textContent = `${featuretype} (${details.count})`;
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  const checkboxId = `checkbox-${featuretype}`;
  checkbox.id = checkboxId;
  checkbox.value = featuretype;
  const customCheckbox = document.createElement('span');
  customCheckbox.className = 'c-checkmark-span';
  checkboxLabel.setAttribute('for', checkboxId);
  checkbox.onchange = () => {
    toggleLayer(checkbox);
  };

  checkboxLabel.appendChild(checkbox);
  checkboxLabel.appendChild(customCheckbox);
  details.gType === 'Point'
    ? objectCollapisble?.appendChild(checkboxLabel)
    : areaCollapsible?.appendChild(checkboxLabel);
};
