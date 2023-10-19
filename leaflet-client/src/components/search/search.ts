import { OpenStreetMapProvider } from 'leaflet-geosearch';

export const performSearch = async (query: string) => {
  const provider = new OpenStreetMapProvider({
    params: {
      countrycodes: 'no',
    },
  });
  const results = await provider.search({ query });
  return results;
};
