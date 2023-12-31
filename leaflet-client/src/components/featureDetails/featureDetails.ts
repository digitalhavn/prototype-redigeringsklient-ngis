import { NGISFeature } from '../../types/feature';
import { renderProperties } from './propertyEdit';

export const onMarkerClick = (e: { target: { feature: NGISFeature } }) => {
  const { feature } = e.target;

  const markerInfoDiv = document.querySelector('#markerInfo')! as HTMLDivElement;
  markerInfoDiv.innerHTML = '';

  const content = document.createElement('div');

  renderProperties(feature, content);

  // Create "Cancel" button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'X';
  cancelButton.type = 'button';
  cancelButton.className = 'cancel';

  cancelButton.addEventListener('click', handleCancelButtonClick);

  markerInfoDiv.append(cancelButton, content);

  // Display the div
  markerInfoDiv.style.display = 'block';

  (document.querySelector('#object-list')! as HTMLDivElement).style.display = 'none';
};

export const handleCancelButtonClick = () => {
  const editablePage = document.getElementById('markerInfo');
  if (editablePage) {
    editablePage.style.display = 'none';
    (document.querySelector('#object-list')! as HTMLDivElement).style.display = 'block';
  }
};
