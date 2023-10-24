import L from 'leaflet';
import { updateLayer } from '../../main';
import { cloneDeep } from 'lodash';
import { NGISFeature } from '../../types/feature';
import { updateFeatures } from '../../ngisClient';
import { layers } from '../../main';

const editMap = (layers: any) => {
  const layerNames = Object.keys(layers);
  layerNames.forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer((marker) => {
        //@ts-ignore
        if (marker instanceof L.Marker && marker.options.draggable !== undefined) {
          marker.options.draggable = true;
        }
        if (marker instanceof L.Marker && marker.hasOwnProperty('feature')) {
          const geoJSONFeature = marker as L.Marker & { feature: GeoJSON.Feature };
          updateLayer(geoJSONFeature.feature, true);
        }
      });
    }
  });
};
const saveChanges = (layers: any) => {
  const layerNames = Object.keys(layers);
  layerNames.forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer((marker) => {
        //@ts-ignore
        if (marker instanceof L.Marker && marker.options.draggable !== undefined) {
          marker.options.draggable = false;
        }
        if (marker instanceof L.Marker && marker.hasOwnProperty('feature')) {
          const geoJSONFeature = marker as L.Marker & { feature: GeoJSON.Feature };
          updateLayer(geoJSONFeature.feature, false);
        }
      });
    }
  });
};

const originalFeatures: NGISFeature[] = [];
const tempEditedFeatures: NGISFeature[] = [];
export const editedFeatures = (event: L.DragEndEvent) => {
  const updatedLatLng = event.target.getLatLng();
  if (tempEditedFeatures.includes(event.target.feature)) {
    event.target.feature.geometry.coordinates = [
      updatedLatLng.lat,
      updatedLatLng.lng,
      event.target.feature.geometry.coordinates[2],
    ];
  } else {
    const featureCopy = cloneDeep(event.target.feature);
    event.target.feature.geometry.coordinates = [
      updatedLatLng.lat,
      updatedLatLng.lng,
      event.target.feature.geometry.coordinates[2],
    ];
    originalFeatures.push(featureCopy);
    tempEditedFeatures.push(event.target.feature);
  }
};

const saveEdits = () => {
  if (tempEditedFeatures.length > 0) {
    updateFeatures(tempEditedFeatures);
    originalFeatures.length = 0;
    tempEditedFeatures.length = 0;
  }
};

const discardEdits = () => {
  if (originalFeatures.length > 0) {
    originalFeatures.forEach((feature: NGISFeature) => {
      updateLayer(feature);
    });
    tempEditedFeatures.length = 0;
    originalFeatures.length = 0;
  }
};

const saveChangesButton = document.getElementById('saveChanges');
const editMapButton = document.getElementById('editMap');
const discardChangesButton = document.getElementById('discardChanges');
editMapButton!.addEventListener('click', () => {
  editMapButton!.style.display = 'none';
  saveChangesButton!.style.display = 'block';
  discardChangesButton!.style.display = 'block';
  editMap(layers);
});

saveChangesButton!.addEventListener('click', () => {
  saveChangesButton!.style.display = 'none';
  discardChangesButton!.style.display = 'none';
  saveEdits();
  editMapButton!.style.display = 'block';
  saveChanges(layers);
});
discardChangesButton!.addEventListener('click', () => {
  saveChangesButton!.style.display = 'none';
  discardChangesButton!.style.display = 'none';
  discardEdits();
  editMapButton!.style.display = 'block';
  saveChanges(layers);
});
