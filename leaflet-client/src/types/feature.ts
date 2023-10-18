import { Point, LineString, Polygon, Feature, GeoJsonProperties } from 'geojson';

export type NGISFeature = Feature<Point | LineString | Polygon, GeoJsonProperties>;
