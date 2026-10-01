# Directive: Multimodal Gazette Notification & Land Record OCR

## 1. Goal
Ingest scanned revenue records (Khasra, Khatauni, Record of Rights - RoR) and official government Gazette notifications (Section 4 Social Impact Assessment, Section 11 Preliminary Notification, Section 19 Acquisition Declaration) via image, PDF, or text. Extract structured cadastral entities (survey/khasra numbers, land classification, area in hectares/acres, owner names and shares, and encumbrances) for seamless ingestion into the NLAMS database.

## 2. Inputs
- `document_base64`: Optional base64 encoded image (PNG, JPEG) or PDF document.
- `document_text`: Optional raw or OCR-extracted text of the gazette or land record.
- `document_type`: Optional string hint (`GAZETTE_NOTIFICATION_SEC_4`, `GAZETTE_NOTIFICATION_SEC_11`, `GAZETTE_NOTIFICATION_SEC_19`, `KHASRA_KHATAUNI_ROR`, `SALE_DEED`, `AUTO_DETECT`).
- `state`: Optional state hint (e.g. "Uttar Pradesh", "Maharashtra", "Bihar").
- `district`: Optional district hint.

## 3. Execution Tool
- `execution/extract_document.py`

## 4. Outputs
Structured JSON response:
- `document_type`: Classified document type
- `project_name`: Extracted infrastructure project or scheme name
- `notification_number`: Official gazette or record tracking number
- `notification_date`: Statutory date (YYYY-MM-DD)
- `statutory_section`: Applicable section under RFCTLARR 2013 (Section 4, 11, 19, or 23)
- `state`: State
- `district`: District
- `tehsil`: Tehsil / Taluka
- `village`: Revenue village
- `extracted_parcels`: List of structured parcel entries:
  - `khasra_no`: String (e.g. "104/2", "204 क")
  - `area_ha`: Float in standard Hectares
  - `area_sqm`: Float in square meters
  - `land_category`: String (`AGRICULTURAL_IRRIGATED`, `AGRICULTURAL_UNIRRIGATED`, `COMMERCIAL`, `RESIDENTIAL`, `BARREN_WASTELAND`)
  - `owners`: List of owner names and fraction shares
  - `encumbrances`: List of liabilities, mortgages, or court stay mentions
- `total_notified_area_ha`: Sum of extracted parcel areas
- `confidence_score`: Float between 0.0 and 1.0
- `warnings`: Data quality, OCR ambiguity, or boundary flags

## 5. Domain Rules & Compliance
- Unit Normalization: Convert all local units (Bigha, Biswa, Acre, Guntha) to standard Hectares and Square Meters based on state conversion tables.
- Bilingual Resilience: Parse both Devanagari Hindi and English gazette formats.
- Failover Guarantee: If Gemini Vision API hits rate limits or is offline, fall back to high-precision regex, tokenizers, and revenue dictionary parsing.
- Zero Lossy Assumption: Never hallucinate missing survey numbers. Flag low-confidence entries in `warnings`.
