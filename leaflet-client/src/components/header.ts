import { fetchData } from '../main';
import { State } from '../state';

export const renderDatasetOptions = () => {
  const { datasets, activeDataset, setActiveDataset } = State;

  const selectActiveDataset = document.querySelector('#select-dataset') as HTMLInputElement;
  selectActiveDataset.innerHTML = '';

  datasets.forEach((dataset) => {
    const option = document.createElement('option');
    option.value = dataset.id;
    option.textContent = dataset.name;

    if (dataset.id === activeDataset?.id) {
      option.selected = true;
    }

    selectActiveDataset.append(option);
  });

  selectActiveDataset.onchange = () => {
    setActiveDataset(selectActiveDataset.value);
    fetchData();
  };
};
