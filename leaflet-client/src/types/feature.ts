import { Point, LineString, Polygon, Feature } from 'geojson';

export type NGISFeature = Feature<Point | LineString | Polygon, Record<string, any>>;
