/**
 * VNGisMap - Main facade class
 */

import type {
  MapConfig,
  MapOptions,
  LatLng,
  BoundsTuple,
  LayerType,
  LayerOptions,
  MarkerOptions,
  PolygonOptions,
  MultiPolygonOptions,
  GeoJSONOptions,
  TileLayerOptions,
} from '../types';
import { VN_CENTER, VN_DEFAULT_ZOOM, VN_MIN_ZOOM, VN_MAX_ZOOM } from '../utils/bounds';
import { EventEmitter } from './EventEmitter';
import { LeafletRenderer } from '../renderers/leaflet/LeafletRenderer';
import { MapLibreRenderer } from '../renderers/maplibre/MapLibreRenderer';
import type { IRenderer } from '../types';

/** Map instance storage */
const instances = new Map<string, VNGisMap>();
let instanceCounter = 0;

/**
 * Vietnam GIS Map Library
 *
 * A lightweight library for rendering maps of Vietnam with support for
 * Leaflet and MapLibre GL JS renderers.
 */
export class VNGisMap extends EventEmitter {
  /** Unique instance ID */
  public readonly id: string;

  /** The container element */
  private container: HTMLElement | null = null;

  /** Renderer instance */
  private renderer: IRenderer | null = null;

  /** Resolved map options */
  private options: MapOptions | null = null;

  /**
   * Create a new VNGisMap instance
   */
  constructor(config: MapConfig) {
    super();

    this.id = `vngismap-${++instanceCounter}`;

    // Resolve container
    if (typeof config.container === 'string') {
      const el = document.getElementById(config.container);
      if (!el) {
        throw new Error(`[VNGisMap] Container element not found: ${config.container}`);
      }
      this.container = el;
    } else {
      this.container = config.container;
    }

    // Resolve options with defaults
    this.options = {
      container: this.container,
      renderer: config.renderer ?? 'leaflet',
      center: config.center ?? VN_CENTER,
      zoom: config.zoom ?? VN_DEFAULT_ZOOM,
      maxZoom: config.maxZoom ?? VN_MAX_ZOOM,
      minZoom: config.minZoom ?? VN_MIN_ZOOM,
      bounds: config.bounds,
      scrollWheelZoom: config.scrollWheelZoom ?? true,
      tileLayer: config.tileLayer,
    };

    // Initialize renderer
    this.initializeRenderer();
  }

  /**
   * Initialize the appropriate renderer
   */
  private initializeRenderer(): void {
    if (!this.container || !this.options) return;

    // Create renderer based on type
    if (this.options.renderer === 'maplibre') {
      this.renderer = new MapLibreRenderer();
    } else {
      this.renderer = new LeafletRenderer();
    }

    // Set up event forwarding from renderer
    this.setupRendererEvents();

    // Initialize the renderer
    this.renderer.initialize(this.container, this.options);
  }

  /**
   * Set up event forwarding from renderer to facade
   */
  private setupRendererEvents(): void {
    if (!this.renderer) return;

    const events = [
      'click',
      'dblclick',
      'mousedown',
      'mouseup',
      'mouseover',
      'mouseout',
      'mousemove',
      'contextmenu',
      'zoomstart',
      'zoomend',
      'zoomlevelschange',
      'movestart',
      'move',
      'moveend',
      'dragstart',
      'drag',
      'dragend',
      'resize',
      'layeradd',
      'layerremove',
      'ready',
      'error',
    ];

    events.forEach((eventName) => {
      this.renderer!.on(eventName, (payload) => {
        // Forward to EventEmitter
        this.emit(eventName, payload.data);
        // Emit as global event
        this.emit('*', { type: eventName, data: payload.data });
      });
    });
  }

  /**
   * Add a layer to the map
   *
   * @param id - Unique layer identifier
   * @param type - Layer type: 'marker', 'polygon', or 'geojson'
   * @param options - Layer configuration options
   */
  addLayer(id: string, type: LayerType, options: LayerOptions): void {
    if (!this.renderer) {
      throw new Error('[VNGisMap] Map not initialized');
    }

    switch (type) {
      case 'marker':
        this.renderer.addMarker(id, options as MarkerOptions);
        break;
      case 'polygon':
        this.renderer.addPolygon(id, options as PolygonOptions);
        break;
      case 'geojson':
        this.renderer.addGeoJSON(id, options as GeoJSONOptions);
        break;
      default:
        throw new Error(`[VNGisMap] Unknown layer type: ${type}`);
    }

    this.emit('layeradd', { id, type, options });
  }

  /**
   * Add a GeoJSON MultiPolygon boundary.
   *
   * This is a convenience API for administrative areas such as a selected
   * province or city. Coordinates use the GeoJSON order [longitude, latitude].
   */
  addMultiPolygon(id: string, options: MultiPolygonOptions): void {
    if (!this.renderer) {
      throw new Error('[VNGisMap] Map not initialized');
    }

    if (!options.coordinates.length) {
      throw new Error('[VNGisMap] MultiPolygon coordinates cannot be empty');
    }

    const feature: GeoJSON.Feature<GeoJSON.MultiPolygon> = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: options.coordinates,
      },
      properties: options.properties ?? {},
    };

    this.renderer.addGeoJSON(id, {
      data: feature,
      style: {
        color: '#2563eb',
        fillColor: '#60a5fa',
        fillOpacity: 0.15,
        weight: 3,
        opacity: 1,
        ...options.style,
      },
    });

    this.emit('layeradd', {
      id,
      type: 'geojson',
      geometryType: 'MultiPolygon',
      options,
    });
  }

  /**
   * Remove a layer from the map
   *
   * @param id - Layer identifier to remove
   */
  removeLayer(id: string): void {
    if (!this.renderer) {
      throw new Error('[VNGisMap] Map not initialized');
    }

    this.renderer.removeLayer(id);
    this.emit('layerremove', { id });
  }

  /**
   * Set the map view to a specific center and zoom level
   *
   * @param center - Center coordinates as [lat, lng]
   * @param zoom - Optional zoom level
   */
  setView(center: LatLng, zoom?: number): void {
    if (!this.renderer) {
      throw new Error('[VNGisMap] Map not initialized');
    }

    this.renderer.setView(center, zoom);
  }

  /**
   * Replace the raster basemap without recreating the map or its overlays.
   */
  setTileLayer(options: TileLayerOptions): void {
    if (!this.renderer) {
      throw new Error('[VNGisMap] Map not initialized');
    }
    if (!options.url.trim()) {
      throw new Error('[VNGisMap] Tile layer URL cannot be empty');
    }

    this.renderer.setTileLayer(options);
    if (this.options) {
      this.options.tileLayer = options;
    }
  }

  /**
   * Fit the map to display specific bounds
   *
   * @param bounds - Bounds as [[south, west], [north, east]]
   */
  fitBounds(bounds: BoundsTuple): void {
    if (!this.renderer) {
      throw new Error('[VNGisMap] Map not initialized');
    }

    this.renderer.fitBounds(bounds);
  }

  /**
   * Get the current map options
   */
  getOptions(): MapOptions | null {
    return this.options;
  }

  /**
   * Get the renderer type
   */
  getRendererType(): string | null {
    return this.options?.renderer ?? null;
  }

  /**
   * Clean up and destroy the map instance
   */
  destroy(): void {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    this.container = null;
    this.options = null;

    this.removeAllListeners();
    instances.delete(this.id);
  }

  /**
   * Get all instances (for debugging)
   */
  static getInstances(): Map<string, VNGisMap> {
    return instances;
  }
}
