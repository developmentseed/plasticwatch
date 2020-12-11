/* eslint-disable no-console */
// This script uses an Overpass Query to fetch all data as geojson and upload them to the Observe API database.

// Run: node prepare-osm-data.js --query <query-file>
// Results are stored in /tmp/data.geojson

const fs = require('fs-extra');
const argv = require('yargs').argv;
const fetch = require('node-fetch');
const cover = require('@mapbox/tile-cover');
const centroid = require('@turf/centroid').default;
const path = require('path');
const osmtogeojson = require('osmtogeojson');

const pageSize = 500;

const outputPath = path.join(__dirname, '..', '.geo');

// Helper function to calculate quadkeys
function getQuadkey(feature) {
  const limits = {
    min_zoom: 16,
    max_zoom: 16
  };

  const quadkeys = cover.indexes(feature, limits);
  return quadkeys[0];
}

(async () => {
  if (!argv.query) {
    // eslint-disable-next-line no-console
    console.log('Use --query to supply an Overpass query file');
    process.exit(0);
  }

  if (!argv.host) {
    // eslint-disable-next-line no-console
    console.log('Use --host to provide an API endpoint');
    process.exit(0);
  }

  if (!argv.token) {
    // eslint-disable-next-line no-console
    console.log('Use --token to supply a Authorization token');
    process.exit(0);
  }

  // Create output path
  await fs.ensureDir(outputPath);

  // Get query
  const query = await fs.readFile(argv.query, { encoding: 'UTF-8' });
  
  console.log('Querying Overpass...');

  const basename = path.basename(argv.query);
  const filename = path.parse(basename).name;

  // Fetch from overpass 
  const osmJson = await fetch(
    `https://lz4.overpass-api.de/api/interpreter?data=${query}`
  ).then((response) => response.json());
  await fs.writeJSON(path.join(outputPath, `${filename}.json`), osmJson);
  // const osmJson = await fs.readJSON(path.join(outputPath, `${filename}.json`));

  // Parse into GeoJson
  const geojson = osmtogeojson(osmJson, { flatProperties: true });

  // Add quadkeys to features
  geojson.features = geojson.features.map((feature) => {
    let quadkey;
    if (feature.geometry.type !== 'Point') {
      // find centroid
      const point = centroid(feature.geometry);
      quadkey = getQuadkey(point.geometry);
    } else {
      quadkey = getQuadkey(feature.geometry);
    }

    return {
      ...feature,
      quadkey
    };
  });

  // Write GeoJSON for reviewing
  await fs.writeJSON(path.join(outputPath, `${filename}.geojson`), geojson);

  const pageCount = Math.floor(geojson.features.length / pageSize) + 1;
  console.log(`${pageCount} page(s) found.`);

  // Split file into pages
  for (let i = 0; i < pageCount; i++) {
    const pageStart = i * pageSize;
    const pageEnd = (i + 1) * pageSize;
    const features = geojson.features.slice(pageStart, pageEnd);
    const featureCollection = {
      type: 'FeatureCollection',
      features: features
    };

    console.log(`  - Sending page ${i + 1}...`);

    const res = await fetch(`${argv.host}/osmobjects`, {
      method: 'post',
      body: JSON.stringify(featureCollection),
      headers: { 'Content-Type': 'application/json', Authorization: argv.token }
    }).then((response) => response.json());
    console.log(`    - Response: ${res} places added.`);
  }
})();
