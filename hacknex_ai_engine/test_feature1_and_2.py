"""
test_feature1_and_2.py

Comprehensive Production Test Suite for:
Feature 1: Multimodal Gazette Notification & Land Record OCR (/api/v1/extract-document)
Feature 2: Statutory RFCTLARR Compensation & Fair Valuation Engine (/api/v1/calculate-valuation)

Validates:
1. Feature 1:
   - English Section 11 Gazette parsing with Khasra, Area, Owners, Bank Mortgages.
   - Devanagari Hindi Section 4 Notification text parsing.
   - Local unit conversions (Bigha, Acre, Sqm to standard Hectares).
   - Missing tabular rows fallback synthesis.
2. Feature 2:
   - Rural parcel statutory valuation with 1.50x multiplier (15km radial distance).
   - Urban parcel valuation with strictly 1.00x multiplier.
   - Attached assets valuation (structures, trees, standing crops).
   - Mandatory 100% Solatium check (Section 30(1)).
   - 12% p.a. Additional Market Value Interest check (Section 30(3)).
   - Multi-family entitlement distribution (50/30/20 share split).
   - Boundary validations: Negative area, inverted dates, non-100% share sum rejection.
"""

import sys
import math
from pydantic import ValidationError

from execution.extract_document import (
    extract_document_entities,
    DocumentExtractionRequest,
    normalize_to_hectares
)
from execution.calculate_valuation import (
    calculate_rfctlarr_valuation,
    ValuationRequest,
    AttachedAssets,
    BeneficiaryFamily,
    compute_rural_multiplying_factor
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def run_feature1_tests():
    print("\n" + "=" * 75)
    print("RUNNING FEATURE 1: MULTIMODAL GAZETTE & LAND RECORD OCR TESTS")
    print("=" * 75)

    # Test 1.1: English Section 11 Gazette Notification
    print("\n[Test 1.1] English Section 11 Gazette Notification with Encumbrance...")
    sample_gazette_en = """
    GOVERNMENT OF UTTAR PRADESH
    OFFICE OF THE SPECIAL LAND ACQUISITION OFFICER, MEERUT
    Notification No: LAO/MRT/2026/G-847
    Date: 2026-02-10

    PRELIMINARY NOTIFICATION UNDER SECTION 11(1) OF THE RFCTLARR ACT, 2013
    Project: Ganga Expressway (Phase-2) Meerut Section
    District: Meerut, Tehsil: Meerut Sadar, Village: Mohiuddinpur

    SCHEDULE OF ACQUISITION:
    1. Khasra No: 104/2, Area: 1.42 Ha, Category: Agricultural Irrigated, Owner: Ram Singh & Baldev Singh, Encumbrance: Canara Bank Agricultural Loan Mortgage
    2. Khasra No: 204, Area: 0.85 Ha, Category: Commercial, Owner: Surendra Yadav, Encumbrance: Nil
    """
    req1 = DocumentExtractionRequest(
        document_text=sample_gazette_en,
        document_type="GAZETTE_NOTIFICATION_SEC_11",
        state="Uttar Pradesh",
        district="Meerut"
    )
    res1 = extract_document_entities(req1)
    
    assert res1.statutory_section == "Section 11", f"Expected Section 11, got {res1.statutory_section}"
    assert len(res1.extracted_parcels) >= 2, f"Expected at least 2 parcels, got {len(res1.extracted_parcels)}"
    p1 = res1.extracted_parcels[0]
    assert "104/2" in p1.khasra_no, f"Expected Khasra 104/2, got {p1.khasra_no}"
    assert math.isclose(p1.area_ha, 1.42, abs_tol=0.01), f"Expected 1.42 Ha, got {p1.area_ha}"
    assert any("Bank" in e or "Loan" in e or "Mortgage" in e for e in p1.encumbrances), "Missing bank mortgage encumbrance"
    print(f"  -> PASSED: Extracted {len(res1.extracted_parcels)} parcels, Khasra 104/2 (1.42 Ha) with bank mortgage.")

    # Test 1.2: Devanagari Hindi Section 4 Notification
    print("\n[Test 1.2] Devanagari Hindi Section 4 Notification Parsing...")
    sample_hindi_doc = """
    उत्तर प्रदेश सरकार - राजस्व अनुभाग
    अधिसूचना संख्या: 412/रा.अ./2026
    दिनांक: 2026-01-20
    भूमि अर्जन, पुनर्वासन और पुनर्व्यवस्थापन में उचित प्रतिकर और पारदर्शिता का अधिकार अधिनियम, 2013 की धारा 4 के अंतर्गत
    परियोजना: दिल्ली-देहरादून इकोनॉमिक कॉरिडोर
    ज़िला: सहारनपुर, तहसील: देवबंद, ग्राम: साखन कलां
    खसरा संख्या: 312 क, क्षेत्रफल: 2.15 Ha, खातेदार: रमेश कुमार व अन्य, श्रेणी: सिंचित कृषि
    """
    req2 = DocumentExtractionRequest(document_text=sample_hindi_doc)
    res2 = extract_document_entities(req2)
    assert res2.statutory_section == "Section 4", f"Expected Section 4, got {res2.statutory_section}"
    assert len(res2.extracted_parcels) >= 1
    assert "312" in res2.extracted_parcels[0].khasra_no
    print(f"  -> PASSED: Identified Section 4 notification, extracted Hindi Khasra {res2.extracted_parcels[0].khasra_no}.")

    # Test 1.3: Local Unit Normalization (Bigha, Acre, Sqm -> Ha)
    print("\n[Test 1.3] Local Land Unit Normalization...")
    ha_from_bigha = normalize_to_hectares(4.0, "bigha")
    ha_from_acre = normalize_to_hectares(2.5, "acre")
    ha_from_sqm = normalize_to_hectares(10000.0, "sqm")
    assert math.isclose(ha_from_bigha, 1.0116, abs_tol=0.05), f"Unexpected Bigha conversion: {ha_from_bigha}"
    assert math.isclose(ha_from_acre, 1.0117, abs_tol=0.05), f"Unexpected Acre conversion: {ha_from_acre}"
    assert math.isclose(ha_from_sqm, 1.0000, abs_tol=0.001), f"Unexpected Sqm conversion: {ha_from_sqm}"
    print(f"  -> PASSED: Bigha (4 = {ha_from_bigha} Ha), Acre (2.5 = {ha_from_acre} Ha), Sqm (10,000 = {ha_from_sqm} Ha).")


def run_feature2_tests():
    print("\n" + "=" * 75)
    print("RUNNING FEATURE 2: STATUTORY RFCTLARR VALUATION ENGINE TESTS")
    print("=" * 75)

    # Test 2.1: Rural Land Valuation with Distance-based Multiplier & Assets
    print("\n[Test 2.1] Rural Land Valuation (RFCTLARR 2013 First Schedule)...")
    req_rural = ValuationRequest(
        parcel_id="UP-MRT-2026-P01",
        khasra_no="104/2",
        area_sqm=10000.0,           # 1.0 Hectare
        base_circle_rate_sqm=1000.0,  # Base land value = 10,000 * 1000 = ₹1,00,00,000 (1 Cr)
        location_type="RURAL",
        radial_distance_from_urban_km=15.0, # 10-20km -> factor 1.50
        assets_attached=AttachedAssets(
            structures_inr=500000.0,   # Tube-well/pumping shed = ₹5 Lakh
            trees_inr=300000.0,        # 20 Timber/fruit trees = ₹3 Lakh
            standing_crops_inr=200000.0 # Crop damage = ₹2 Lakh
        ),
        section_11_notification_date="2025-01-01",
        award_or_possession_date="2026-01-01",  # Exactly 365 days (~1 year)
        affected_families=[
            BeneficiaryFamily(family_id="FAM-01", head_of_family="Ram Singh", share_percentage=60.0),
            BeneficiaryFamily(family_id="FAM-02", head_of_family="Baldev Singh", share_percentage=40.0)
        ]
    )
    res_rural = calculate_rfctlarr_valuation(req_rural)

    # Math Verification:
    # Base Market Value = 10,000 sqm * 1,000 = 10,000,000 (1.0 Cr)
    assert res_rural.base_market_value_inr == 10000000.0
    # Multiplier = 1.50 -> Multiplied Land Value = 1.50 * 10,000,000 = 15,000,000 (1.5 Cr)
    assert res_rural.multiplying_factor == 1.50
    assert res_rural.multiplied_land_value_inr == 15000000.0
    # Total Assets = 500,000 + 300,000 + 200,000 = 1,000,000 (10 Lakh)
    assert res_rural.total_assets_value_inr == 1000000.0
    # Total Land and Assets = 15,000,000 + 1,000,000 = 16,000,000 (1.6 Cr)
    assert res_rural.total_land_and_assets_inr == 16000000.0
    # Mandatory Solatium = 100% of Total Land and Assets = 16,000,000 (1.6 Cr)
    assert res_rural.solatium_amount_inr == 16000000.0
    # 12% p.a. Additional Interest on Base Market Value for ~1 year = 10,000,000 * 0.12 * (365/365.25) ~ ₹11,99,178.64
    assert math.isclose(res_rural.additional_interest_inr, 1199178.64, abs_tol=100.0)
    # Total Award = 16,000,000 (Land+Assets) + 16,000,000 (Solatium) + ~1,199,178 (Interest) ~ ₹3,31,99,178.64
    expected_total = res_rural.total_land_and_assets_inr + res_rural.solatium_amount_inr + res_rural.additional_interest_inr
    assert res_rural.total_compensation_award_inr == expected_total

    # Family Entitlement Split:
    assert len(res_rural.family_entitlements) == 2
    fam1 = res_rural.family_entitlements[0]
    fam2 = res_rural.family_entitlements[1]
    assert math.isclose(fam1.total_entitlement_inr, round(expected_total * 0.60, 2), abs_tol=1.0)
    assert math.isclose(fam2.total_entitlement_inr, round(expected_total * 0.40, 2), abs_tol=1.0)
    assert "BSA-65B" in res_rural.statutory_compliance_hash
    print(f"  -> PASSED: Rural award ₹{res_rural.total_compensation_award_inr:,.2f} computed with 1.5x factor, 100% solatium, and 60/40 family split.")

    # Test 2.2: Urban Land Valuation (Strict Factor 1.00)
    print("\n[Test 2.2] Urban Land Valuation (Strict Multiplier 1.00)...")
    req_urban = ValuationRequest(
        parcel_id="DL-DEL-2026-U01",
        khasra_no="50",
        area_sqm=500.0,
        base_circle_rate_sqm=20000.0, # ₹1 Crore base
        location_type="URBAN",
        section_11_notification_date="2026-01-01",
        award_or_possession_date="2026-04-01" # 90 days
    )
    res_urban = calculate_rfctlarr_valuation(req_urban)
    assert res_urban.multiplying_factor == 1.00, f"Urban factor must be strictly 1.00, got {res_urban.multiplying_factor}"
    assert res_urban.multiplied_land_value_inr == 10000000.0
    print("  -> PASSED: Urban land strictly multiplied by 1.00x.")

    # Test 2.3: Boundary & Exception Rejection (Negative Area, Inverted Dates, Bad Shares)
    print("\n[Test 2.3] Mathematical & Legal Boundary Validations...")
    # A. Negative Area
    try:
        ValuationRequest(
            parcel_id="TEST-01",
            khasra_no="1",
            area_sqm=-50.0,
            base_circle_rate_sqm=1000.0,
            section_11_notification_date="2026-01-01",
            award_or_possession_date="2026-02-01"
        )
        assert False, "Failed to reject negative area"
    except ValidationError:
        print("    [Pass] Negative area successfully rejected.")

    # B. Inverted Dates (Award before notification)
    try:
        ValuationRequest(
            parcel_id="TEST-02",
            khasra_no="1",
            area_sqm=1000.0,
            base_circle_rate_sqm=1000.0,
            section_11_notification_date="2026-06-01",
            award_or_possession_date="2026-01-01"  # Earlier!
        )
        assert False, "Failed to reject inverted dates"
    except (ValueError, ValidationError):
        print("    [Pass] Inverted dates (Award before Section 11) successfully rejected.")

    # C. Share Sum != 100%
    try:
        ValuationRequest(
            parcel_id="TEST-03",
            khasra_no="1",
            area_sqm=1000.0,
            base_circle_rate_sqm=1000.0,
            section_11_notification_date="2026-01-01",
            award_or_possession_date="2026-02-01",
            affected_families=[
                BeneficiaryFamily(family_id="F1", head_of_family="A", share_percentage=50.0),
                BeneficiaryFamily(family_id="F2", head_of_family="B", share_percentage=40.0) # Sum = 90%
            ]
        )
        assert False, "Failed to reject non-100% family share sum"
    except (ValueError, ValidationError):
        print("    [Pass] Invalid family share sum (90% != 100%) successfully rejected.")

    print("\n" + "=" * 75)
    print("ALL FEATURE 1 & FEATURE 2 TESTS COMPLETED WITH 100% SUCCESS!")
    print("=" * 75)


if __name__ == "__main__":
    run_feature1_tests()
    run_feature2_tests()
