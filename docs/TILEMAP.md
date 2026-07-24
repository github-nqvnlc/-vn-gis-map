# Tile map (raster basemap)

Tài liệu này mô tả cách cấu hình và thay đổi lớp bản đồ nền trong
`@vn-gis/map`. API tile dùng chung cho cả Leaflet và MapLibre.

## Khái niệm

Basemap là lớp raster nằm dưới marker, polygon và GeoJSON. Package quản lý duy
nhất một basemap tại một thời điểm. Khi gọi `setTileLayer()`, basemap cũ được
gỡ và basemap mới được đặt xuống dưới các overlay hiện có.

Nếu không cấu hình tile, package sử dụng OpenStreetMap:

```text
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## Kiểu dữ liệu

```typescript
export interface TileLayerOptions {
  /** Raster tile URL template */
  url: string;

  /** HTML attribution displayed by the renderer */
  attribution?: string;
}
```

`TileLayerOptions` được export trực tiếp từ entry point:

```typescript
import type { TileLayerOptions } from '@vn-gis/map';
```

| Thuộc tính | Bắt buộc | Mô tả |
|---|---:|---|
| `url` | Có | URL template của raster tile |
| `attribution` | Không | Nội dung ghi nguồn hiển thị trên bản đồ |

## URL template

Một URL raster tile thường có dạng:

```text
https://tile.example.com/{z}/{x}/{y}.png
```

| Placeholder | Ý nghĩa |
|---|---|
| `{z}` | Mức zoom |
| `{x}` | Chỉ số cột tile |
| `{y}` | Chỉ số hàng tile |
| `{s}` | Subdomain, ví dụ `a`, `b`, `c` |
| `{r}` | Hậu tố ảnh retina của Leaflet |

Leaflet xử lý trực tiếp các placeholder trên. Khi dùng MapLibre, package tự
chuẩn hóa `{s}` thành `a` và `{r}` thành chuỗi rỗng.

## Cấu hình basemap ban đầu

Truyền `tileLayer` khi tạo `VNGisMap`:

```typescript
import { VNGisMap } from '@vn-gis/map';

const map = new VNGisMap({
  container: 'map',
  renderer: 'leaflet',
  center: [16.0544, 108.2022],
  zoom: 10,
  tileLayer: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
});
```

Cấu hình tương tự hoạt động với MapLibre:

```typescript
const map = new VNGisMap({
  container: 'map',
  renderer: 'maplibre',
  tileLayer: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
});
```

## Đổi basemap lúc runtime

`setTileLayer(options)` thay basemap trên map instance hiện tại:

```typescript
map.once('ready', () => {
  map.setTileLayer({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  });
});
```

Nên gọi method sau event `ready`, vì renderer và style phải khởi tạo xong trước
khi có thể thay source tile.

Việc đổi tile không:

- destroy hoặc tạo lại map;
- thay đổi center và zoom;
- xóa marker, polygon, MultiPolygon hoặc GeoJSON;
- thay đổi ID của các overlay.

Giá trị mới cũng được cập nhật vào `map.getOptions().tileLayer`.

## Xây dựng menu chọn basemap

```typescript
import type { TileLayerOptions } from '@vn-gis/map';

const TILE_STYLES = [
  {
    id: 'carto-voyager',
    label: 'Carto Voyager',
    options: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  {
    id: 'osm',
    label: 'OpenStreetMap',
    options: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  {
    id: 'carto-dark',
    label: 'Carto Dark',
    options: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
] satisfies Array<{
  id: string;
  label: string;
  options: TileLayerOptions;
}>;

function changeBasemap(tileId: string) {
  const selected = TILE_STYLES.find((tile) => tile.id === tileId);
  if (selected) {
    map.setTileLayer(selected.options);
  }
}
```

Ví dụ HTML tối giản:

```html
<select id="basemap">
  <option value="carto-voyager">Carto Voyager</option>
  <option value="osm">OpenStreetMap</option>
  <option value="carto-dark">Carto Dark</option>
</select>

<script>
  document.getElementById('basemap').addEventListener('change', (event) => {
    changeBasemap(event.target.value);
  });
</script>
```

## Dùng với React

Giữ map instance trong `useRef` và chỉ khởi tạo một lần. Khi lựa chọn tile thay
đổi, gọi `setTileLayer()` trên instance hiện tại:

```tsx
import { useEffect, useRef } from 'react';
import { VNGisMap } from '@vn-gis/map';
import type { TileLayerOptions } from '@vn-gis/map';

function Map({ tile }: { tile: TileLayerOptions }) {
  const mapRef = useRef<VNGisMap | null>(null);

  useEffect(() => {
    const map = new VNGisMap({
      container: 'map',
      renderer: 'leaflet',
      tileLayer: tile,
    });

    mapRef.current = map;
    return () => {
      map.destroy();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyTile = () => map.setTileLayer(tile);
    map.once('ready', applyTile);

    return () => map.off('ready', applyTile);
  }, [tile]);

  return <div id="map" style={{ height: 600 }} />;
}
```

Không đưa `tile` vào dependency của effect khởi tạo map. Làm như vậy sẽ
destroy/recreate renderer mỗi lần đổi basemap và có thể gây xung đột container.

## Lỗi thường gặp

### Tile không hiển thị

Kiểm tra lần lượt:

1. URL có đủ `{z}`, `{x}`, `{y}`.
2. DevTools Network có trả về `200` cho file tile.
3. Tile server có cho phép CORS.
4. Trang HTTPS không gọi tile HTTP.
5. API key hoặc domain allowlist của nhà cung cấp còn hợp lệ.
6. Mức zoom hiện tại nằm trong phạm vi tile server hỗ trợ.

### Basemap đổi nhưng overlay biến mất

Không xóa hoặc tạo lại `VNGisMap`. Chỉ gọi:

```typescript
map.setTileLayer(nextTile);
```

### MapLibre không đổi tile

Chờ event `ready` trước khi gọi `setTileLayer()`. MapLibre chỉ thay được raster
source sau khi style ban đầu đã load.

### URL rỗng

`VNGisMap` chủ động từ chối URL rỗng:

```text
[VNGisMap] Tile layer URL cannot be empty
```

Hãy kiểm tra dữ liệu cấu hình trước khi truyền vào method.

## Attribution và điều khoản sử dụng

Package không sở hữu hoặc phân phối dữ liệu tile. Ứng dụng tích hợp chịu trách
nhiệm:

- hiển thị attribution theo yêu cầu của nhà cung cấp;
- tuân thủ rate limit và chính sách cache;
- bảo vệ API key nếu nhà cung cấp yêu cầu;
- không dùng public tile server cho tải lớn khi điều khoản không cho phép.

## Giới hạn hiện tại

- Chỉ hỗ trợ raster tile URL template.
- Chưa hỗ trợ truyền MapLibre style JSON hoặc vector tile style.
- Chưa cấu hình `tileSize`, `minZoom`, `maxZoom` riêng cho từng tile source.
- MapLibre dùng cố định subdomain `a` khi URL chứa `{s}`.
