/**
 * @vn-gis/map - Vietnam GIS Map Library
 *
 * Entry point chính. Export VNGisMap class, types, và utilities.
 * Renderer cụ thể (Leaflet/MapLibre) được import qua sub-path:
 *   - `@vn-gis/map/leaflet`
 *   - `@vn-gis/map/maplibre`
 */

// Core classes
export { VNGisMap } from './core/VNGisMap';
export { EventEmitter } from './core/EventEmitter';

// Renderer interface
export type { IRenderer, RendererFactory } from './types';

// Types
export type {
  // Core types
  RendererType,
  LatLng,
  BoundsTuple,
  TileLayerOptions,
  // Map configuration
  MapConfig,
  MapOptions,
  // Layer types
  LayerType,
  LayerOptions,
  MarkerOptions,
  LeafletIconOptions,
  MapLibreIconOptions,
  PolygonOptions,
  MultiPolygonOptions,
  GeoJSONOptions,
  GeoJSONStyle,
  // Layer storage
  LayerInstance,
  LayerEntry,
  // Events
  MapEvent,
  MapEventPayload,
  EventHandler,
} from './types';

// Utils & constants
export {
  VN_BOUNDS,
  VN_CENTER,
  VN_DEFAULT_ZOOM,
  VN_MIN_ZOOM,
  VN_MAX_ZOOM,
  VN_CITY_ZOOM,
  VN_DISTRICT_ZOOM,
  VN_STREET_ZOOM,
} from './utils/bounds';
