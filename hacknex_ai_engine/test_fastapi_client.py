"""
test_fastapi_client.py

Tests all FastAPI endpoints directly using Starlette/FastAPI TestClient.
"""

import sys
from fastapi.testclient import TestClient
from main import app

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)


def test_endpoints():
    print("=" * 60)
    print("TESTING FASTAPI MICROSERVICE ENDPOINTS")
    print("=" * 60)

    # 1. Health check
    print("\n1. Testing GET /health...")
    resp = client.get("/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    health_data = resp.json()
    print("Response:", health_data)
    assert health_data["status"] == "healthy"
    print(">>> /health PASSED")

    # 2. Verify Geometry (Feature 4)
    print("\n2. Testing POST /api/v1/verify-geometry...")
    geom_payload = {
        "proposed_geometry": {
            "type": "Polygon",
            "coordinates": [
                [[77.200, 28.600], [77.210, 28.600], [77.210, 28.610], [77.200, 28.610], [77.200, 28.600]]
            ]
        },
        "existing_parcels": [
            {
                "parcel_id": "RESERVED-FOREST-09",
                "status": "restricted_forest",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[77.205, 28.605], [77.215, 28.605], [77.215, 28.615], [77.205, 28.615], [77.205, 28.605]]
                    ]
                }
            }
        ],
        "overlap_threshold_pct": 0.1
    }
    resp = client.post("/api/v1/verify-geometry", json=geom_payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    geom_data = resp.json()
    print(f"Risk Level: {geom_data.get('risk_level')}, Legal Status: {geom_data.get('legal_status')}")
    print(f"Conflicts found: {len(geom_data.get('conflicts', []))}")
    assert geom_data["legal_status"] == "REQUIRES_AUTHORITY_VERIFICATION"
    print(">>> /api/v1/verify-geometry PASSED")

    # 3. Grievance Triage (Feature 3)
    print("\n3. Testing POST /api/v1/grievance-triage...")
    grievance_payload = {
        "citizen_query": "Mera survey no 104 hai Ganga Expressway ke liye, compensation ka paisa kab tak aayega?",
        "preferred_language": "hi",
        "context_record": {
            "survey_no": "104",
            "project_name": "Ganga Expressway",
            "status": "AWARD_PASSED",
            "compensation_amount": 1850000.0,
            "designated_officer": "Special LAO"
        }
    }
    resp = client.post("/api/v1/grievance-triage", json=grievance_payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    grievance_data = resp.json()
    print(f"Category: {grievance_data.get('category')}, Priority: {grievance_data.get('priority')}")
    print(f"Language: {grievance_data.get('detected_language')}")
    assert grievance_data.get("category") is not None
    print(">>> /api/v1/grievance-triage PASSED")

    # 4. Generate Award Summary (Feature 5)
    print("\n4. Testing POST /api/v1/generate-award-summary...")
    award_payload = {
        "project_id": "NLAMS-DL-2026-TEST",
        "project_name": "Delhi-Dehradun Expressway",
        "state": "Delhi",
        "district": "North East Delhi",
        "total_notified_area_ha": 120.0,
        "total_acquired_area_ha": 95.0,
        "total_affected_families": 200,
        "resettled_families": 180,
        "total_compensation_budget_cr": 50.0,
        "disbursed_compensation_cr": 42.5,
        "current_stage": "AWARD",
        "executive_summary_notes": "Statutory notice completed under RFCTLARR 2013."
    }
    resp = client.post("/api/v1/generate-award-summary", json=award_payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    award_data = resp.json()
    print(f"PDF Path: {award_data.get('pdf_path')}")
    print(f"Acquisition Progress: {award_data.get('acquisition_progress_pct')}%")
    print(f"Disbursement Progress: {award_data.get('disbursement_pct')}%")
    assert award_data.get("pdf_path") is not None
    print(">>> /api/v1/generate-award-summary PASSED")

    # 5. Download Report test
    import os
    filename = os.path.basename(award_data["pdf_path"])
    print(f"\n5. Testing GET /api/v1/download-report/{filename}...")
    resp = client.get(f"/api/v1/download-report/{filename}")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    assert resp.headers["content-type"] == "application/pdf"
    print(f"PDF File downloaded successfully ({len(resp.content)} bytes)")
    print(">>> /api/v1/download-report PASSED")

    print("\n" + "=" * 60)
    print("🎉 ALL FASTAPI ENDPOINTS VERIFIED AND WORKING PERFECTLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_endpoints()
