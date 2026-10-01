"""
test_api.py

Quick test script to verify all 3 AI engine endpoints:
- POST /api/v1/verify-geometry
- POST /api/v1/grievance-triage
- POST /api/v1/generate-award-summary
"""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_health():
    print("\n--- 1. Testing /health ---")
    resp = requests.get(f"{BASE_URL}/health")
    print("Status:", resp.status_code)
    print("Response:", resp.json())


def test_verify_geometry():
    print("\n--- 2. Testing Feature 4: /api/v1/verify-geometry ---")
    payload = {
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
        ]
    }
    resp = requests.post(f"{BASE_URL}/api/v1/verify-geometry", json=payload)
    print("Status:", resp.status_code)
    print("Response:", json.dumps(resp.json(), indent=2))


def test_grievance_triage():
    print("\n--- 3. Testing Feature 3: /api/v1/grievance-triage ---")
    payload = {
        "citizen_query": "Mera survey no 104 hai, compensation ka paisa kab tak mere bank account me aayega?",
        "context_record": {
            "survey_no": "104",
            "project_name": "NH-48 Expressway",
            "status": "DISBURSEMENT_SCHEDULED",
            "compensation_amount": 1850000.0,
            "designated_officer": "SDM / Special LAO"
        }
    }
    resp = requests.post(f"{BASE_URL}/api/v1/grievance-triage", json=payload)
    print("Status:", resp.status_code)
    print("Response:", json.dumps(resp.json(), indent=2))


def test_generate_award_summary():
    print("\n--- 4. Testing Feature 5: /api/v1/generate-award-summary ---")
    payload = {
        "project_id": "NLAMS-DL-2026-08",
        "project_name": "Delhi-Dehradun Economic Corridor Package-3",
        "state": "Delhi / Uttarakhand",
        "district": "North-East Delhi",
        "total_notified_area_ha": 85.5,
        "total_acquired_area_ha": 65.0,
        "total_affected_families": 140,
        "resettled_families": 120,
        "total_compensation_budget_cr": 45.0,
        "disbursed_compensation_cr": 38.5,
        "current_stage": "AWARD",
        "executive_summary_notes": "Statutory notice completed under RFCTLARR 2013."
    }
    resp = requests.post(f"{BASE_URL}/api/v1/generate-award-summary", json=payload)
    print("Status:", resp.status_code)
    print("Response:", json.dumps(resp.json(), indent=2))


if __name__ == "__main__":
    test_health()
    test_verify_geometry()
    test_grievance_triage()
    test_generate_award_summary()
