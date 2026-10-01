# Directive: Vernacular Voice-to-Action AI Engine (NLAMS Dhwani Sahayak)

## 1. Goal
Provide a voice-first AI bridge for rural, low-literacy landholders and Project Affected Families (PAFs). The engine receives citizen voice queries (raw audio or speech transcript), normalizes regional dialects (Hindi, Bhojpuri, Awadhi, Hinglish), extracts land entities (Survey/Khasra numbers, Village, Land size), identifies intent, autonomously executes the necessary backend task (grievance triage, GIS map lookup, compensation check), and synthesizes a concise, spoken vernacular response optimized for Text-to-Speech (TTS) readout.

## 2. Inputs
- `transcript`: Optional string of user's speech transcribed via client Speech Recognition.
- `audio_base64`: Optional base64 encoded audio string (WAV, MP3, WebM, OGG) from mobile or desktop microphone.
- `audio_mime_type`: String (e.g. `audio/webm`, `audio/wav`, `audio/mp3`, default `audio/webm`).
- `preferred_dialect`: String (`hi`, `bhojpuri`, `hinglish`, `auto`).
- `context_record`: Optional JSON object containing the citizen's authenticated parcel status (survey_no, status, award, etc.).

## 3. Execution Tool
- `execution/voice_query_engine.py`

## 4. Outputs
Structured JSON response (`VoiceQueryResponse`):
- `detected_language`: Spoken dialect detected (e.g. "Rural Hindi / Bhojpuri Dialect", "Hinglish").
- `transcribed_text`: Clean normalized text of what the citizen spoke.
- `primary_intent`: String (`CHECK_COMPENSATION_STATUS`, `NAVIGATE_TO_PORTAL`, `FILE_OBJECTION_DISPUTE`, `CALCULATE_ESTIMATE`, `CRISIS_DISTRESS_EMERGENCY`, `GENERAL_INQUIRY`).
- `extracted_entities`:
  - `survey_no`: Optional string.
  - `village`: Optional string.
  - `project_name`: Optional string.
  - `claimed_amount`: Optional float.
- `autonomous_action`:
  - `action_type`: `NAVIGATE`, `DISPLAY_STATUS_CARD`, `TRIGGER_HELPLINE`, `OPEN_GIS_MAP`.
  - `target_route`: e.g. `/farmer-dashboard`, `/map`, `/new-proposal`.
  - `action_summary`: Objective English description of the automated action taken.
- `spoken_response_hi`: A concise 2-3 sentence verbal response in compassionate, conversational Hindi designed for Text-to-Speech audio playback.
- `official_summary_en`: Formal administrative summary for district records.
- `emergency_escalation`: Boolean (true if self-harm or distress is detected).
- `suggested_followups`: List of 2-3 short voice follow-up prompts.
- `warnings`: Any security, desynchronization, or data warnings.

## 5. Compliance & Audio Guardrails
- **Spoken Clarity:** Spoken responses must be written without abbreviations (e.g., say "रुपये" instead of "INR", "धारा 64" instead of "Sec 64").
- **Life Safety Interceptor:** If the citizen mentions suicide, poison, or self-harm in speech, immediately flag `emergency_escalation=True` and deliver spoken helpline guidance (Tele-MANAS `14416`).
- **No False Commitments:** Never verbally promise payout release dates or executive authority actions.
