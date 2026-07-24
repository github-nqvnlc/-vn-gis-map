/**
 * Renderer interface for map libraries
 */

import type {
  MapOptions,
  LatLng,
  BoundsTuple,
  MarkerOptions,
  PolygonOptions,
  GeoJSONOptions,
  TileLayerOptions,
  EventHandler,
} from '../../types';

/**
 * Interface for map renderer implementations
 */
export interface IRenderer {
  /** Initialize the map with container and options */
  initialize(container: HTMLElement, options: MapOptions): void;

  /** Add a marker layer */
  addMarker(id: string, options: MarkerOptions): void;

  /** Add a polygon layer */
  addPolygon(id: string, options: PolygonOptions): void;

  /** Add a GeoJSON layer */
  addGeoJSON(id: string, options: GeoJSONOptions): void;

  /** Replace the raster basemap without recreating the map */
  setTileLayer(options: TileLayerOptions): void;

  /** Remove a layer by ID */
  removeLayer(id: string): void;

  /** Set the map view */
  setView(center: LatLng, zoom?: number): void;

  /** Fit the map to bounds */
  fitBounds(bounds: BoundsTuple): void;

  /** Subscribe to map events */
  on(event: string, handler: EventHandler): void;

  /** Unsubscribe from map events */
  off(event: string, handler: EventHandler): void;

  /** Clean up resources */
  destroy(): void;
}
