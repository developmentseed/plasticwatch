# Plasticwatch Website

PlasticWatch is a platform to crowdsource single-use plastic usage and locate restaurants that offer plastic-free choices.

## Installation and Usage

The steps below will walk you through setting up a development environment.

### Install Observe API

The website needs a running instance of [Observe API](https://github.com/developmentseed/observe-api). Please refer to the [Config files](#config-files) section if the API instance has a different hostname than specified at [config/defaults.js](app/assets/scripts/config/defaults.js).

### Prepare OSM Data

To prepare OSM data to be loaded as part PlasticWatch, run the script in `yarn download --query <path-to-overpass-query>` with queries available in directory [utils/overpass-queries](). The script takes an Overpass query and dumps GeoJSON FeatureCollection in `/tmp/{query-id}.geojson`. This  can be directly uploaded to Observe API using the end point  `POST /osmobjects`.

### Install modules dependencies

Requirements:

- [git](https://git-scm.com)
- [nvm](https://github.com/creationix/nvm)
- [yarn](https://yarnpkg.com/docs/install)

[Clone this repository locally](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) and activate required Node.js version:

```
nvm install
```

Install Node.js dependencies:

```
yarn install
```

#### Config files

The config files can be found in `app/assets/scripts/config`. After installing the project, there will be an empty `local.js` that you can use to set the config. This file should not be committed.

Please refer to [defaults.js](app/assets/scripts/config/defaults.js) for the available configuration properties.

### Development

Start server with live code reload at [http://localhost:9000](http://localhost:9000):

    yarn serve

### Build to production

Generate a minified build to `dist` folder:

    yarn build

## Related repositories

- [Observe API](https://github.com/developmentseed/observe-api)

## License

[MIT](LICENSE)
