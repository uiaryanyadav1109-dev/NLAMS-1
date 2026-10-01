# 🇮🇳 NLAMS: National Land Acquisition & Management System
### *Autonomous Multi-Tier Decision Engine, GIS Cadastral Intelligence & Statutory RFCTLARR Calculator*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet%20GeoJSON-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Tests](https://img.shields.io/badge/Audits-100%25%20Passed-brightgreen)](file:///test_master_resilience_suite.py)

---

## 📌 Executive Summary
**NLAMS (National Land Acquisition & Management System)** is an enterprise-grade statutory automation and geospatial intelligence platform designed for India's linear infrastructure projects (Expressways, Industrial Corridors, and Dedicated Freight Corridors). 

It bridges century-old paper revenue records with statutory compliance under the **RFCTLARR Act 2013** (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act), resolving boundary disputes, preventing cross-record data leakage, and providing a citizen-first vernacular interface for Project Affected Families (PAFs).

---

## 🏗️ 3-Layer System Architecture

NLAMS operates on a 3-layer architecture separating natural language directives, dynamic LLM routing, and deterministic execution tools:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: DIRECTIVES (SOPs)                       │
│  Markdown Standard Operating Procedures in directives/ defining goals, │
│  statutory inputs, edge-case thresholds, and compliance constraints    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    LAYER 2: ORCHESTRATION & ROUTING                    │
│  FastAPI (main.py) + Dynamic Gemini Router with Self-Annealing         │
│  Instant failover to offline deterministic engines under rate-limits   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  LAYER 3: DETERMINISTIC EXECUTION ENGINES               │
│  • Shapely GIS Computational Geometry (verify_geometry.py)             │
│  • First Schedule RFCTLARR Financial Math (calculate_valuation.py)     │
│  • ReportLab Bilingual Unicode Devanagari PDF (generate_award_summary) │
│  • Multilingual Safety & Tele-MANAS Shield (grievance_triage.py)       │
│  • Regex Gazette Entity & Unit Normalizer (extract_document.py)        │
│  • Deep-Linking Contextual Portal Navigator (portal_navigator_bot.py)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ The 7 Core AI Engine Microservices

| # | Microservice | Route | Key Capabilities |
|---|---|---|---|
| **1** | **Multimodal Gazette OCR** | `POST /api/v1/extract-document` | Parses scanned Gazette notifications (Sec 4, 11) & Khasra records. Converts Bigha, Biswa, Guntha, Acre to standard **Hectares**. Detects bank mortgages & KCC liens. |
| **2** | **Statutory RFCTLARR Valuation** | `POST /api/v1/calculate-valuation` | Implements exact First Schedule formula: $[(\text{Land} \times \text{Multiplier}) + \text{Assets}] + 100\%\text{ Solatium} + 12\%\text{ Interest}$. Handles leap years and fractional family share splits with 0 rounding leakage. |
| **3** | **Vernacular Grievance Triage** | `POST /api/v1/grievance-triage` | Hindi, Bhojpuri, Hinglish, & English triage. **Life-Safety Interceptor:** Auto-detects suicide/distress and triggers Tele-MANAS (`14416`). **Privacy Shield:** Withholds records on survey number mismatch. |
| **4** | **Cadastral Topology Anomaly Detector** | `POST /api/v1/verify-geometry` | Rejects self-intersecting "bowtie" loops without lossy repair. Detects parcel overlaps, micro-slivers ($< 5\text{ m}^2$), and triggers alerts within $100\text{ m}$ of protected forest/sanctuary buffer zones. |
| **5** | **Bilingual Statutory Award Dossier** | `POST /api/v1/generate-award-summary` | ReportLab PDF engine with Unicode Devanagari Hindi font support. Validates mathematical business rules ($\text{Resettled} \le \text{Affected}$). Inline PDF download at `/api/v1/download-report/{filename}`. |
| **6** | **AI Sahayak & Web Navigator Bot** | `POST /api/v1/navigator-chat` | Omnipresent floating assistant (`FloatingAIBot.jsx`). Translates user requests into instant deep-link routing cards to `/map`, `/new-proposal`, and `/farmer-dashboard`. |
| **7** | **Dhwani Sahayak (Voice-to-Action)** | `POST /api/v1/voice-query` | Voice AI for less-educated rural landholders. Normalizes spoken dialects (Bhojpuri, Awadhi, Hindi), auto-routes actions (`/map`, `/farmer-dashboard`), and generates conversational Devanagari Hindi audio text for Text-to-Speech (TTS) playback. |

---

## 🗺️ Interactive GIS Land Map (`/map`)
* **Real Corridors:** Overlays GeoJSON alignments for **Ganga Expressway Phase-2**, **Delhi-Mumbai Industrial Corridor (DMIC)**, and **Dedicated Freight Corridor (DFC)**.
* **Cadastral Inspector:** Highlights private parcels, government barren lands, and eco-sensitive wildlife buffers in green, amber, or critical red.
* **Nominatim Geocoding:** Live Indian village/tehsil/district reverse geocoding directly on map clicks.

---

## 🧪 Master Resilience Test Suite

NLAMS features an automated test harness validating all edge cases across the entire pipeline:

```powershell
python test_master_resilience_suite.py
```

### Verified Audit Results:
```
================================================================================
STARTING COMPLETE RESILIENCE AUDIT ON ALL 6 NLAMS AI ENGINE FEATURES
================================================================================
>> AUDITING FEATURE 1: MULTIMODAL GAZETTE OCR & RECORD EXTRACTION
  -> PASSED: All 4 mixed units successfully parsed and normalized to standard Hectares.
  -> PASSED: Handled minimal/noisy input with graceful fallback synthesis and warnings.

>> AUDITING FEATURE 2: STATUTORY RFCTLARR VALUATION ENGINE
  -> PASSED: Distance multipliers transition with mathematical precision.
  -> PASSED: Automatically selected higher registered sale deed value over circle rate.
  -> PASSED: Leap year date difference and 12% statutory interest accurate.
  -> PASSED: Fractional shares distributed with no rounding leak.

>> AUDITING FEATURE 3: VERNACULAR GRIEVANCE TRIAGE & SAFETY SHIELD
  -> PASSED: Life safety interceptor triggered across Hindi, Bhojpuri, and English.
  -> PASSED: Adversarial prompt injection rejected with zero state corruption.
  -> PASSED: Prevented cross-person data leakage when survey numbers desynchronized.

>> AUDITING FEATURE 4: CADASTRAL GEOMETRY & ANOMALY DETECTOR
  -> PASSED: Self-intersecting bowtie rejected strictly without lossy repair.
  -> PASSED: Detected 44.4% forest overlap with statutory alert.

>> AUDITING FEATURE 5: EXECUTIVE AWARD NOTE & PDF GENERATOR
  -> PASSED: Generated valid multi-page PDF with UTF-8 Devanagari.
  -> PASSED: Mathematical boundary rejection (Resettled > Affected families).

>> AUDITING FEATURE 6: AI SAHAYAK & WEB NAVIGATOR BOT
  -> PASSED: Correctly routed complex intent to /new-proposal.
  -> PASSED: Correctly routed Hinglish delay complaint to /farmer-dashboard.

================================================================================
ALL 6 FEATURES PASSED 100% OF INTENSIVE EDGE-CASE AUDITS! (23.00s)
SYSTEM STATUS: PRODUCTION-GRADE, SELF-ANNEALED, ZERO REGRESSIONS
================================================================================
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 2. Backend Setup
```powershell
# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Add your Gemini API key in .env
# GEMINI_API_KEY=your_key_here

# Launch FastAPI microservice
python main.py
```
* Interactive Swagger Docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**
* Health Check: **[http://localhost:8000/health](http://localhost:8000/health)**

### 3. Frontend Setup
```powershell
# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
* Web Portal: **[http://localhost:5173](http://localhost:5173)**
* Interactive GIS Map: **[http://localhost:5173/map](http://localhost:5173/map)**

---

## 🔒 Security, Safety & Legal Disclaimers
1. **Life Safety Defense:** Acute citizen distress triggers emergency referral to the Government of India **Tele-MANAS helpline (14416)** and **Kisan Call Center (1800-180-1551)**.
2. **Tax Immunity Notice:** All awards computed explicitly include statutory tax exemptions under **Section 96 of RFCTLARR Act 2013**.
3. **No Unauthenticated Payouts:** The AI engine has zero executive authority to alter records or sanction funds without Collectorate review.
