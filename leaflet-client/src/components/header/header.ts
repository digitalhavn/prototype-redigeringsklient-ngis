import { fetchData, flyToActive, initDataset } from '../../main';
import { State } from '../../state';
import { onDiscardChangesButtonClick } from '../featureDetails/interactiveGeometry';

export const renderDatasetOptions = () => {
  const selectActiveDataset = document.querySelector('#select-dataset') as HTMLInputElement;
  selectActiveDataset.style.display = 'block';
  selectActiveDataset.innerHTML = '';

  const markerInfoDiv = document.querySelector('#markerInfo') as HTMLDivElement;
  const objectList = document.querySelector('#object-list') as HTMLDivElement;

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
    objectList.style.display = 'block';
    State.activeDataset!.id = selectActiveDataset.value;
    selectActiveDataset.disabled = true;
    onDiscardChangesButtonClick();
    await initDataset();
    flyToActive();
    selectActiveDataset.disabled = false;
    await fetchData();
  };
};
