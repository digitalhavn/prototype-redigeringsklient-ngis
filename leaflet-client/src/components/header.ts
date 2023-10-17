import { fetchData, flyToActive } from '../main';
import { State } from '../state';

export const renderDatasetOptions = () => {
  const selectActiveDataset = document.querySelector('#select-dataset') as HTMLInputElement;
  selectActiveDataset.style.display = 'block';
  selectActiveDataset.innerHTML = '';

  const markerInfoDiv = document.querySelector('#markerInfo') as HTMLDivElement;

  State.datasets.forEach((dataset) => {
    const option = document.createElement('option');
    option.value = dataset.id;
    option.textContent = dataset.name;

    if (dataset.id === State.activeDataset?.id) {
      option.selected = true;
    }

    selectActiveDataset.append(option);
  });

  selectActiveDataset.onchange = async () => {
    markerInfoDiv.style.display = 'none';
    State.activeDataset!.id = selectActiveDataset.value;
    selectActiveDataset.disabled = true;
    await fetchData();
    selectActiveDataset.disabled = false;
    flyToActive();
  };
};
