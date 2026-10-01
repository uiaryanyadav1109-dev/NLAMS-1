"""
test_voice_query_engine.py

Automated 7-Language Resilience Test Suite for NLAMS Dhwani Sahayak
Tests:
1. Hindi (हिंदी)
2. Bengali (বাংলা)
3. Gujarati (ગુજરાતી)
4. Marathi (मराठी)
5. Punjabi (ਪੰਜਾਬੀ)
6. Haryanvi (हरियाणवी)
7. Bhojpuri (भोजपुरी)

Verifies:
- Accurate dialect detection
- Vernacular entity extraction
- Real-time English translation of the spoken query (english_translation)
- Local native language audio script (spoken_response_native)
- Professional English spoken reply (spoken_response_en)
"""

import sys
from execution.voice_query_engine import (
    process_voice_query,
    VoiceQueryRequest
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def test_all_seven_languages():
    print("=" * 80)
    print("RUNNING 7-LANGUAGE PAN-INDIA TEST SUITE FOR NLAMS DHWANI SAHAYAK")
    print("=" * 80)

    # 1. HINDI (हिंदी)
    print("\n[1/7] Testing Hindi (हिंदी)...")
    res_hi = process_voice_query(VoiceQueryRequest(
        transcript="Mera survey number 104 hai, compensation ka paisa kab tak aayega?",
        preferred_dialect="hindi",
        context_record={"survey_no": "104", "compensation_amount": 2000000.0}
    ))
    assert "Hindi" in res_hi.detected_language
    assert res_hi.extracted_entities.survey_no == "104"
    assert res_hi.autonomous_action.target_route == "/farmer-dashboard"
    assert len(res_hi.english_translation) > 10
    assert "104" in res_hi.english_translation
    assert "104" in res_hi.spoken_response_native
    assert "Greetings" in res_hi.spoken_response_en
    print(f"  -> Native Hindi: '{res_hi.spoken_response_native}'")
    print(f"  -> English Translation: '{res_hi.english_translation}'")

    # 2. BENGALI (বাংলা)
    print("\n[2/7] Testing Bengali (বাংলা)...")
    res_bn = process_voice_query(VoiceQueryRequest(
        transcript="Amar jomi khatian number 305 er taka kobe pabo?",
        preferred_dialect="bengali",
        context_record={"survey_no": "305", "compensation_amount": 1500000.0}
    ))
    assert "Bengali" in res_bn.detected_language
    assert res_bn.extracted_entities.survey_no == "305"
    assert "নমস্কার" in res_bn.spoken_response_native
    assert "305" in res_bn.english_translation
    assert "compensation" in res_bn.english_translation.lower()
    print(f"  -> Native Bengali: '{res_bn.spoken_response_native}'")
    print(f"  -> English Translation: '{res_bn.english_translation}'")

    # 3. GUJARATI (ગુજરાતી)
    print("\n[3/7] Testing Gujarati (ગુજરાતી)...")
    res_gu = process_voice_query(VoiceQueryRequest(
        transcript="Maru survey number 402 chhe, jameen nu valtar kyare malshe?",
        preferred_dialect="gujarati",
        context_record={"survey_no": "402", "compensation_amount": 3500000.0}
    ))
    assert "Gujarati" in res_gu.detected_language
    assert res_gu.extracted_entities.survey_no == "402"
    assert "નમસ્તે" in res_gu.spoken_response_native
    assert "402" in res_gu.english_translation
    print(f"  -> Native Gujarati: '{res_gu.spoken_response_native}'")
    print(f"  -> English Translation: '{res_gu.english_translation}'")

    # 4. MARATHI (मराठी)
    print("\n[4/7] Testing Marathi (मराठी)...")
    res_mr = process_voice_query(VoiceQueryRequest(
        transcript="Majha survey number 501 cha mobadla kadhi milnar sarkaarkadun?",
        preferred_dialect="marathi",
        context_record={"survey_no": "501", "compensation_amount": 2800000.0}
    ))
    assert "Marathi" in res_mr.detected_language
    assert res_mr.extracted_entities.survey_no == "501"
    assert "नमस्कार" in res_mr.spoken_response_native
    assert "501" in res_mr.english_translation
    print(f"  -> Native Marathi: '{res_mr.spoken_response_native}'")
    print(f"  -> English Translation: '{res_mr.english_translation}'")

    # 5. PUNJABI (ਪੰਜਾਬੀ)
    print("\n[5/7] Testing Punjabi (ਪੰਜਾਬੀ)...")
    res_pa = process_voice_query(VoiceQueryRequest(
        transcript="Saada khasra number 603 hai, zameen da muavza kadon miluga?",
        preferred_dialect="punjabi",
        context_record={"survey_no": "603", "compensation_amount": 4000000.0}
    ))
    assert "Punjabi" in res_pa.detected_language
    assert res_pa.extracted_entities.survey_no == "603"
    assert "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ" in res_pa.spoken_response_native
    assert "603" in res_pa.english_translation
    print(f"  -> Native Punjabi: '{res_pa.spoken_response_native}'")
    print(f"  -> English Translation: '{res_pa.english_translation}'")

    # 6. HARYANVI (हरियाणवी)
    print("\n[6/7] Testing Haryanvi (हरियाणवी)...")
    res_hr = process_voice_query(VoiceQueryRequest(
        transcript="Mhara survey number 704 hai, zameen ke rupeye kad aawenge?",
        preferred_dialect="haryanvi",
        context_record={"survey_no": "704", "compensation_amount": 1800000.0}
    ))
    assert "Haryanvi" in res_hr.detected_language
    assert res_hr.extracted_entities.survey_no == "704"
    assert "राम-राम भाई" in res_hr.spoken_response_native
    assert "704" in res_hr.english_translation
    print(f"  -> Native Haryanvi: '{res_hr.spoken_response_native}'")
    print(f"  -> English Translation: '{res_hr.english_translation}'")

    # 7. BHOJPURI (भोजपुरी)
    print("\n[7/7] Testing Bhojpuri (भोजपुरी)...")
    res_bho = process_voice_query(VoiceQueryRequest(
        transcript="Humar survey number 204 ba, paisa kab mili sarkaari log se?",
        preferred_dialect="bhojpuri",
        context_record={"survey_no": "204", "compensation_amount": 2500000.0}
    ))
    assert "Bhojpuri" in res_bho.detected_language
    assert res_bho.extracted_entities.survey_no == "204"
    assert "प्रणाम बाबू" in res_bho.spoken_response_native
    assert "204" in res_bho.english_translation
    print(f"  -> Native Bhojpuri: '{res_bho.spoken_response_native}'")
    print(f"  -> English Translation: '{res_bho.english_translation}'")

    # 8. EMERGENCY LIFE-SAFETY DISTRESS (Tele-MANAS 14416 Interception)
    print("\n[8/8] Testing Emergency Life-Safety Distress Interception...")
    res_crisis = process_voice_query(VoiceQueryRequest(
        transcript="Humar zameen chhin gail, ab hum pure parivar ke sath aatmhatya kar leb",
        preferred_dialect="bhojpuri"
    ))
    assert res_crisis.emergency_escalation is True
    assert "14416" in res_crisis.spoken_response_native or "14416" in res_crisis.spoken_response_hi
    print("  -> PASSED Emergency: Intercepted voice distress with Tele-MANAS (14416).")

    print("\n" + "=" * 80)
    print("ALL 7 CORE INDIAN LANGUAGES & EMERGENCY PROTOCOL PASSED (100%)!")
    print("================================================================================")


if __name__ == "__main__":
    test_all_seven_languages()
