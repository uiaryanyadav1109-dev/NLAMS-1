# Directive: Automated Executive R&R & Award Note Generator

## 1. Goal
Synthesize comprehensive land acquisition lifecycle data (Section 4 Notification, Section 11 Preliminary Notification, Section 19 Declaration, Section 23 Award Declaration, RFCTLARR 2013 Compensation & R&R metrics) into a formal, downloadable, government-style Executive Award & Monitoring Note in PDF format.

## 2. Inputs
- `project_id`: String (e.g. "NLAMS-DL-2026-08")
- `project_name`: String (e.g. "Delhi-Dehradun Economic Corridor (Package 3)")
- `state`: String
- `district`: String
- `total_notified_area_ha`: Float
- `total_acquired_area_ha`: Float
- `total_affected_families`: Integer
- `resettled_families`: Integer
- `total_compensation_budget_cr`: Float (in Crores INR)
- `disbursed_compensation_cr`: Float (in Crores INR)
- `current_stage`: String (`PROPOSAL`, `NOTIFICATION`, `HEARING`, `AWARD`, `POSSESSION`, `R&R`)
- `executive_summary_notes`: Optional string or bullet points for custom remarks

## 3. Execution Tool
- `execution/generate_award_summary.py`

## 4. Outputs
- `pdf_path`: File path of the generated PDF in `.tmp/reports/`
- `summary_metadata`:
  - `acquisition_progress_pct`: Float
  - `disbursement_pct`: Float
  - `r_and_r_rehabilitation_pct`: Float
  - `status_flag`: String (`ON_SCHEDULE`, `DELAYED_COMPENSATION`, `LITIGATION_ALERT`)
  - `executive_narrative`: AI-synthesized legal-administrative narrative for the competent authority.

## 5. ReportLab PDF Standards & Business Constraints
- Mathematical Domain Boundary: Resettled families cannot exceed affected families; disbursed compensation cannot exceed 300% of budget; notified area must be > 0.
- Unicode / Devanagari Resilience: ReportLab must dynamically register UTF-8 TrueType fonts (`Nirmala.ttf` / `arial.ttf`) to render Indian regional languages without `UnicodeEncodeError`.
- Sanitization: All officer remarks and text fields must have emojis stripped, unbroken character walls wrapped (<50 chars), and XML special entities escaped (`&amp;`, `&lt;`, `&gt;`) to prevent `LayoutError`.
- Official Header & Formatting: Two-tier running header and footer with dynamic page count canvas ("Page X of Y"), Section 63/65B BSA compliance stub.
- Output: Generated PDFs go into `.tmp/reports/`.

