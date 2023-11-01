export const checkboxStatusChange = () => {
  const multiselect = document.getElementById('mySelectLabel');
  const multiselectOption = multiselect!.getElementsByTagName('option')[0];

  const checkboxes = document.getElementById('mySelectOptions');
  const checkedCheckboxes = checkboxes!.querySelectorAll('input[type=checkbox]:checked');

  const values = Array.from(checkedCheckboxes).map((checkbox) => checkbox.getAttribute('value'));

  let dropdownValue = 'Nothing is selected';
  if (values.length > 0) {
    dropdownValue = values.join(', ');
  }

  multiselectOption.innerText = dropdownValue;
};

const toggleCheckboxArea = () => {
  const checkboxes = document.getElementById('mySelectOptions');
  const displayValue = checkboxes!.style.display;

  if (displayValue !== 'block') {
    checkboxes!.style.display = 'block';
  } else {
    checkboxes!.style.display = 'none';
  }
};

export const createMultiSelect = (parentElement: HTMLElement) => {
  const multiselectDiv = document.createElement('div');
  multiselectDiv.id = 'myMultiSelect';
  multiselectDiv.className = 'multiselect';

  const selectLabel = document.createElement('div');
  selectLabel.id = 'mySelectLabel';
  selectLabel.className = 'selectBox';
  selectLabel.onclick = () => {
    console.log('select label has been clicked');
    toggleCheckboxArea();
  };
  console.log('mySelect label has been created');

  const select = document.createElement('select');
  select.className = 'form-select';

  const option = document.createElement('option');
  option.innerText = 'some value';

  const overSelect = document.createElement('div');
  overSelect.className = 'overSelect';

  const selectOptionsDiv = document.createElement('div');
  selectOptionsDiv.id = 'mySelectOptions';

  const checkbox1 = document.createElement('input');
  const customCheckbox1 = document.createElement('span');
  customCheckbox1.className = 'c-checkmark-span';
  checkbox1.type = 'checkbox';
  checkbox1.id = 'one';
  checkbox1.onchange = () => {
    checkboxStatusChange();
  };
  checkbox1.value = 'one';

  const label1 = document.createElement('label');
  label1.className = 'c-checkbox-label';
  label1.textContent = 'example 1';
  label1.setAttribute('for', 'one');

  const checkbox2 = document.createElement('input');
  const customCheckbox2 = document.createElement('span');
  customCheckbox2.className = 'c-checkmark-span';
  checkbox2.type = 'checkbox';
  checkbox2.className = 'c-checkbox-input';
  checkbox1.className = checkbox2.id = 'two';
  checkbox2.onchange = () => {
    checkboxStatusChange();
  };
  checkbox2.value = 'two';

  const label2 = document.createElement('label');
  label2.className = 'c-checkbox-label';
  label2.textContent = 'example 2';
  label2.setAttribute('for', 'two');

  label1.appendChild(checkbox1);
  label1.appendChild(customCheckbox1);
  label2.appendChild(checkbox2);
  label2.appendChild(customCheckbox2);

  selectOptionsDiv.appendChild(label1);
  selectOptionsDiv.appendChild(label2);

  select.appendChild(option);

  selectLabel.appendChild(select);
  selectLabel.appendChild(overSelect);

  multiselectDiv.appendChild(selectLabel);
  multiselectDiv.appendChild(selectOptionsDiv);

  parentElement.append(multiselectDiv);
};
