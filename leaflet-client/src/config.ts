import { MapOptions } from 'leaflet';

export const NGIS_PROXY_URL: string = import.meta.env.VITE_NGIS_PROXY_URL;
export const WMS_PROXY_URL: string = import.meta.env.VITE_WMS_PROXY_URL;
export const START_LOCATION: [number, number] = [58.14192796858964, 7.995580766614348];
export const MAP_OPTIONS: MapOptions = {
  zoom: 15,
};
