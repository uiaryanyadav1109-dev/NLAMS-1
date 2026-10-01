"""
test_feature5.py

Thorough automated test suite for Feature 5: Executive Award & R&R Reports.
Endpoints tested:
- POST /api/v1/generate-award-summary
- GET  /api/v1/download-report/{filename}
"""

import os
import sys
from fastapi.testclient import TestClient
from main import app

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)


def test_feature_5_comprehensive():
    print("=" * 75)
    print("FEATURE 5: EXECUTIVE AWARD & R&R REPORTS - COMPREHENSIVE TEST SUITE")
    print("=" * 75)

    # -----------------------------------------------------------------
    # Test 5.1: Standard Infrastructure Corridor Project
    # -----------------------------------------------------------------
    print("\n[5.1] Testing Standard Infrastructure Project Award Note...")
    payload_standard = {
        "project_id": "NHAI-DEL-MUM-PKG-04",
        "project_name": "Delhi-Mumbai Expressway Corridor (Package 4)",
        "state": "Haryana / Rajasthan",
        "district": "Gurugram & Nuh",
        "total_notified_area_ha": 350.75,
        "total_acquired_area_ha": 310.25,
        "total_affected_families": 1250,
        "resettled_families": 1100,
        "total_compensation_budget_cr": 240.50,
        "disbursed_compensation_cr": 215.80,
        "current_stage": "AWARD",
        "executive_summary_notes": "All Section 19 hearings completed. Direct benefit transfers underway without court stay orders."
    }

    res = client.post("/api/v1/generate-award-summary", json=payload_standard)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    print(f"  - Project ID: {data['project_id']}")
    print(f"  - Acquisition Progress: {data['acquisition_progress_pct']}% (Expected ~88.45%)")
    print(f"  - Disbursement Progress: {data['disbursement_pct']}% (Expected ~89.73%)")
    print(f"  - Rehabilitation Progress: {data['rehabilitation_pct']}% (Expected ~88.0%)")
    print(f"  - Status Flag: {data['status_flag']}")
    print(f"  - Download URL: {data['download_url']}")
    print(f"  - PDF Path: {data['pdf_path']}")

    assert 88.0 <= data['acquisition_progress_pct'] <= 89.0
    assert 89.0 <= data['disbursement_pct'] <= 90.5
    assert 87.0 <= data['rehabilitation_pct'] <= 89.0
    assert os.path.exists(data['pdf_path']), f"PDF file does not exist at {data['pdf_path']}"

    # Verify PDF file header
    with open(data['pdf_path'], "rb") as f:
        pdf_bytes = f.read(1024)
        assert pdf_bytes.startswith(b"%PDF"), "Generated file is not a valid PDF binary"
    print("  - PDF binary validation: Valid %PDF header verified on disk")

    # Verify download endpoint
    pdf_filename = os.path.basename(data['pdf_path'])
    dl_res = client.get(f"/api/v1/download-report/{pdf_filename}")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert len(dl_res.content) > 10000
    print(f"  - Download endpoint: Successfully streamed {len(dl_res.content):,} bytes")
    print(">>> [5.1] Standard Corridor Project Award PASSED\n")

    # -----------------------------------------------------------------
    # Test 5.2: Multilingual Regional / Devanagari Hindi Project
    # -----------------------------------------------------------------
    print("[5.2] Testing Bilingual Devanagari Hindi Project...")
    payload_hindi = {
        "project_id": "UP-EXP-GANGA-PKG-02",
        "project_name": "गंगा एक्सप्रेसवे परियोजना (द्वितीय चरण) - मेरठ से प्रयागराज",
        "state": "उत्तर प्रदेश",
        "district": "हापुड़ एवं बुलंदशहर",
        "total_notified_area_ha": 520.0,
        "total_acquired_area_ha": 490.5,
        "total_affected_families": 2400,
        "resettled_families": 2150,
        "total_compensation_budget_cr": 450.0,
        "disbursed_compensation_cr": 410.25,
        "current_stage": "R&R",
        "executive_summary_notes": "भू-अधिग्रहण अधिनियम 2013 के अंतर्गत समस्त प्रतिकर वितरण पारदर्शी डीबीटी प्रणाली द्वारा संपन्न किया जा रहा है।"
    }

    res_hi = client.post("/api/v1/generate-award-summary", json=payload_hindi)
    assert res_hi.status_code == 200, f"Expected 200, got {res_hi.status_code}: {res_hi.text}"
    data_hi = res_hi.json()

    print(f"  - Project ID: {data_hi['project_id']}")
    print(f"  - Acquisition Progress: {data_hi['acquisition_progress_pct']}%")
    print(f"  - PDF Path: {data_hi['pdf_path']}")
    assert os.path.exists(data_hi['pdf_path'])
    print("  - Devanagari Hindi font rendering and PDF compilation completed without UnicodeEncodeError")
    print(">>> [5.2] Bilingual Hindi Project PASSED\n")

    # -----------------------------------------------------------------
    # Test 5.3: Disproportionate / Delayed Compensation Flagging
    # -----------------------------------------------------------------
    print("[5.3] Testing Delayed Disbursement Anomaly Detection...")
    payload_delayed = {
        "project_id": "METRO-PH3-DELAY-01",
        "project_name": "Rapid Rail Extension Phase 3",
        "state": "Delhi NCR",
        "district": "Ghaziabad",
        "total_notified_area_ha": 40.0,
        "total_acquired_area_ha": 35.0,  # 87.5% acquired
        "total_affected_families": 300,
        "resettled_families": 50,        # Only 16.6% resettled
        "total_compensation_budget_cr": 100.0,
        "disbursed_compensation_cr": 15.0, # Only 15% disbursed (severe lag)
        "current_stage": "POSSESSION",
        "executive_summary_notes": "Civil possession attempted before 50% compensation disbursement."
    }

    res_del = client.post("/api/v1/generate-award-summary", json=payload_delayed)
    assert res_del.status_code == 200
    data_del = res_del.json()
    print(f"  - Status Flag: {data_del['status_flag']}")
    print(f"  - Warnings Triggered: {data_del['warnings']}")
    assert len(data_del['warnings']) > 0 or data_del['status_flag'] != "ON_SCHEDULE"
    print(">>> [5.3] Disbursement Anomaly Flagging PASSED\n")

    # -----------------------------------------------------------------
    # Test 5.4: Boundary Constraints & Input Validation (422 / 400 rejection)
    # -----------------------------------------------------------------
    print("[5.4] Testing Mathematical Boundaries & Schema Guardrails...")

    # Case A: Zero notified area
    payload_zero_area = payload_standard.copy()
    payload_zero_area["total_notified_area_ha"] = 0.0
    res_zero = client.post("/api/v1/generate-award-summary", json=payload_zero_area)
    assert res_zero.status_code in [400, 422], f"Expected rejection for 0 area, got {res_zero.status_code}"
    print("  - Zero notified area: Correctly rejected (HTTP 422/400)")

    # Case B: Negative compensation budget
    payload_neg_budget = payload_standard.copy()
    payload_neg_budget["total_compensation_budget_cr"] = -50.0
    res_neg = client.post("/api/v1/generate-award-summary", json=payload_neg_budget)
    assert res_neg.status_code in [400, 422], f"Expected rejection for negative budget, got {res_neg.status_code}"
    print("  - Negative compensation budget: Correctly rejected (HTTP 422/400)")

    # Case C: Resettled families > Total affected families
    payload_overflow_families = payload_standard.copy()
    payload_overflow_families["total_affected_families"] = 100
    payload_overflow_families["resettled_families"] = 500  # Impossible mathematically
    res_overflow = client.post("/api/v1/generate-award-summary", json=payload_overflow_families)
    assert res_overflow.status_code in [400, 422], f"Expected rejection for invalid families, got {res_overflow.status_code}"
    print("  - Resettled > Affected families: Correctly rejected (HTTP 422/400)")

    # Case D: Requesting non-existent PDF download (404 check)
    res_404 = client.get("/api/v1/download-report/non_existent_file.pdf")
    assert res_404.status_code == 404, f"Expected 404 for missing file, got {res_404.status_code}"
    print("  - Download non-existent file: Correctly returned 404 Not Found")
    print(">>> [5.4] Input Validation & Error Guardrails PASSED\n")

    # -----------------------------------------------------------------
    # Test 5.5: Provenance & Attribution Tracking
    # -----------------------------------------------------------------
    print("[5.5] Testing Provenance Summary Integrity...")
    prov = data.get("provenance_summary", {})
    print(f"  - Provenance Summary: {prov}")
    assert prov.get("project_id") == "SOURCE_PROVIDED"
    assert prov.get("acquisition_progress_pct") == "CALCULATED"
    assert prov.get("disbursement_pct") == "CALCULATED"
    print(">>> [5.5] Provenance Summary Integrity PASSED\n")

    print("=" * 75)
    print("🎉 ALL FEATURE 5 (EXECUTIVE AWARD & R&R REPORTS) TESTS PASSED 100%!")
    print("=" * 75)


if __name__ == "__main__":
    test_feature_5_comprehensive()
