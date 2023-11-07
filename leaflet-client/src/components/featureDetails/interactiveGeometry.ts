import L from 'leaflet';
import { datasetFeatures, updateLayer } from '../../main';
import { cloneDeep } from 'lodash';
import { NGISFeature } from '../../types/feature';
import { updateFeatures } from '../../ngisClient';
import { layers } from '../../main';
import { showErrorMessage } from '../alerts/error';
import { setLoading } from '../../util';
import { showUpdateMessage } from '../alerts/update';
import { Feature } from 'geojson';

export let isEditable: boolean;
const editMap = (layers: any) => {
  isEditable = true;
  Object.keys(layers).forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer((marker) => {
        if (marker instanceof L.Marker && marker.options.draggable !== undefined) {
          marker.options.draggable = isEditable;
        }
        if (marker instanceof L.Marker && marker.hasOwnProperty('feature')) {
          const geoJSONFeature = marker as L.Marker & { feature: GeoJSON.Feature };
          updateLayer(geoJSONFeature.feature, isEditable);
        }
      });
    }
  });
};

export const exitEdit = (layers: any) => {
  isEditable = false;
  Object.keys(layers).forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer((marker) => {
        if (marker instanceof L.Marker && marker.options.draggable !== undefined) {
          marker.options.draggable = isEditable;
        }
        if (marker instanceof L.Marker && marker.hasOwnProperty('feature')) {
          const geoJSONFeature = marker as L.Marker & { feature: GeoJSON.Feature };
          updateLayer(geoJSONFeature.feature, isEditable);
        }
      });
    }
  });
};

const originalFeatures: NGISFeature[] = [];
export const tempEditedFeatures: NGISFeature[] = [];
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
    setLoading(true);
    try {
      await updateFeatures(tempEditedFeatures);
      showUpdateMessage();
      originalFeatures.length = 0;
      tempEditedFeatures.length = 0;
    } catch (error) {
      console.error('Error updating features:', error);
      showErrorMessage();
      discardEdits();
    }
    setLoading(false);
  }
};

export const discardEdits = () => {
  if (originalFeatures.length > 0) {
    // Iterate through originalFeatures and update datasetFeatures.features
    originalFeatures.forEach((originalFeature: NGISFeature) => {
      const originalId = originalFeature.properties.identifikasjon.lokalId;
      const index = datasetFeatures.features.findIndex(
        (feature: Feature) => feature.properties!.identifikasjon.lokalId === originalId,
      );
      if (index !== -1) {
        datasetFeatures.features[index] = originalFeature;
        updateLayer(originalFeature);
      }
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
