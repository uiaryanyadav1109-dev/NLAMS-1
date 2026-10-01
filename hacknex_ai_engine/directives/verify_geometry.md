# Directive: Cadastral Boundary & Parcel Overlap Anomaly Detector

## 1. Goal
Validate proposed land acquisition parcel boundaries against existing cadastral parcels, notified corridors, and protected zones (e.g. forest land, water bodies, high-tension lines). Detect overlaps, compute conflict areas, and assign risk status to avoid costly legal disputes.

## 2. Inputs
- `proposed_parcel`: GeoJSON Polygon or array of coordinate pairs `[[lng, lat], ...]`.
- `existing_parcels`: List of existing/notified parcels with metadata:
  - `parcel_id`: String
  - `owner_name`: String (optional)
  - `status`: String (`acquired`, `notified`, `restricted_forest`, `water_body`, etc.)
  - `geometry`: GeoJSON Polygon or coordinate list.
- `overlap_threshold_pct`: Float (Default: 0.1% tolerance for minor GPS drift).

## 3. Execution Tool
- `execution/verify_geometry.py`

## 4. Outputs
Structured JSON response:
- `is_valid`: Boolean (True if no severe overlaps)
- `risk_level`: String (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `total_proposed_area_sqm`: Float
- `total_conflict_area_sqm`: Float
- `overlap_percentage`: Float
- `conflicts`: List of all detected conflict details (all intersecting parcels preserved):
  - `conflicting_parcel_id`: String
  - `conflict_type`: String (`DUPLICATE_CLAIM`, `NOTIFIED_CORRIDOR_OVERLAP`, `ENVIRONMENTAL_RESTRICTION`, `WATER_BODY_RESTRICTION`, `BOUNDARY_OVERLAP`)
  - `source_status`: String (Preserved original status/type of the conflicting parcel)
  - `overlap_area_sqm`: Float
  - `overlap_pct`: Float
  - `intersection_geometry`: GeoJSON Polygon (for map highlight)
- `recommendation`: String (e.g., "Boundary overlaps with Reserved Forest Zone RF-402. Alignment revision required.")

## 5. Edge Cases & Rules
- Topologically invalid / self-intersecting "Bowtie" polygons must NEVER be silently repaired or marked CLEAR; they must be strictly rejected as `INVALID` with root-cause explanations.
- Coordinates must strictly conform to WGS84 range bounds (Lat: [-90, 90], Lng: [-180, 180]).
- Maximum vertex count is capped at 2,000 vertices to prevent Spatial ReDoS thread starvation.
- Large candidate parcel sets (>10) must be indexed via `STRtree` spatial bounding-box indexing before exact intersection computation.
- An overlap is captured if `overlap_pct >= overlap_threshold_pct` OR absolute overlap area is >= 1.0 m² (dual threshold prevents sliver masking).
- MANDATORY RULE: `CLEAR` must ONLY be returned after geometry, coordinates, CRS, precision, complexity, and verification checks all pass without uncertainty. Any critical uncertainty must result in `REJECT`, `INVALID`, or `MANUAL_REVIEW`.

