import { MapOptions, PathOptions } from 'leaflet';

export const NGIS_PROXY_URL: string = import.meta.env.VITE_NGIS_PROXY_URL;
export const NGIS_DEFAULT_DATASET: string = import.meta.env.VITE_NGIS_DEFAULT_DATASET;

export const DEFAULT_HTTP_TIMEOUT = 60000 as const;
export const TIMEOUT_WARNING = 10000 as const;

export const START_LOCATION: [number, number] = [59.91681848188529, 10.681740811044816];
export const MAP_OPTIONS: MapOptions = {
  zoom: 15,
  minZoom: 5,
  maxZoom: 20,
};
export const GEO_JSON_STYLE_OPTIONS: Record<string, PathOptions> = {
  LineString: {
    color: 'red',
    weight: 3,
  },
  Polygon: {
    fillColor: 'blue',
    color: 'black',
    weight: 2,
  },
};

export const IGNORED_PROPS = [
  'avgrensesAvKaiområdeGrense',
  'geometry_properties',
  'avgrensesAvLastbegrensningsområdeGrense',
  'kvalitet',
  'ISPSHavneanlegg',
  'avgrensesAvHavneanleggGrense',
];

export const READ_ONLY_PROPS = [
  'identifikasjon',
  'featuretype',
  'ISPS',
  'energikilde',
  'mobil',
  'datafangstdato',
  'oppdateringsdato',
  'kaiId',
  'objektLøpenummer',
];
