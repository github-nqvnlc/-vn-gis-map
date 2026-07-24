# Tài liệu `@vn-gis/map`

Thư mục này chứa **tài liệu kỹ thuật chi tiết** cho package `@vn-gis/map`: phân tích từng file, từng class, từng hàm, và luồng hoạt động bên trong. Tài liệu chính cho **người dùng** thư viện nằm ở [`../README.md`](../README.md); tài liệu trong thư mục này dành cho **người phát triển** muốn hiểu sâu hoặc đóng góp.

---

## Mục lục đầy đủ

### Kiến trúc & cấu trúc (đọc đầu tiên)

| Tài liệu | Nội dung |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tổng quan kiến trúc, sơ đồ phân lớp, luồng dữ liệu, nguyên tắc thiết kế. |
| [`STRUCTURE.md`](./STRUCTURE.md) | Cây thư mục repo + mục đích từng file. |
| [`TYPES.md`](./TYPES.md) | Hệ thống TypeScript type public. |
| [`UTILS.md`](./UTILS.md) | Tiện ích nội bộ: hằng số bounds, TTL cache, style presets. |

### Code chi tiết

| Tài liệu | Nội dung |
|---|---|
| [`CORE.md`](./CORE.md) | Chi tiết `VNGisMap`, `ApiClient`, `EventEmitter`, `LayerManager`. |
| [`RENDERERS.md`](./RENDERERS.md) | Chi tiết `IRenderer`, `LeafletRenderer`, `MapLibreRenderer`. |
| [`TILEMAP.md`](./TILEMAP.md) | Cấu hình raster basemap, đổi tile runtime và xử lý lỗi thường gặp. |

### Vận hành

| Tài liệu | Nội dung |
|---|---|
| [`TESTING.md`](./TESTING.md) | Chạy unit test, coverage, mẹo viết test. |
| [`EXAMPLES.md`](./EXAMPLES.md) | Phân tích `examples/leaflet.html` & `examples/maplibre.html`. |
| [`CI-CD.md`](./CI-CD.md) | Phân tích workflows GitHub Actions. |
| [`RELEASE.md`](./RELEASE.md) | Quy trình release lên npm (SemVer, setup, hotfix, rollback). |

---

## Quy trình tổng quát

```
1. Phát triển & commit code                            <- ARCHITECTURE / STRUCTURE / TYPES / UTILS / CORE / RENDERERS
2. Viết unit test                                       <- TESTING
3. Chạy kiểm thử cục bộ                               <- TESTING
4. Smoke test với examples                              <- EXAMPLES
5. Cập nhật CHANGELOG
6. Bump version + tạo tag                              <- RELEASE
7. Push tag -> GitHub Actions tự publish lên npm       <- CI-CD
```

---

## Cấu trúc thư mục `src/` tóm tắt

```
src/
├── core/                          ⬅ CORE.md
│   ├── ApiClient.ts                 (HTTP + cache + auth)
│   ├── EventEmitter.ts              (pub/sub typed)
│   ├── LayerManager.ts              (registry layer)
│   └── VNGisMap.ts                  (facade chính)
│
├── renderers/                     ⬅ RENDERERS.md
│   ├── base/IRenderer.ts            (interface chung)
│   ├── leaflet/                     (LeafletRenderer + index.ts)
│   └── maplibre/                    (MapLibreRenderer + index.ts)
│
├── types/                         ⬅ TYPES.md
│   ├── api.types.ts                 (GeoJSON + API response)
│   ├── config.types.ts              (VNMapConfig + events)
│   ├── geojson.types.ts             (re-export + type guards)
│   └── index.ts
│
└── utils/                         ⬅ UTILS.md
    ├── bounds.ts                    (hằng số VN)
    ├── cache.ts                     (TTL cache)
    └── style.ts                     (style presets + mergeStyle)
```

---

## Khái niệm quan trọng trong 1 phút

- **`VNGisMap`** là facade duy nhất người dùng tương tác.
- Renderer adapter (`LeafletRenderer` / `MapLibreRenderer`) được inject qua factory → tránh bundle cứng peer dependency.
- `ApiClient` tự động login nếu chỉ có `username`/`password` (không có `token`).
- Cache TTL mặc định 600 giây — đổi token sẽ tự xoá cache.
- Sub-path exports cho phép tree-shake: chỉ import renderer nào bạn dùng.

Xem chi tiết ở [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## CI/CD

Hai workflow điều khiển chất lượng và phát hành:

| Workflow | File | Kích hoạt | Nhiệm vụ |
|---|---|---|---|
| **CI** | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | push / PR lên `main`, `master`, `develop` | typecheck, lint, format check, test (Node 20/22), build + kiểm tra artifact |
| **Release** | [`.github/workflows/release.yml`](../.github/workflows/release.yml) | push tag `v*` | verify lại toàn bộ, publish npm (provenance), tạo GitHub Release |

Chi tiết từng job xem tại [`CI-CD.md`](./CI-CD.md).

---

## Yêu cầu cấu hình một lần

Trước lần release đầu tiên, cần thiết lập (chi tiết trong [`RELEASE.md`](./RELEASE.md)):

- Secret `NPM_TOKEN` (npm Automation token) trong GitHub repository secrets.
- (Khuyến nghị) Environment `npm-production` với người duyệt để kiểm soát bước publish.

---

## Tài liệu liên quan

- [`../README.md`](../README.md) — Hướng dẫn sử dụng thư viện (API, ví dụ React/Vue/Next.js). **Đây là tài liệu chính cho người dùng cuối.**
- [`../CHANGELOG.md`](../CHANGELOG.md) — Lịch sử thay đổi theo version.
- [`../LICENSE`](../LICENSE) — Giấy phép MIT.
