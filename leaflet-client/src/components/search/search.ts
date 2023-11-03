import 'leaflet-geosearch/dist/geosearch.css';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { map } from '../../main';

import './search.css';

const provider = new OpenStreetMapProvider({
  params: {
    'accept-language': 'no',
    countrycodes: 'no',
    addressdetails: 1,
  },
});

export const renderSearch = () => {
  const searchControl = new (GeoSearchControl as any)({
    provider: provider,
    style: 'bar',
  });
  map.addControl(searchControl);
};
