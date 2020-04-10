import turfBbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import tileCover from '@mapbox/tile-cover';
import _flatten from 'lodash.flatten';
import turfCentroid from '@turf/centroid';

const tileLimits = {
  min_zoom: 16,
  max_zoom: 16
};

export function geojsonBbox (geojson) {
  const bbox = turfBbox(geojson);
  return bbox;
}

export function bboxToTiles (bbox) {
  const polygon = bboxPolygon(_flatten(bbox));
  const tiles = tileCover.indexes(polygon.geometry, tileLimits);
  return tiles;
}

export function featuresInBounds (features, bounds) {
  const polygon = bboxPolygon(_flatten(bounds));
  return features.filter((f) => booleanContains(polygon, f));
}

export function geojsonCentroid (geojson) {
  return turfCentroid(geojson.geometry);
}

export function featureTile (feature) {
  const tile = tileCover.indexes(feature.geometry, tileLimits);
  return tile;
}
