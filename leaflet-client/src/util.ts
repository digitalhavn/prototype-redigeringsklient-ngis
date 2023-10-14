import { Feature } from 'geojson';

export const findPath = (feature: Feature) => {
  const { featuretype } = feature.properties!;
  let path = '';
  let moveable = '';
  if (['Drivstofftilkobling', 'Kran'].includes(featuretype)) {
    if (feature.properties!.mobil) {
      moveable = 'mobil';
    } else {
      moveable = 'fast';
    }
    path = `${featuretype}/${featuretype} - ${moveable}/${featuretype}_${moveable}.png`;
  } else if (featuretype === 'Beredskapspunkt') {
    if (
      ['brannslange', 'samlingsplass', 'brannhydrant', 'førstehjelp', 'branslukningsapparat'].includes(
        feature.properties!.beredskapstype[0],
      )
    ) {
      path = 'Beredskapspunkt - Annen/Beredskapspunkt - Annen/beredskapspunkt---annen.png';
    } else {
      path = `${featuretype} - ${feature.properties!.beredskapstype}/${featuretype} - ${
        feature.properties!.beredskapstype
      }/${featuretype}---${feature.properties!.beredskapstype}.png`;
    }
  } else if (featuretype === 'Havnesensor') {
    path = `${featuretype}/${featuretype} ${feature.properties!.sensortype}/${featuretype}_${
      feature.properties!.sensortype
    }.png`;
  } else if (featuretype === 'VAUttak') {
    path = `Vanntilkobling/Vanntilkobling ${feature.properties!.VAuttakstype}/Vanntilkobling_${
      feature.properties!.VAuttakstype
    }.png`;
  } else {
    path = `${featuretype}/${featuretype}/${featuretype}.png`;
  }
  const modifiedpath = path.replace(/ø/g, 'o');
  return modifiedpath;
};

export const setLoading = (isLoading: boolean) => {
  const loader = document.getElementById('loading-container')!;
  loader.style.display = isLoading ? 'block' : 'none';
};
