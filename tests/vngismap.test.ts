/**
 * Tests for VNGisMap core functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VNGisMap } from '../src/core/VNGisMap';
import { EventEmitter } from '../src/core/EventEmitter';

// Mock the renderer modules
vi.mock('../src/renderers/leaflet/LeafletRenderer', () => ({
  LeafletRenderer: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    addMarker: vi.fn(),
    addPolygon: vi.fn(),
    addGeoJSON: vi.fn(),
    setTileLayer: vi.fn(),
    removeLayer: vi.fn(),
    setView: vi.fn(),
    fitBounds: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock('../src/renderers/maplibre/MapLibreRenderer', () => ({
  MapLibreRenderer: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    addMarker: vi.fn(),
    addPolygon: vi.fn(),
    addGeoJSON: vi.fn(),
    setTileLayer: vi.fn(),
    removeLayer: vi.fn(),
    setView: vi.fn(),
    fitBounds: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  })),
}));

describe('VNGisMap', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a mock container
    container = document.createElement('div');
    container.id = 'test-map';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    // Clear instances
    VNGisMap.getInstances().forEach((instance) => instance.destroy());
  });

  describe('Constructor', () => {
    it('should create an instance with string container', () => {
      const map = new VNGisMap({ container: 'test-map' });
      expect(map).toBeInstanceOf(VNGisMap);
      expect(map).toBeInstanceOf(EventEmitter);
      map.destroy();
    });

    it('should create an instance with HTMLElement container', () => {
      const map = new VNGisMap({ container });
      expect(map).toBeInstanceOf(VNGisMap);
      map.destroy();
    });

    it('should throw error for non-existent container', () => {
      expect(() => {
        new VNGisMap({ container: 'non-existent-id' });
      }).toThrow('Container element not found');
    });

    it('should set default values when not provided', () => {
      const map = new VNGisMap({ container });
      const options = map.getOptions();
      expect(options?.center).toBeDefined();
      expect(options?.zoom).toBeDefined();
      expect(options?.minZoom).toBeDefined();
      expect(options?.maxZoom).toBeDefined();
      expect(options?.scrollWheelZoom).toBe(true);
      map.destroy();
    });

    it('should accept custom configuration', () => {
      const customCenter: [number, number] = [10.8, 106.6];
      const map = new VNGisMap({
        container,
        center: customCenter,
        zoom: 10,
        minZoom: 5,
        maxZoom: 20,
        scrollWheelZoom: false,
      });
      const options = map.getOptions();
      expect(options?.center).toEqual(customCenter);
      expect(options?.zoom).toBe(10);
      expect(options?.minZoom).toBe(5);
      expect(options?.maxZoom).toBe(20);
      expect(options?.scrollWheelZoom).toBe(false);
      map.destroy();
    });

    it('should use Leaflet renderer by default', () => {
      const map = new VNGisMap({ container });
      expect(map.getRendererType()).toBe('leaflet');
      map.destroy();
    });

    it('should use MapLibre renderer when specified', () => {
      const map = new VNGisMap({ container, renderer: 'maplibre' });
      expect(map.getRendererType()).toBe('maplibre');
      map.destroy();
    });
  });

  describe('addLayer', () => {
    it('should add a marker layer', () => {
      const map = new VNGisMap({ container });
      map.addLayer('test-marker', 'marker', {
        lat: 21.0285,
        lng: 105.8542,
        title: 'Hanoi',
      });
      map.destroy();
    });

    it('should add a polygon layer', () => {
      const map = new VNGisMap({ container });
      map.addLayer('test-polygon', 'polygon', {
        coordinates: [
          [21.0, 105.8],
          [21.1, 105.9],
          [21.0, 105.9],
        ],
        color: '#ff0000',
      });
      map.destroy();
    });

    it('should add a geojson layer', () => {
      const map = new VNGisMap({ container });
      const geojson = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [105.8542, 21.0285],
            },
            properties: {},
          },
        ],
      };
      map.addLayer('test-geojson', 'geojson', { data: geojson });
      map.destroy();
    });

    it('should add a MultiPolygon boundary', () => {
      const map = new VNGisMap({ container });
      map.addMultiPolygon('da-nang-boundary', {
        coordinates: [
          [
            [
              [108.1, 16.12],
              [108.25, 16.08],
              [108.35, 16.05],
              [108.1, 16.12],
            ],
          ],
        ],
        properties: {
          code: '48',
          name: 'Đà Nẵng',
        },
        style: {
          color: '#dc2626',
          fillOpacity: 0.1,
        },
      });
      map.destroy();
    });

    it('should reject an empty MultiPolygon', () => {
      const map = new VNGisMap({ container });
      expect(() =>
        map.addMultiPolygon('empty-boundary', {
          coordinates: [],
        }),
      ).toThrow('MultiPolygon coordinates cannot be empty');
      map.destroy();
    });
  });

  describe('removeLayer', () => {
    it('should remove a layer', () => {
      const map = new VNGisMap({ container });
      map.addLayer('test-layer', 'marker', {
        lat: 21.0285,
        lng: 105.8542,
      });
      map.removeLayer('test-layer');
      map.destroy();
    });
  });

  describe('setView', () => {
    it('should set view with center only', () => {
      const map = new VNGisMap({ container });
      map.setView([21.0285, 105.8542]);
      map.destroy();
    });

    it('should set view with center and zoom', () => {
      const map = new VNGisMap({ container });
      map.setView([21.0285, 105.8542], 12);
      map.destroy();
    });
  });

  describe('setTileLayer', () => {
    it('should replace the basemap without recreating the map', () => {
      const map = new VNGisMap({ container });
      map.setTileLayer({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap',
      });
      expect(map.getOptions()?.tileLayer?.url).toContain('openstreetmap.org');
      map.destroy();
    });

    it('should reject an empty tile URL', () => {
      const map = new VNGisMap({ container });
      expect(() => map.setTileLayer({ url: ' ' })).toThrow('Tile layer URL cannot be empty');
      map.destroy();
    });
  });

  describe('fitBounds', () => {
    it('should fit to bounds', () => {
      const map = new VNGisMap({ container });
      map.fitBounds([
        [21.0, 105.8],
        [21.1, 105.9],
      ]);
      map.destroy();
    });
  });

  describe('Events', () => {
    it('should subscribe to events', () => {
      const map = new VNGisMap({ container });
      const handler = vi.fn();
      map.on('click', handler);
      map.off('click', handler);
      map.destroy();
    });

    it('should handle once events', () => {
      const map = new VNGisMap({ container });
      const handler = vi.fn();
      map.once('ready', handler);
      map.destroy();
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      const map = new VNGisMap({ container });
      map.addLayer('test', 'marker', { lat: 0, lng: 0 });
      map.destroy();
      expect(VNGisMap.getInstances().size).toBe(0);
    });
  });
});

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on', () => {
    it('should register an event handler', () => {
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.emit('test', { data: 'test' });
      expect(handler).toHaveBeenCalled();
    });

    it('should allow multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      emitter.on('test', handler1);
      emitter.on('test', handler2);
      emitter.emit('test');
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('should remove an event handler', () => {
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.off('test', handler);
      emitter.emit('test');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should call handler only once', () => {
      const handler = vi.fn();
      emitter.once('test', handler);
      emitter.emit('test');
      emitter.emit('test');
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('emit', () => {
    it('should pass data to handlers', () => {
      const handler = vi.fn();
      emitter.on('test', handler);
      const testData = { foo: 'bar' };
      emitter.emit('test', testData);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test',
          timestamp: expect.any(Number),
          data: testData,
        }),
      );
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all handlers for specific event', () => {
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.removeAllListeners('test');
      emitter.emit('test');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should remove all handlers when no event specified', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      emitter.on('test1', handler1);
      emitter.on('test2', handler2);
      emitter.removeAllListeners();
      emitter.emit('test1');
      emitter.emit('test2');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});
