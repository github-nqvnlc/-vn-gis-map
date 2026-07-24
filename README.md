# @vn-gis/map

> Thư viện bản đồ GIS Việt Nam - Nhẹ, hỗ trợ Leaflet và MapLibre GL JS.

[![npm version](https://img.shields.io/npm/v/@vn-gis/map.svg)](https://www.npmjs.com/package/@vn-gis/map)
[![npm downloads](https://img.shields.io/npm/dm/@vn-gis/map.svg)](https://www.npmjs.com/package/@vn-gis/map)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Tổng quan

`@vn-gis/map` cung cấp API thống nhất để hiển thị bản đồ Việt Nam, tương thích với nhiều engine render.

## Tính năng

- **Dual Renderer**: Tương thích Leaflet và MapLibre GL JS
- **Cấu hình sẵn VN**: Bounds, tâm bản đồ, zoom cho Việt Nam
- **Quản lý Layer**: Markers, polygons, GeoJSON tùy chỉnh
- **Hệ thống Events**: Click, zoom, di chuyển
- **TypeScript**: Đầy đủ type definitions
- **Bundle**: ESM / CJS / UMD, tree-shakeable

---

## Cài đặt

```bash
npm install @vn-gis/map
```

Cài **một** trong hai renderer (peer dependency):

```bash
# Leaflet
npm install leaflet

# Hoặc MapLibre
npm install maplibre-gl
```

---

## Bắt đầu nhanh

### Leaflet

```javascript
import { VNGisMap, VN_CENTER, VN_BOUNDS } from '@vn-gis/map';

const map = new VNGisMap({
  container: 'map',
  renderer: 'leaflet',
  center: VN_CENTER,
  zoom: 6,
  bounds: VN_BOUNDS,
});

// Thêm marker
map.addLayer('hanoi', 'marker', {
  lat: 21.0285,
  lng: 105.8542,
  title: 'Hà Nội',
  popup: '<strong>Hà Nội</strong><br/>Thủ đô Việt Nam',
});

// Lắng nghe sự kiện
map.on('click', (payload) => {
  console.log('Click tại:', payload.data.lat, payload.data.lng);
});

map.once('ready', () => {
  console.log('Bản đồ sẵn sàng!');
});
```

### MapLibre GL JS

```javascript
import { VNGisMap, VN_CENTER } from '@vn-gis/map';

const map = new VNGisMap({
  container: 'map',
  renderer: 'maplibre',
  center: VN_CENTER,
  zoom: 6,
});
```

---

## Cấu hình

### MapConfig

| Thuộc tính | Loại | Mặc định | Mô tả |
|---|---|---|---|
| `container` | `string \| HTMLElement` | **bắt buộc** | Container ID hoặc HTMLElement |
| `renderer` | `'leaflet' \| 'maplibre'` | `'leaflet'` | Engine render |
| `center` | `[lat, lng]` | `VN_CENTER` | Tọa độ tâm |
| `zoom` | `number` | `6` | Zoom ban đầu |
| `minZoom` | `number` | `5` | Zoom tối thiểu |
| `maxZoom` | `number` | `18` | Zoom tối đa |
| `bounds` | `[[lat, lng], [lat, lng]]` | `VN_BOUNDS` | Giới hạn kéo bản đồ |
| `scrollWheelZoom` | `boolean` | `true` | Zoom bằng con lăn chuột |
| `tileLayer` | `TileLayerOptions` | OpenStreetMap | Raster basemap ban đầu |

---

## Tile map (basemap)

Package nhận raster tile theo URL template. Hai placeholder bắt buộc phổ biến là
`{z}`, `{x}`, `{y}`; Leaflet còn hỗ trợ trực tiếp `{s}` và `{r}`.

### Cấu hình tile ban đầu

```typescript
import { VNGisMap } from '@vn-gis/map';
import type { TileLayerOptions } from '@vn-gis/map';

const voyager: TileLayerOptions = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; OpenStreetMap contributors &copy; CARTO',
};

const map = new VNGisMap({
  container: 'map',
  renderer: 'leaflet',
  center: [16.0544, 108.2022],
  zoom: 10,
  tileLayer: voyager,
});
```

Nếu không truyền `tileLayer`, package sử dụng OpenStreetMap làm basemap mặc định.

### Đổi tile khi bản đồ đang chạy

Gọi `setTileLayer()` sau event `ready`. Package chỉ thay base tile hiện tại,
không tạo lại map và không xóa marker, polygon hoặc GeoJSON đang hiển thị.

```typescript
map.once('ready', () => {
  map.setTileLayer({
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  });
});
```

Ví dụ tạo bộ chọn basemap:

```typescript
const tileStyles: Record<string, TileLayerOptions> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  imagery: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
};

function selectBasemap(id: keyof typeof tileStyles) {
  map.setTileLayer(tileStyles[id]);
}
```

Lưu ý:

- `url` không được rỗng; nếu rỗng, package sẽ throw error.
- Với MapLibre, package tự đổi `{s}` thành subdomain `a` và bỏ `{r}` để dùng
  được các URL template phổ biến của Leaflet.
- Tile server phải cho phép CORS và HTTPS nếu ứng dụng chạy bằng HTTPS.
- Luôn giữ attribution và tuân thủ điều khoản sử dụng, giới hạn request hoặc API
  key của nhà cung cấp tile.
- `setTileLayer()` chỉ dành cho raster tile URL, không nhận MapLibre style JSON.

Xem hướng dẫn đầy đủ tại [docs/TILEMAP.md](docs/TILEMAP.md).

---

## Layers

### Marker

```javascript
map.addLayer('marker-id', 'marker', {
  lat: 21.0285,
  lng: 105.8542,
  title: 'Hà Nội',           // Tooltip
  popup: '<strong>Hà Nội</strong>',  // Popup
  icon: {
    iconUrl: '/path/to/icon.png',
    iconSize: [32, 32],
  },
});
```

### Polygon

```javascript
map.addLayer('polygon-id', 'polygon', {
  coordinates: [
    [21.0, 105.8],
    [21.1, 105.9],
    [21.0, 105.9],
  ],
  color: '#ff5722',
  fillColor: '#ff5722',
  fillOpacity: 0.3,
  weight: 2,
});
```

### GeoJSON

```javascript
const geojsonData = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [105.8542, 21.0285],
    },
    properties: { name: 'Hanoi' },
  }],
};

map.addLayer('geojson-id', 'geojson', {
  data: geojsonData,
  style: {
    color: '#3388ff',
    fillColor: '#3388ff',
    fillOpacity: 0.2,
    weight: 2,
  },
});
```

### Xóa Layer

```javascript
map.removeLayer('marker-id');
```

### MultiPolygon (ranh giới tỉnh/thành phố)

`addMultiPolygon` nhận tọa độ theo chuẩn GeoJSON `[longitude, latitude]`:

```javascript
const selectedCity = geojson.features.find(
  (feature) => feature.properties.code === '48',
);

if (selectedCity?.geometry.type === 'MultiPolygon') {
  map.addMultiPolygon('selected-city', {
    coordinates: selectedCity.geometry.coordinates,
    properties: selectedCity.properties,
    style: {
      color: '#dc2626',
      fillColor: '#f87171',
      fillOpacity: 0.15,
      weight: 3,
    },
  });
}
```

Đổi thành phố được chọn bằng cách xóa layer cũ rồi thêm layer mới:

```javascript
map.removeLayer('selected-city');
map.addMultiPolygon('selected-city', nextCityOptions);
```

---

## API Reference

### VNGisMap Methods

| Phương thức | Mô tả |
|---|---|
| `addLayer(id, type, options)` | Thêm layer |
| `addMultiPolygon(id, options)` | Hiển thị ranh giới MultiPolygon |
| `setTileLayer(options)` | Đổi raster basemap mà không tạo lại bản đồ |
| `removeLayer(id)` | Xóa layer theo ID |
| `setView(center, zoom?)` | Đặt tâm và zoom |
| `fitBounds(bounds)` | Phóng bounds |
| `on(event, handler)` | Lắng nghe sự kiện |
| `off(event, handler)` | Hủy lắng nghe |
| `once(event, handler)` | Lắng nghe một lần |
| `getOptions()` | Lấy options hiện tại |
| `getRendererType()` | Lấy loại renderer |
| `destroy()` | Dọn dẹp bản đồ |

### Events

| Sự kiện | Mô tả |
|---|---|
| `ready` | Bản đồ sẵn sàng |
| `click` | Click vào bản đồ |
| `dblclick` | Double click |
| `zoomstart` | Bắt đầu zoom |
| `zoomend` | Kết thúc zoom |
| `movestart` | Bắt đầu di chuyển |
| `moveend` | Kết thúc di chuyển |
| `layeradd` | Layer được thêm |
| `layerremove` | Layer được xóa |

---

## Constants

```typescript
import {
  VN_CENTER,        // [14.0583, 108.2772] - Tâm Việt Nam
  VN_BOUNDS,        // [[8.18, 102.14], [23.24, 109.47]] - Giới hạn
  VN_DEFAULT_ZOOM,  // 6 - Zoom mặc định
  VN_MIN_ZOOM,      // 5 - Zoom tối thiểu
  VN_MAX_ZOOM,      // 18 - Zoom tối đa
  VN_CITY_ZOOM,     // 12 - Zoom thành phố
  VN_DISTRICT_ZOOM, // 14 - Zoom quận/huyện
  VN_STREET_ZOOM,   // 16 - Zoom đường/phố
} from '@vn-gis/map';
```

---

## Sử dụng trên Browser

```html
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- VNGisMap -->
<script type="module">
  import { VNGisMap } from './dist/index.umd.js';

  const map = new VNGisMap({
    container: 'map',
    renderer: 'leaflet',
  });
</script>
```

---

## TypeScript

```typescript
import type {
  MapConfig,
  MarkerOptions,
  PolygonOptions,
  GeoJSONOptions,
  TileLayerOptions,
  LatLng,
  BoundsTuple,
} from '@vn-gis/map';
```

---

## Framework Integration

Xem [docs-v2.0.0/GUIDES.md](docs-v2.0.0/GUIDES.md) cho hướng dẫn chi tiết:
- [Vanilla JavaScript](docs-v2.0.0/GUIDES.md#vanilla-javascript)
- [React](docs-v2.0.0/GUIDES.md#react)
- [Next.js](docs-v2.0.0/GUIDES.md#nextjs)
- [Vue.js](docs-v2.0.0/GUIDES.md#vuejs)

---

## Documentation

- [Hướng dẫn chi tiết](docs-v2.0.0/GUIDES.md)
- [API Reference](docs-v2.0.0/API.md)
- [Architecture](docs-v2.0.0/ARCHITECTURE.md)
- [Examples](docs-v2.0.0/EXAMPLES.md)
- [Release Process](docs-v2.0.0/RELEASE.md)

---

## License

[MIT](./LICENSE)
