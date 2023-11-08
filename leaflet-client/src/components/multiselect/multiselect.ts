export const multiselectEmpty = (values: string) => {
  return values === 'Velg verdier' || values === 'Ingen verdier valgt';
};

export const checkboxStatusChange = (id: string) => {
  const multiselect = document.getElementById(`${id}-select-label`);
  const multiselectOption = multiselect!.getElementsByTagName('option')[0];
  const select = document.getElementById(`${id}-form-select`) as HTMLSelectElement;

  const checkboxes = document.getElementById(`${id}-select-options`);
  const checkedCheckboxes = checkboxes!.querySelectorAll('input[type=checkbox]:checked');

  const values = Array.from(checkedCheckboxes).map((checkbox) => checkbox.getAttribute('value'));
  let dropdownValue = 'Ingen verdier valgt';
  if (values.length > 0) {
    dropdownValue = values.join(', ');
  }

  multiselectOption.innerText = dropdownValue;
  select.setAttribute('value', dropdownValue);
};

const toggleCheckboxArea = (elementId: string) => {
  const checkboxes = document.getElementById(elementId);
  const displayValue = checkboxes!.style.display;

  if (displayValue !== 'block') {
    checkboxes!.style.display = 'block';
  } else {
    checkboxes!.style.display = 'none';
  }
};

export const createMultiSelect = (
  parentElement: HTMLElement,
  possibleValues: { const: string; title: string }[],
  chosenValues: string[] | null,
  id: string,
) => {
  const multiselectDiv = document.createElement('div');
  multiselectDiv.id = 'myMultiSelect';
  multiselectDiv.className = 'multiselect';

  const selectLabel = document.createElement('div');
  selectLabel.id = `${id}-select-label`;
  selectLabel.className = 'selectBox';

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = `${id}-form-select`;

  const option = document.createElement('option');
  option.innerText = chosenValues !== null ? chosenValues.toString() : ' Velg verdier';

  const overSelect = document.createElement('div');
  overSelect.className = 'overSelect';

  const selectOptionsDiv = document.createElement('div');
  selectOptionsDiv.id = `${id}-select-options`;
  selectOptionsDiv.className = 'c-select-options';
  selectOptionsDiv.style.display = 'none';
  selectLabel.onclick = () => {
    toggleCheckboxArea(selectOptionsDiv.id);
  };

  sortValues(possibleValues);

  possibleValues.forEach((value) => {
    const checkbox = document.createElement('input');
    const customCheckbox = document.createElement('span');
    customCheckbox.className = 'c-checkmark-span';
    checkbox.type = 'checkbox';
    checkbox.className = 'c-checkbox-input';
    checkbox.id = `multiselect-checkbox-${value.const}`;
    checkbox.onchange = () => {
      checkboxStatusChange(id);
    };
    checkbox.value = value.const;

    const label = document.createElement('label');
    label.className = 'c-checkbox-label';
    label.textContent = value.title;
    label.setAttribute('for', checkbox.id);

    label.appendChild(checkbox);
    label.appendChild(customCheckbox);

    selectOptionsDiv.appendChild(label);

    if (chosenValues !== null && chosenValues.includes(value.const)) {
      checkbox.checked = true;
    }
  });

  select.appendChild(option);

  selectLabel.appendChild(select);
  selectLabel.appendChild(overSelect);

  multiselectDiv.appendChild(selectLabel);
  multiselectDiv.appendChild(selectOptionsDiv);

  parentElement.append(multiselectDiv);
};

const sortValues = (values: { const: string; title: string }[]) => {
  values.sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0));
};

export const getPropValueFromMultiselect = (prop: string) => {
  const select = document.getElementById(`${prop}-form-select`) as HTMLSelectElement;
  const values = select?.value;
  return values;
};
