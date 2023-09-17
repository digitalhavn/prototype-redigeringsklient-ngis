import { MapOptions } from 'leaflet';

export const NGIS_PROXY_URL: string = import.meta.env.VITE_NGIS_PROXY_URL;
export const START_LOCATION: [number, number] = [59.902205, 10.740768300000013];
export const MAP_OPTIONS: MapOptions = {
  zoom: 15,
};
