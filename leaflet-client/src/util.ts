import { Feature } from 'geojson';
import { fetchData } from './main';

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

export const convertLatLngBoundsToBoundingBox = (latLngBounds: L.LatLngBounds) => {
  const southWest = latLngBounds.getSouthWest();
  const northEast = latLngBounds.getNorthEast();

  const minLongitude = southWest.lng;
  const minLatitude = southWest.lat;
  const maxLongitude = northEast.lng;
  const maxLatitude = northEast.lat;

  return [minLatitude, minLongitude, maxLatitude, maxLongitude];
};

let previousBbox: number[];

export const showVisibleFeatures = async (bounds: L.LatLngBounds, zoomLevel: number = 15) => {
  const currentBbox = convertLatLngBoundsToBoundingBox(bounds);
  if (previousBbox === undefined) {
    previousBbox = currentBbox;
  }
  const movementThreshold = findThreshold(zoomLevel);
  if (calculateBoundingBoxDistance(previousBbox, currentBbox) > movementThreshold) {
    await fetchData(currentBbox);

    previousBbox = currentBbox;
  }
};

const calculateBoundingBoxDistance = (bbox1: number[], bbox2: number[]) => {
  const center1 = [(bbox1[0] + bbox1[2]) / 2, (bbox1[1] + bbox1[3]) / 2];
  const center2 = [(bbox2[0] + bbox2[2]) / 2, (bbox2[1] + bbox2[3]) / 2];

  const dx = center1[0] - center2[0];
  const dy = center1[1] - center2[1];
  return Math.sqrt(dx * dx + dy * dy);
};

const findThreshold = (zoomLevel: number) => {
  let maxThreshold: number;

  switch (true) {
    case zoomLevel >= 16 && zoomLevel < 18:
      maxThreshold = 0.004;
      break;
    case zoomLevel >= 18:
      maxThreshold = 0.002;
      break;
    case zoomLevel >= 13 && zoomLevel < 16:
      maxThreshold = 0.015;
      break;
    default:
      maxThreshold = 0.1;
      break;
  }

  return maxThreshold;
};
export const addConstant = (bbox: number[], zoomLevel: number) => {
  let constant: number;
  switch (true) {
    case zoomLevel >= 16 && zoomLevel < 18:
      constant = 0.004;
      break;
    case zoomLevel >= 18:
      constant = 0.002;
      break;
    default:
      constant = 0.01;
      break;
  }
  const modifiedBbox = bbox.map((value) => value + constant);
  return modifiedBbox;
};
