import { fetchData, flyToActive, layers } from '../../main';
import { State } from '../../state';
import {
  exitEdit,
  discardEdits,
  discardChangesButton,
  saveChangesButton,
  editMapButton,
} from '../featureDetails/interactiveGeometry';

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
    saveChangesButton!.style.display = 'none';
    discardChangesButton!.style.display = 'none';
    discardEdits();
    editMapButton!.style.display = 'block';
    exitEdit(layers);
    await fetchData();
    selectActiveDataset.disabled = false;
    flyToActive();
  };
};
