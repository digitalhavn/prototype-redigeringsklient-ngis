export const listObjects = (featuretypes: string[]) => {
  const featuretypeMap = new Map<string, number>();
  featuretypes.forEach((ft: string) => {
    if (!featuretypeMap.has(ft)) {
      featuretypeMap.set(ft, 1);
    } else {
      featuretypeMap.set(ft, featuretypeMap.get(ft)! + 1);
    }
  });
  featuretypeMap.forEach((value: number, key: string) => {
    createCheckbox(key, value);
  });
};

const objectCollapisble = document.getElementById('objectContent');

const createCheckbox = (featuretype: string, amount: number) => {
  const checkboxLabel = document.createElement('label');
  checkboxLabel.className = 'c-checkbox-label';
  checkboxLabel.textContent = `${featuretype} (${amount})`;
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  const checkboxId = `checkbox-${featuretype}`;
  checkbox.id = checkboxId;
  const customCheckbox = document.createElement('span');
  customCheckbox.className = 'c-checkmark-span';
  checkboxLabel.setAttribute('for', checkboxId);

  checkboxLabel.appendChild(checkbox);
  checkboxLabel.appendChild(customCheckbox);
  objectCollapisble?.appendChild(checkboxLabel);
};
