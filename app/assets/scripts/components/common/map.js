import React, { Component } from 'react';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import { connect } from 'react-redux';
import { wrapApiResult, getFromState } from '../../redux/utils';
import * as actions from '../../redux/actions/places';
import { PropTypes as T } from 'prop-types';
import { withRouter, matchPath } from 'react-router-dom';
import _isEqual from 'lodash.isequal';
import { geojsonBbox, bboxToTiles } from '../../utils/geo';
import { getMarker } from '../../utils/utils';
import { mapConfig } from '../../config';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

// Mapbox access token
mapboxgl.accessToken = mapConfig.mapboxAccessToken;

const MapContainer = styled.div`
  height: 100%;
`;

const markerQuestion = new Image(45, 60);
markerQuestion.src = './assets/graphics/map/marker-question.png';

const markerTick = new Image(45, 60);
markerTick.src = './assets/graphics/map/marker-tick.png';

const markerX = new Image(45, 60);
markerX.src = './assets/graphics/map/marker-xmark.png';

class Map extends Component {
  constructor (props) {
    super(props);
    this.state = {
      mapLoaded: false,
      isSourceLoaded: false,
      geojson: {
        type: 'FeatureCollection',
        features: []
      },
      filters: [
        ['!=', 'id', ''],
        ['==', 'id', '']
      ],
      bounds: null,
      selectedFeature: null
    };
  }

  static getDerivedStateFromProps (props, state) {
    const { placeId, places, match, place } = props;

    let geojson;
    let bounds = null;
    if (places.isReady()) {
      geojson = {
        type: 'FeatureCollection',
        features: places.getData()
      };
      bounds = geojsonBbox(geojson);
    }

    let filters = state.filters;
    let selectedFeature = false;
    if (match && place.isReady()) {
      filters[0] = ['==', 'id', placeId];
      filters[1] = ['!=', 'id', placeId];
      const feature = place.getData();
      selectedFeature = feature.id;
      bounds = geojsonBbox(feature);
    } else {
      filters[0] = ['!=', 'id', ''];
      filters[1] = ['==', 'id', ''];
    }

    if (
      _isEqual(state.geojson, geojson) &&
      _isEqual(filters, state.filters) &&
      _isEqual(bounds, state.bounds) &&
      _isEqual(selectedFeature, state.selectedFeature)
    ) {
      return null;
    }

    // set icon names
    if (geojson) {
      geojson.features.forEach(feature => {
        feature.properties.icon = getMarker(feature);
      });
    }

    return {
      geojson,
      filters,
      bounds,
      selectedFeature
    };
  }

  componentDidMount () {
    const { mapLoaded } = this.state;
    const { isReady } = this.props.places;

    // Bypass if map is already loaded
    if (mapLoaded) {
      return;
    }

    if (!isReady()) {
      showGlobalLoading();
    }

    // Mount the map on the net tick to prevent the right side gap.
    setTimeout(() => this.initMap(), 0);
  }

  componentDidUpdate () {
    if (this.state.isSourceLoaded) {
      this.updateData();
      this.updateFilter();
    }
  }

  componentWillUnmount () {
    if (this.map) {
      this.map.remove();
    }
  }

  getVisibleTiles () {
    const bounds = this.map.getBounds();
    return bboxToTiles(bounds.toArray());
  }

  updateData () {
    this.map.getSource('placesSource').setData(this.state.geojson);
  }

  updateFilter () {
    this.map.setFilter('selectedPlacesLayer', this.state.filters[1]);
    this.map.setFilter('placesLayer', this.state.filters[0]);
  }

  initMap () {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: mapConfig.style,
      bounds: this.props.initialBounds,
      attributionControl: false,
      fitBoundsOptions: mapConfig.fitBoundsOptions
    });

    // Add attribution.
    this.map.addControl(
      new mapboxgl.AttributionControl({
        compact: false
      })
    );

    // Disable map rotation using touch rotation gesture.
    this.map.touchZoomRotate.disableRotation();

    // Add zoom controls.
    this.map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false
      }),
      'bottom-right'
    );

    // Add Geolocation control
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showAccuracyCircle: true
      })
    );

    this.map.on('moveend', () => {
      this.props.handleMapMove(this.map.getBounds().toArray());
    });

    // ensure the source is added
    this.map.on('sourcedata', e => {
      if (e.sourceId === 'placesSource' && !this.state.isSourceLoaded) {
        this.setState({
          isSourceLoaded: true
        });
      }
    });

    this.map.on('load', () => {
      this.setState({ mapLoaded: true });
      // add the geojson from state as a source to the map
      this.map.addSource('placesSource', {
        type: 'geojson',
        data: null
      });

      this.map.addImage('markerQuestion', markerQuestion);
      this.map.addImage('markerTick', markerTick);
      this.map.addImage('markerX', markerX);

      this.map.addLayer({
        id: 'placesLayer',
        type: 'symbol',
        source: 'placesSource',
        layout: {
          'icon-image': '{icon}',
          'icon-allow-overlap': true,
          'icon-size': 0.4
        },
        filter: ['!=', 'id', '']
      });

      this.map.addLayer({
        id: 'selectedPlacesLayer',
        type: 'symbol',
        source: 'placesSource',
        layout: {
          'icon-image': '{icon}',
          'icon-size': 0.4
        },
        paint: {
          'icon-opacity': 0.5
        },
        filter: ['==', 'id', '']
      });

      // bind an event to select the symbol
      this.map.on('click', e => {
        // add a small buffer so clicks are registered properly
        const width = 10;
        const height = 10;

        const feature = this.map.queryRenderedFeatures(
          [
            [e.point.x - width / 2, e.point.y - height / 2],
            [e.point.x + width / 2, e.point.y + height / 2]
          ],
          { layers: ['placesLayer'] }
        )[0];

        if (feature && !this.state.selectedFeature) {
          this.props.history.push(`/explore/${feature.properties.id}`);
          this.props.handleMapMove(this.map.getBounds().toArray());
        }

        if (!feature || feature.properties.id === this.state.selectedFeature) {
          this.props.history.push('/explore');
        }
      });
    });
  }

  renderMap () {
    const { isReady, hasError } = this.props.places;

    if (isReady()) {
      hideGlobalLoading();
    }

    if (hasError()) {
      // handle errors
      return <></>;
    }

    return (
      <>
        <MapContainer>
          {mapboxgl.supported() ? (
            <div
              ref={r => {
                this.mapContainer = r;
              }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className='mapbox-no-webgl'>
              <p>WebGL is not supported or disabled.</p>
            </div>
          )}
        </MapContainer>
      </>
    );
  }

  render () {
    return <div>{this.renderMap()}</div>;
  }
}

Map.propTypes = {
  handleMapMove: T.func,
  initialBounds: T.array,
  places: T.object,
  placeId: T.object,
  place: T.object,
  match: T.object,
  history: T.object
};

function mapStateToProps (state, props) {
  const match = matchPath(props.location.pathname, {
    path: '/explore/:type/:id',
    exact: true
  });

  let placeId = null;
  let place = null;
  if (match) {
    const { type, id } = match.params;
    placeId = `${type}/${id}`;
    place = wrapApiResult(getFromState(state, `places.individual.${placeId}`));
  }
  return {
    places: wrapApiResult(getFromState(state, `places.list`)),
    match: match,
    placeId: placeId,
    place: place
  };
}

function dispatcher (dispatch) {
  return {
    fetchTiles: (...args) => dispatch(actions.fetchTiles(...args)),
    fetchPlaces: (...args) => dispatch(actions.fetchPlaces(...args)),
    fetchPlace: (...args) => dispatch(actions.fetchPlace(...args))
  };
}

export default withRouter(connect(mapStateToProps, dispatcher)(Map));
