export interface Dataset {
  id: string;
  name: string;
  bbox?: {
    ll: [number, number];
    ur: [number, number];
  };
}
