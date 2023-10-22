import L from 'leaflet';
import { updateLayer } from '../../main';
import { cloneDeep } from 'lodash';
import { NGISFeature } from '../../types/feature';
import { updateFeatures } from '../../ngisClient';

export const editMap = (layers: any) => {
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
export const saveChanges = (layers: any) => {
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

export const originalFeatures: NGISFeature[] = [];
export const tempEditedFeatures: NGISFeature[] = [];
export const editedFeatures = (event: L.DragEndEvent) => {
  const featureCopy = cloneDeep(event.target.feature);
  const updatedLatLng = event.target.getLatLng();
  event.target.feature.geometry.coordinates = [
    updatedLatLng.lat,
    updatedLatLng.lng,
    event.target.feature.geometry.coordinates[2],
  ];
  originalFeatures.push(featureCopy);
  tempEditedFeatures.push(event.target.feature);
};

export const saveEdits = () => {
  if (tempEditedFeatures.length > 0) {
    updateFeatures(tempEditedFeatures);
    originalFeatures.length = 0;
    tempEditedFeatures.length = 0;
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
