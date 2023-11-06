import { Feature } from 'geojson';
import L from 'leaflet';
import { addToOrCreateLayer, currentFeatures, datasetFeatures, deleteLayer, featureTypes } from './main';
import { generateLayerControl } from './components/layerControl/generateLayerControl';

export const findPath = (feature: Feature) => {
  const { featuretype } = feature.properties!;
  const basePath = `${featuretype}/${featuretype}`;

  switch (featuretype) {
    case 'Beredskapspunkt':
      const beredskapstype = feature.properties!.beredskapstype[0];
      if (
        [
          'båtshake',
          'brannslange',
          'branslukningsapparat',
          'nødplakatinfopunkt',
          'oljelenser',
          'redningsbøye',
          'stige',
        ].includes(beredskapstype)
      ) {
        return `${basePath}_${beredskapstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'Havnesensor':
      const { sensortype } = feature.properties!;
      if (['kamera', 'strøm', 'temperatur', 'værstasjon', 'vannstand', 'vind'].includes(sensortype)) {
        return `${basePath}_${sensortype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'VAUttak':
      const { VAuttakstype } = feature.properties!;
      if (['ferskvann', 'gråvann', 'svartvann'].includes(VAuttakstype)) {
        return `${basePath}_${VAuttakstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'ElKobling':
      const { ElAnleggstype } = feature.properties!;
      if (['ladeanlegg', 'landstrøm', 'strømskap'].includes(ElAnleggstype)) {
        return `${basePath}_${ElAnleggstype}.png`;
      }
      return `${basePath}_annen.png`;
    case 'Drivstofftilkobling':
    case 'Kran':
      return `${basePath}_${feature.properties!.mobil ? 'mobil' : 'fast'}.png`;
    case 'Fortøyningsinnretning':
      return `${basePath}_${feature.properties!.fortøyningstype === 'bøye' ? 'bøye' : 'annen'}.png`;
    case 'Fender':
      return `${basePath}_${feature.properties!.fendertype === 'flytefender' ? 'flytende' : 'annen'}.png`;
    case 'Toalett':
    case 'Avfallspunkt':
      return `${basePath}.png`;
    default:
      return 'Annet.png';
  }
};

export const setLoading = (isLoading: boolean) => {
  const loader = document.getElementById('loading-container')!;
  loader.style.display = isLoading ? 'block' : 'none';
};
export const showVisibleFeatures = (bounds: L.LatLngBounds) => {
  featureTypes.length = 0;
  currentFeatures.forEach((feature) => {
    deleteLayer(feature);
  });
  currentFeatures.length = 0;
  datasetFeatures.features.forEach((feature: Feature) => {
    if (isWithinBounds(feature, bounds)) {
      currentFeatures.push(feature);
      featureTypes.push([feature.properties!.featuretype, feature.geometry.type]);
      addToOrCreateLayer(feature);
    }
  });
  generateLayerControl(featureTypes);
};
export const isWithinBounds = (feature: Feature, latLngBounds: L.LatLngBounds) => {
  const bufferPercentage = 20;
  if (feature.geometry.type === 'Point') {
    const { coordinates } = feature.geometry;
    return latLngBounds.pad(bufferPercentage / 100).contains(L.latLng(coordinates[0], coordinates[1]));
  } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
    const { coordinates } = feature.geometry;
    for (const coord of coordinates) {
      const lat = typeof coord === 'number' ? coord : (coord[1] as number);
      const lng = typeof coord === 'number' ? coord : (coord[0] as number);
      if (!latLngBounds.pad(bufferPercentage / 100).contains(L.latLng(lat, lng))) {
        return false;
      }
    }
    return true;
  }
  return false;
};

//Code below is a lot cleaner but typescript complains
/*
export const isWithinBounds = (feature: Feature, latLngBounds: L.LatLngBounds) => {
  if (feature.geometry.coordinates && ['Point', 'LineString', 'Polygon'].includes(feature.geometry.type)) {
    const { coordinates } = feature.geometry;
    switch (feature.geometry.type) {
      case 'Point':
        return latLngBounds.contains(L.latLng(coordinates[0], coordinates[1]));

      case 'LineString':
      case 'Polygon':
        for (const coord of coordinates) {
          if (!latLngBounds.contains(L.latLng(coord[1], coord[0]))) {
            return false;
          }
        }
        return true;

      default:
        return false;
    }
  }
  return false;
};
*/
