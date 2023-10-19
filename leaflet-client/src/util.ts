import { Feature } from 'geojson';
import L from 'leaflet';

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

export const enableDraggingForLayer = (layers: any) => {
  const layerNames = Object.keys(layers);
  layerNames.forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.LayerGroup || layer instanceof L.FeatureGroup) {
      layer.eachLayer((marker) => {
        //@ts-ignore
        if (marker instanceof L.Marker && marker.options.draggable !== undefined) {
          //@ts-ignore
          marker.options.draggable = true;
        }
      });
    }
  });
};
export const disableDraggingForLayer = (layers: any) => {
  const layerNames = Object.keys(layers);
  layerNames.forEach((layerName: any) => {
    const layer = layers[layerName];
    if (layer instanceof L.LayerGroup || layer instanceof L.FeatureGroup) {
      layer.eachLayer((marker) => {
        //@ts-ignore
        if (marker instanceof L.Marker && marker.options.draggable !== undefined) {
          console.log(layerName);
          //@ts-ignore
          marker.options.draggable = false;
        }
      });
    }
  });
};
