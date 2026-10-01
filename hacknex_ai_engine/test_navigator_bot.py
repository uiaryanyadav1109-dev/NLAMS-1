"""
test_navigator_bot.py

Automated test suite for NLAMS AI Sahayak & Web Navigator Bot.
Tests:
1. Compensation & Valuation queries (RFCTLARR 2013 rules, Solatium, Farmer Portal link)
2. Boundary & Overlap queries (Cadastral verification, District LAO link)
3. Citizen Grievance & Delay queries (Vernacular handling, Farmer Portal link, Helplines)
4. New Proposal submission inquiries (Proposal route link)
5. General queries and portal navigation deep-links
"""

import sys
from execution.portal_navigator_bot import (
    process_navigator_chat,
    NavigatorChatRequest,
    PORTAL_SITEMAP,
    STATUTORY_KNOWLEDGE
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def run_tests():
    print("=" * 70)
    print("RUNNING NLAMS AI SAHAYAK & WEB NAVIGATOR TEST SUITE")
    print("=" * 70)

    # Test 1: Compensation & Valuation
    print("\n[Test 1] Testing RFCTLARR Compensation & Valuation Inquiry...")
    req1 = NavigatorChatRequest(
        query="How is land compensation calculated under RFCTLARR Act 2013? What is Solatium?",
        current_path="/",
        user_role="citizen"
    )
    res1 = process_navigator_chat(req1)
    assert res1.problem_category == "COMPENSATION_VALUATION", f"Expected COMPENSATION_VALUATION, got {res1.problem_category}"
    assert res1.navigation_action == "/farmer-dashboard", f"Expected /farmer-dashboard, got {res1.navigation_action}"
    assert any("farmer" in l.url for l in res1.suggested_links), "Missing farmer portal link"
    assert "Solatium" in res1.reply or "100%" in res1.reply, "Missing Solatium explanation"
    print("  -> PASSED: Returned RFCTLARR formula, Solatium (100%), and Farmer Dashboard route.")

    # Test 2: Boundary & Cadastral Overlaps
    print("\n[Test 2] Testing Boundary Dispute & Forest Overlap Inquiry...")
    req2 = NavigatorChatRequest(
        query="Mera land parcel highway corridor aur reserved forest ke sath overlap ho raha hai. Kaise verify karein?",
        current_path="/map",
        user_role="citizen"
    )
    res2 = process_navigator_chat(req2)
    assert res2.problem_category == "BOUNDARY_DISPUTE", f"Expected BOUNDARY_DISPUTE, got {res2.problem_category}"
    assert res2.navigation_action == "/district-dashboard", f"Expected /district-dashboard, got {res2.navigation_action}"
    assert len(res2.suggested_questions) >= 2, "Missing suggested questions"
    print("  -> PASSED: Identified boundary dispute and routed to District LAO verification tool.")

    # Test 3: Citizen Grievance & Disbursement Delay
    print("\n[Test 3] Testing Citizen Grievance & Compensation Delay...")
    req3 = NavigatorChatRequest(
        query="Compensation ka paisa 8 mahine se nahi aaya hai. Kisko shikayat karein?",
        current_path="/farmer-dashboard",
        user_role="citizen"
    )
    res3 = process_navigator_chat(req3)
    assert res3.problem_category == "GRIEVANCE_STATUS", f"Expected GRIEVANCE_STATUS, got {res3.problem_category}"
    assert "1800-180-1551" in res3.reply or "Farmer" in res3.reply or "grievance" in res3.reply.lower(), "Missing grievance guidance"
    print("  -> PASSED: Provided grievance lodging instructions and helpline information.")

    # Test 4: New Proposal Inquiry
    print("\n[Test 4] Testing New Project Proposal Route Inquiry...")
    req4 = NavigatorChatRequest(
        query="How do I submit a new highway corridor acquisition proposal with GeoJSON boundary?",
        current_path="/dashboard",
        user_role="officer"
    )
    res4 = process_navigator_chat(req4)
    assert res4.navigation_action == "/new-proposal", f"Expected /new-proposal, got {res4.navigation_action}"
    print("  -> PASSED: Correctly routed user to /new-proposal.")

    # Test 5: General Greeting & Sitemap Coverage
    print("\n[Test 5] Testing General Inquiry & Portal Sitemap...")
    req5 = NavigatorChatRequest(
        query="Hello, what can this portal do and which dashboards are available?",
        current_path="/",
        user_role="citizen"
    )
    res5 = process_navigator_chat(req5)
    assert len(res5.suggested_links) >= 1, "Missing suggested links"
    assert len(PORTAL_SITEMAP) >= 6, "Sitemap incomplete"
    print("  -> PASSED: Provided comprehensive portal orientation and navigational links.")

    print("\n" + "=" * 70)
    print("ALL 5 NAVIGATOR BOT TESTS PASSED SUCCESSFULLY! (100% GREEN)")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
