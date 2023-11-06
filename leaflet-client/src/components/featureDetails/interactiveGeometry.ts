import L from 'leaflet';
import { updateLayer } from '../../main';
import { cloneDeep } from 'lodash';
import { NGISFeature } from '../../types/feature';
import { updateFeatures } from '../../ngisClient';
import { layers } from '../../main';
import { makeRequest } from '../../util';

const editMap = (layers: any) => {
  Object.keys(layers).forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer((marker) => {
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

export const exitEdit = (layers: any) => {
  Object.keys(layers).forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer((marker) => {
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
export const updateEditedFeatures = (event: L.DragEndEvent) => {
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

const saveEdits = async () => {
  if (tempEditedFeatures.length > 0) {
    await makeRequest(
      async () => {
        await updateFeatures(tempEditedFeatures);
        originalFeatures.length = 0;
        tempEditedFeatures.length = 0;
      },
      true,
      discardEdits,
    );
  }
};

export const discardEdits = () => {
  if (originalFeatures.length > 0) {
    originalFeatures.forEach((feature: NGISFeature) => {
      updateLayer(feature);
    });
    tempEditedFeatures.length = 0;
    originalFeatures.length = 0;
  }
};

export const saveChangesButton = document.getElementById('saveChanges');
export const editMapButton = document.getElementById('editMap');
export const discardChangesButton = document.getElementById('discardChanges');

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
  exitEdit(layers);
});

discardChangesButton!.addEventListener('click', () => {
  saveChangesButton!.style.display = 'none';
  discardChangesButton!.style.display = 'none';
  discardEdits();
  editMapButton!.style.display = 'block';
  exitEdit(layers);
});
