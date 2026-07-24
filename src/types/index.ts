/**
 * @vn-gis/map - Type definitions
 */

// ============================================
// Core Types
// ============================================

/** Renderer type */
export type RendererType = 'leaflet' | 'maplibre';

/** Coordinate as [lat, lng] */
export type LatLng = [number, number];

/** Bounds as [[south, west], [north, east]] */
export type BoundsTuple = [[number, number], [number, number]];

export interface TileLayerOptions {
  /** Raster tile URL template */
  url: string;
  /** HTML attribution displayed by the renderer */
  attribution?: string;
}

// ============================================
// Map Configuration
// ============================================

export interface MapConfig {
  /** Container element ID or HTMLElement */
  container: string | HTMLElement;
  /** Renderer to use: 'leaflet' or 'maplibre' (default: 'leaflet') */
  renderer?: RendererType;
  /** Center point as [lat, lng] (default: VN center) */
  center?: LatLng;
  /** Initial zoom level (default: 6) */
  zoom?: number;
  /** Maximum zoom level (default: 18) */
  maxZoom?: number;
  /** Minimum zoom level (default: 5) */
  minZoom?: number;
  /** Restrict map panning to these bounds */
  bounds?: BoundsTuple;
  /** Enable scroll wheel zoom (default: true) */
  scrollWheelZoom?: boolean;
  /** Initial raster basemap */
  tileLayer?: TileLayerOptions;
}

export interface MapOptions {
  container: HTMLElement;
  renderer: RendererType;
  center: LatLng;
  zoom: number;
  maxZoom: number;
  minZoom: number;
  bounds?: BoundsTuple;
  scrollWheelZoom: boolean;
  tileLayer?: TileLayerOptions;
}

// ============================================
// Layer Types
// ============================================

export type LayerType = 'marker' | 'polygon' | 'geojson';

export interface MarkerOptions {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Title for tooltip */
  title?: string;
  /** Popup content */
  popup?: string;
  /** Custom icon options (renderer-specific) */
  icon?: LeafletIconOptions | MapLibreIconOptions;
}

export interface LeafletIconOptions {
  /** Icon URL */
  iconUrl?: string;
  /** Icon size as [width, height] */
  iconSize?: [number, number];
  /** Icon anchor as [x, y] */
  iconAnchor?: [number, number];
  /** Popup anchor as [x, y] */
  popupAnchor?: [number, number];
}

export interface MapLibreIconOptions {
  /** Icon name from sprite or URL */
  icon?: string;
  /** Icon size */
  iconSize?: number;
}

export interface PolygonOptions {
  /** Array of coordinates as [lat, lng][] */
  coordinates: [number, number][];
  /** Stroke color (default: '#3388ff') */
  color?: string;
  /** Fill color (default: '#3388ff') */
  fillColor?: string;
  /** Fill opacity (default: 0.2) */
  fillOpacity?: number;
  /** Stroke weight in pixels (default: 2) */
  weight?: number;
  /** Stroke opacity (default: 1) */
  opacity?: number;
}

export interface GeoJSONOptions {
  /** GeoJSON FeatureCollection or Feature */
  data: GeoJSON.FeatureCollection | GeoJSON.Feature;
  /** Style options (renderer-specific) */
  style?: GeoJSONStyle;
}

export interface GeoJSONStyle {
  /** Stroke color */
  color?: string;
  /** Fill color */
  fillColor?: string;
  /** Fill opacity */
  fillOpacity?: number;
  /** Stroke weight */
  weight?: number;
  /** Stroke opacity */
  opacity?: number;
}

/**
 * Options for rendering an administrative boundary or another GeoJSON
 * MultiPolygon. Coordinates follow the GeoJSON order: [longitude, latitude].
 */
export interface MultiPolygonOptions {
  /** GeoJSON MultiPolygon coordinates as [longitude, latitude] */
  coordinates: GeoJSON.MultiPolygon['coordinates'];
  /** Optional properties attached to the generated GeoJSON feature */
  properties?: GeoJSON.GeoJsonProperties;
  /** Boundary and fill style */
  style?: GeoJSONStyle;
}

export type LayerOptions = MarkerOptions | PolygonOptions | GeoJSONOptions | MultiPolygonOptions;

// ============================================
// Layer Storage
// ============================================

export interface LayerInstance {
  id: string;
  type: LayerType;
  instance: unknown;
}

export interface LayerEntry {
  id: string;
  type: LayerType;
  options: LayerOptions;
}

// ============================================
// Events
// ============================================

export type MapEvent =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mouseup'
  | 'mouseover'
  | 'mouseout'
  | 'mousemove'
  | 'contextmenu'
  | 'zoomstart'
  | 'zoomend'
  | 'zoomlevelschange'
  | 'movestart'
  | 'moveend'
  | 'movestart'
  | 'move'
  | 'resize'
  | 'dragstart'
  | 'drag'
  | 'dragend'
  | 'layeradd'
  | 'layerremove'
  | 'baselayerchange'
  | 'overlayadd'
  | 'overlayremove'
  | 'ready'
  | 'error';

export interface MapEventPayload<T = unknown> {
  type: MapEvent;
  timestamp: number;
  data?: T;
}

/** Simple event payload */
export interface EventPayload {
  type: string;
  timestamp: number;
  data?: unknown;
}

export type EventHandler = (payload: EventPayload) => void;

// ============================================
// Factory Types
// ============================================

export interface IRenderer {
  initialize(container: HTMLElement, options: MapOptions): void;
  addMarker(id: string, options: MarkerOptions): void;
  addPolygon(id: string, options: PolygonOptions): void;
  addGeoJSON(id: string, options: GeoJSONOptions): void;
  setTileLayer(options: TileLayerOptions): void;
  removeLayer(id: string): void;
  setView(center: LatLng, zoom?: number): void;
  fitBounds(bounds: BoundsTuple): void;
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  destroy(): void;
}

export interface RendererFactory {
  (map: unknown): IRenderer;
}
