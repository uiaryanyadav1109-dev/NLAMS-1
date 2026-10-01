"""
execution/portal_navigator_bot.py

NLAMS AI Sahayak & Web Navigator Bot
Intelligent conversational assistant that:
1. Answers user queries on land acquisition problems, RFCTLARR 2013 laws, circle rates, and compensation.
2. Directly navigates users through all portal routes and dashboards.
3. Provides contextual deep-links and suggested next steps.
4. Operates in Hindi, Hinglish, and English with auto-routing to Gemini models or deterministic fallback.
"""

import os
import re
import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("nlams.navigator_bot")

# NLAMS SITEMAP & CAPABILITIES DIRECTORY
PORTAL_SITEMAP = [
    {
        "path": "/",
        "title": "Home Page (Portal Overview)",
        "description": "National summary, land acquisition milestones, citizen public search, and platform overview.",
        "keywords": ["home", "main", "start", "landing", "overview", "kpi", "milestone"]
    },
    {
        "path": "/farmer-dashboard",
        "title": "Farmer & Landowner Portal (किसान पोर्टल)",
        "description": "Check compensation disbursement status, survey/khasra number awards, submit vernacular grievances, and view R&R entitlements.",
        "keywords": ["farmer", "kisan", "compensation", "paisa", "survey", "khasra", "grievance", "shikayat", "rr", "rehabilitation", "bank"]
    },
    {
        "path": "/district-dashboard",
        "title": "District LAO & Collector Dashboard",
        "description": "Cadastral boundary verification, overlap conflict alerts, Section 23 award generation, and PDF report downloads.",
        "keywords": ["district", "collector", "lao", "officer", "verify", "geometry", "overlap", "award note", "pdf", "report"]
    },
    {
        "path": "/new-proposal",
        "title": "New Acquisition Proposal",
        "description": "Submit new infrastructure corridors or land acquisition proposals with GeoJSON boundary coordinate mapping.",
        "keywords": ["proposal", "new", "submit", "boundary", "corridor", "highway", "railway", "geojson", "polygon"]
    },
    {
        "path": "/state-dashboard",
        "title": "State Revenue Department Dashboard",
        "description": "State-wide progress monitoring, corridor approvals, project budgets, and inter-district bottleneck analytics.",
        "keywords": ["state", "rajya", "revenue department", "approval", "bottleneck", "budget"]
    },
    {
        "path": "/dashboard",
        "title": "National Ministry Dashboard",
        "description": "High-level Union Ministry oversight across 28+ states, total area acquired, and national budget disbursement.",
        "keywords": ["national", "ministry", "central", "union", "india", "pan-india"]
    },
    {
        "path": "/auth",
        "title": "Login & Role Selection Portal",
        "description": "Switch roles between Farmer / Landowner, District LAO, State Admin, and National Ministry.",
        "keywords": ["login", "signin", "auth", "role", "switch", "register"]
    },
    {
        "path": "/map",
        "title": "GIS Interactive Land Map",
        "description": "Interactive map viewer for cadastral boundaries, notified parcels, and environmental buffer zones.",
        "keywords": ["map", "gis", "satellite", "cadastral", "naksha", "leaflet"]
    }
]

# STATUTORY KNOWLEDGE BASE (RFCTLARR 2013 & LAND POLICIES)
STATUTORY_KNOWLEDGE = {
    "compensation_formula": (
        "Under the First Schedule of RFCTLARR Act 2013, fair compensation is calculated as:\n"
        "1. Base Market Value (Circle rate or average of top 50% registered sale deeds in last 3 years).\n"
        "2. Multiplying Factor: 1.0 for urban areas, and 1.0 to 2.0 for rural areas depending on distance from urban limits.\n"
        "3. Additional Market Value Interest: 12% per annum from Section 11 preliminary notification to Award date.\n"
        "4. Solatium: Mandatory 100% of the calculated asset and land value added on top.\n"
        "Total Compensation = [(Market Value * Factor) + Assets] + 100% Solatium + 12% Interest."
    ),
    "section_15_objections": (
        "Under Section 15 of RFCTLARR Act 2013, any person interested in land notified under Section 11 "
        "has 60 days from publication to file written objections regarding area measurement, suitability, "
        "or public purpose with the District Collector."
    ),
    "section_64_tribunal": (
        "Under Section 64, if dissatisfied with the Collector's award (valuation or area), you can submit a written "
        "application to the Collector requesting reference to the Land Acquisition, Rehabilitation and Resettlement Authority (LARR Authority). "
        "Limitation: 6 weeks if present when award was announced, or 6 months from receipt of notice."
    ),
    "boundary_dispute": (
        "Cadastral boundary disputes can be verified directly on our portal via the "
        "District LAO Dashboard (/district-dashboard), which runs Shapely computational geometry "
        "against revenue records, reserved forests, and notified railway/road corridors."
    )
}


class NavigatorLink(BaseModel):
    title: str
    url: str
    is_external: bool = False


class NavigatorChatRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=2000, description="User question in vernacular or English")
    current_path: Optional[str] = Field(default="/", description="Current portal path")
    user_role: Optional[str] = Field(default="citizen", description="Role: citizen, officer, admin")
    language: Optional[str] = Field(default="auto", description="Preferred language: en, hi, auto")
    history: Optional[List[Dict[str, str]]] = Field(default=[], description="Chat history")


class NavigatorChatResponse(BaseModel):
    reply: str
    navigation_action: Optional[str] = None
    suggested_links: List[NavigatorLink] = []
    suggested_questions: List[str] = []
    problem_category: str = "GENERAL_INQUIRY"


def find_matching_route(query_lower: str) -> Optional[Dict[str, Any]]:
    """Identifies the best matching portal route for a query."""
    best_match = None
    max_score = 0
    
    for route in PORTAL_SITEMAP:
        score = sum(1 for kw in route["keywords"] if kw in query_lower)
        if score > max_score:
            max_score = score
            best_match = route
            
    return best_match if max_score >= 1 else None


def rule_based_navigator(
    query: str,
    current_path: str = "/",
    user_role: str = "citizen"
) -> NavigatorChatResponse:
    """Deterministic, resilient fallback navigator for land acquisition queries."""
    q = query.lower()
    
    # 1. Grievances, delays, complaints, and officer escalation (HIGHEST PRIORITY)
    if any(k in q for k in ["grievance", "shikayat", "complaint", "delay", "deri", "nahi aaya", "help", "sahayata", "officer", "kisko"]):
        reply = (
            "For complaints regarding delayed compensation, missing awards, or unaddressed objections:\n\n"
            "1. Visit the **Farmer Dashboard** (/farmer-dashboard) to lodge your grievance in Hindi, English, or your local dialect.\n"
            "2. Our Vernacular AI Triage agent immediately extracts your Khasra/Survey details, assigns urgency, and routes it to the Competent Land Acquisition Officer (LAO).\n"
            "3. If this is an emergency or acute distress, please contact the **Kisan Helpline (1800-180-1551)** or **Tele-MANAS (14416)**."
        )
        return NavigatorChatResponse(
            reply=reply,
            navigation_action="/farmer-dashboard",
            suggested_links=[
                NavigatorLink(title="Lodge Grievance on Farmer Portal", url="/farmer-dashboard"),
                NavigatorLink(title="View National Acquisition KPIs", url="/dashboard")
            ],
            suggested_questions=[
                "Where can I find my Special LAO contact?",
                "What is the limitation period for Section 64 reference?",
                "How to track status with Survey Number?"
            ],
            problem_category="GRIEVANCE_STATUS"
        )

    # 2. New proposal / Corridor submission (takes precedence over generic boundary checks)
    if any(k in q for k in ["proposal", "new project", "submit proposal", "acquisition plan"]):
        reply = (
            "To submit a new acquisition proposal for highways, railways, or industrial corridors:\n\n"
            "• Navigate to **New Proposal Page** (/new-proposal).\n"
            "• Enter Project Name, State, District, and draw or upload the GeoJSON boundary.\n"
            "• The system automatically calculates notified hectarage and checks environmental buffers."
        )
        return NavigatorChatResponse(
            reply=reply,
            navigation_action="/new-proposal",
            suggested_links=[
                NavigatorLink(title="Submit New Acquisition Proposal", url="/new-proposal"),
                NavigatorLink(title="Review State Project Queue", url="/state-dashboard")
            ],
            suggested_questions=[
                "What GeoJSON format is required?",
                "Who approves new acquisition proposals?",
                "How to verify buffer zones before submission?"
            ],
            problem_category="PORTAL_NAVIGATION"
        )

    # 3. Boundary disputes, geometry, or overlap
    if any(k in q for k in ["boundary", "overlap", "forest", "map", "naksha", "khasra", "dispute", "vivad", "zameen", "polygon"]):
        reply = (
            "To resolve or verify boundary conflicts and land parcel overlaps:\n\n"
            "• The **District LAO Dashboard** features an automated Cadastral Boundary Verifier.\n"
            "• It tests proposed parcels against restricted forest zones, water bodies, and existing road corridors.\n"
            "• You can also inspect parcel maps directly on our interactive GIS map."
        )
        return NavigatorChatResponse(
            reply=reply,
            navigation_action="/district-dashboard",
            suggested_links=[
                NavigatorLink(title="District LAO Verification Dashboard", url="/district-dashboard"),
                NavigatorLink(title="Interactive GIS Land Map", url="/map")
            ],
            suggested_questions=[
                "How does the geometry verification detect overlaps?",
                "What documents are needed for boundary rectification?",
                "Can I view my parcel on the satellite map?"
            ],
            problem_category="BOUNDARY_DISPUTE"
        )

    # 4. Compensation & Circle Rate inquiries
    if any(k in q for k in ["compensation", "paisa", "rupaye", "circle rate", "valuation", "kitna milega", "formula", "solatium"]):
        reply = (
            "Compensation under the RFCTLARR Act 2013 is calculated systematically:\n\n"
            "• **Market Value Calculation:** Derived from prevailing circle rates or recent registered sale deeds.\n"
            "• **Rural Multiplier:** 1.0x to 2.0x depending on proximity to urban centers.\n"
            "• **100% Solatium:** Statutory 100% addition over and above total land & asset value.\n"
            "• **12% Annual Interest:** Accrues from date of preliminary notification (Sec 11) to award.\n\n"
            "You can track your specific payment status and survey details directly in the **Farmer Portal**."
        )
        return NavigatorChatResponse(
            reply=reply,
            navigation_action="/farmer-dashboard",
            suggested_links=[
                NavigatorLink(title="Open Farmer Dashboard (किसान पोर्टल)", url="/farmer-dashboard"),
                NavigatorLink(title="Official RFCTLARR Act 2013 Text", url="https://legislative.gov.in/sites/default/files/A2013-30.pdf", is_external=True)
            ],
            suggested_questions=[
                "Mera survey number kaise check karein?",
                "How to file an objection under Section 15?",
                "What is Solatium in land acquisition?"
            ],
            problem_category="COMPENSATION_VALUATION"
        )

    # 5. Site navigation / General
    matched_route = find_matching_route(q)
    if matched_route:
        reply = (
            f"You can find this directly in the **{matched_route['title']}** at `{matched_route['path']}`.\n\n"
            f"{matched_route['description']}"
        )
        return NavigatorChatResponse(
            reply=reply,
            navigation_action=matched_route["path"],
            suggested_links=[NavigatorLink(title=f"Go to {matched_route['title']}", url=matched_route["path"])],
            suggested_questions=[
                "What features are available on this page?",
                "How do I switch roles?",
                "Calculate compensation for my land"
            ],
            problem_category="PORTAL_NAVIGATION"
        )

    # Default welcoming response
    reply = (
        "Namaste! I am the **NLAMS AI Sahayak & Web Navigator**.\n\n"
        "I can help you navigate this portal and answer questions on:\n"
        "• **Fair Compensation & Valuation:** RFCTLARR Act 2013 rules, circle rates, and 100% Solatium.\n"
        "• **Grievance Redressal:** Checking disbursement delays or filing objections under Section 15.\n"
        "• **Boundary & Map Verification:** Detecting forest/highway overlaps on the GIS map.\n"
        "• **Direct Navigation:** Jump to Farmer, District, State, or National dashboards.\n\n"
        "How can I assist you with your land acquisition inquiry today?"
    )
    return NavigatorChatResponse(
        reply=reply,
        navigation_action="/farmer-dashboard",
        suggested_links=[
            NavigatorLink(title="Farmer & Landowner Portal", url="/farmer-dashboard"),
            NavigatorLink(title="District LAO Dashboard", url="/district-dashboard"),
            NavigatorLink(title="National Monitoring", url="/dashboard")
        ],
        suggested_questions=[
            "Meri zameen ka survey status kaise check karein?",
            "How is compensation calculated under RFCTLARR 2013?",
            "How do I check boundary overlaps on the map?"
        ],
        problem_category="GENERAL_INQUIRY"
    )


def process_navigator_chat(request: NavigatorChatRequest) -> NavigatorChatResponse:
    """Processes user chat request using Gemini AI with fallback to deterministic rules."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Using deterministic rules navigator.")
        return rule_based_navigator(request.query, request.current_path or "/", request.user_role or "citizen")
    
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)
        
        sitemap_context = json.dumps(PORTAL_SITEMAP, indent=2)
        statutory_context = json.dumps(STATUTORY_KNOWLEDGE, indent=2)
        
        system_instruction = f"""
You are the "NLAMS AI Sahayak & Web Navigator" for the National Land Acquisition and Management System (Govt of India).
Your mission is to provide warm, legally accurate, and direct answers strictly regarding land acquisition problems,
rights of landholders under the RFCTLARR Act 2013, boundary disputes, and guide the user through the NLAMS web application.

PORTAL SITEMAP:
{sitemap_context}

STATUTORY KNOWLEDGE (RFCTLARR 2013):
{statutory_context}

RULES:
1. Empathy & Language: Respond in the user's language (Hindi, Hinglish, or English). Keep tone respectful and helpful.
2. Direct Navigation: If the query relates to a feature on any page, name the page and set `navigation_action` to its route (e.g. '/farmer-dashboard').
3. Problem Solving: Accurately explain legal terms like Solatium (100%), Section 15 objections (60 days), Section 64 reference to authority, and circle rate multipliers.
4. Output MUST be valid JSON adhering to:
{{
  "reply": "Clear, markdown-formatted response",
  "navigation_action": "/farmer-dashboard" or null,
  "suggested_links": [{{"title": "...", "url": "...", "is_external": false}}],
  "suggested_questions": ["q1", "q2", "q3"],
  "problem_category": "COMPENSATION_VALUATION" | "BOUNDARY_DISPUTE" | "GRIEVANCE_STATUS" | "PORTAL_NAVIGATION" | "STATUTORY_TIMELINE" | "GENERAL_INQUIRY"
}}
"""
        prompt = (
            f"User Query: {request.query}\n"
            f"Current Page: {request.current_path}\n"
            f"User Role: {request.user_role}\n"
            f"Provide JSON response:"
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        
        raw_text = response.text.strip()
        data = json.loads(raw_text)
        
        # Self-annealing: If LLM omitted navigation_action, infer from query or problem category
        nav_action = data.get("navigation_action")
        if not nav_action:
            inferred = find_matching_route(request.query.lower())
            if inferred:
                nav_action = inferred["path"]
            elif data.get("problem_category") == "COMPENSATION_VALUATION" or "compensation" in request.query.lower():
                nav_action = "/farmer-dashboard"
            elif data.get("problem_category") == "BOUNDARY_DISPUTE" or "boundary" in request.query.lower():
                nav_action = "/district-dashboard"

        # Determine normalized problem category
        category = data.get("problem_category", "").upper()
        if "COMPENSATION" in category or "compensation" in request.query.lower():
            category = "COMPENSATION_VALUATION"
        elif "BOUNDARY" in category or "boundary" in request.query.lower() or "overlap" in request.query.lower():
            category = "BOUNDARY_DISPUTE"
        elif "GRIEVANCE" in category or "shikayat" in request.query.lower() or "delay" in request.query.lower():
            category = "GRIEVANCE_STATUS"
        elif not category:
            category = "GENERAL_INQUIRY"

        suggested_links = [
            NavigatorLink(
                title=item.get("title", "Portal Link"),
                url=item.get("url", "/"),
                is_external=item.get("is_external", False)
            ) for item in data.get("suggested_links", [])
        ]
        if not suggested_links and nav_action:
            suggested_links.append(NavigatorLink(title="Go to Recommended Page", url=nav_action))

        return NavigatorChatResponse(
            reply=data.get("reply", "Namaste, how can I assist you with land acquisition?"),
            navigation_action=nav_action,
            suggested_links=suggested_links,
            suggested_questions=data.get("suggested_questions", [
                "How is compensation calculated under RFCTLARR 2013?",
                "How to check boundary overlap?",
                "Where can I submit a grievance?"
            ]),
            problem_category=category
        )
        
    except Exception as e:
        logger.warning("Gemini navigator failed (%s); falling back to rule-based engine.", str(e))
        return rule_based_navigator(request.query, request.current_path or "/", request.user_role or "citizen")
