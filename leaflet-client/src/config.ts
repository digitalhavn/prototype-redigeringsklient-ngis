import { MapOptions, PathOptions } from 'leaflet';

export const NGIS_PROXY_URL: string = import.meta.env.VITE_NGIS_PROXY_URL;
export const START_LOCATION: [number, number] = [58.14192796858964, 7.995580766614348];
export const MAP_OPTIONS: MapOptions = {
  zoom: 15,
  minZoom: 5,
  maxZoom: 20,
};
export const POLLING_INTERVAL: number = 10 * 1000;
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
