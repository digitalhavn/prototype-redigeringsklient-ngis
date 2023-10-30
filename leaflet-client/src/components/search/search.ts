import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { map } from '../../main';
const provider = new OpenStreetMapProvider({
  params: {
    countrycodes: 'no',
  },
});
export const searchInit = () => {
  //@ts-ignore
  const searchControl = new GeoSearchControl({
    provider: provider,
  });
  map.addControl(searchControl);
};
