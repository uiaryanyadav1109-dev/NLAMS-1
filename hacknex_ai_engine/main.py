"""
main.py

NLAMS AI Engine - Hardened FastAPI Microservice
Provides REST endpoints for:
1. Feature 4: Boundary & Parcel Overlap Verification (/api/v1/verify-geometry)
2. Feature 3: Vernacular Citizen Grievance Triage (/api/v1/grievance-triage)
3. Feature 5: Automated Executive Award Note & PDF Generator (/api/v1/generate-award-summary)
   + Download PDF endpoint (/api/v1/download-report/{filename})
"""

import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load .env variables immediately
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field

# Import deterministic execution tools
from execution.extract_document import (
    extract_document_entities,
    DocumentExtractionRequest,
    DocumentExtractionResult
)
from execution.calculate_valuation import (
    calculate_rfctlarr_valuation,
    ValuationRequest,
    ValuationResponse
)
from execution.verify_geometry import (
    verify_parcel_geometry,
    GeometryVerificationResult
)
from execution.grievance_triage import (
    triage_citizen_grievance,
    GrievanceTriageResult
)
from execution.generate_award_summary import (
    build_award_summary_pdf,
    ProjectAwardData,
    AwardSummaryResponse
)
from execution.portal_navigator_bot import (
    process_navigator_chat,
    NavigatorChatRequest,
    NavigatorChatResponse
)
from execution.voice_query_engine import (
    process_voice_query,
    VoiceQueryRequest,
    VoiceQueryResponse
)

# Centralized server-side logger
logger = logging.getLogger("nlams.ai_engine")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(
    title="NLAMS AI & Decision Engine",
    description="Intelligent microservice for National Land Acquisition & Management System (GIS, NLP, Document Generation)",
    version="1.1.0"
)

# Enable CORS for React/Node.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# Centralized Error Handlers (No Stack Trace or Key Leakage)
# =====================================================================
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Sanitized schema validation error handler."""
    sanitized_errors = []
    for err in exc.errors():
        field_loc = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid value")
        sanitized_errors.append(f"{field_loc}: {msg}")
    logger.warning("Validation error on %s: %s", request.url.path, sanitized_errors)
    return JSONResponse(
        status_code=422,
        content={"detail": "Schema validation failed", "errors": sanitized_errors}
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Sanitized business domain error handler."""
    logger.warning("Business domain error on %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Sanitized generic exception handler - stack trace logged server-side only."""
    logger.error("Unhandled error processing %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal processing error occurred. The incident has been logged for administrative review."}
    )


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "NLAMS AI Engine",
        "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY")),
        "version": "1.1.0"
    }


# =====================================================================
# FEATURE 4: Cadastral Boundary & Parcel Overlap Anomaly Detector
# =====================================================================
class VerifyGeometryRequest(BaseModel):
    proposed_geometry: Any = Field(
        default={
            "type": "Polygon",
            "coordinates": [
                [[77.200, 28.600], [77.210, 28.600], [77.210, 28.610], [77.200, 28.610], [77.200, 28.600]]
            ]
        },
        description="GeoJSON Polygon dict or coordinate list [[lng, lat], ...]"
    )
    existing_parcels: List[Dict[str, Any]] = Field(
        default=[
            {
                "parcel_id": "RESERVED-FOREST-SEC-4",
                "status": "restricted_forest",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[77.205, 28.605], [77.215, 28.605], [77.215, 28.615], [77.205, 28.615], [77.205, 28.605]]
                    ]
                }
            }
        ],
        description="List of existing parcels with parcel_id, geometry, and status/type"
    )
    overlap_threshold_pct: float = Field(
        default=0.1,
        ge=0.0,
        le=100.0,
        description="Threshold percentage of overlap to trigger alerts"
    )


@app.post(
    "/api/v1/verify-geometry",
    response_model=GeometryVerificationResult,
    tags=["Feature 4 - Cadastral Geometry AI"]
)
def api_verify_geometry(request: VerifyGeometryRequest):
    """
    Validates a proposed acquisition parcel boundary against existing cadastral parcels,
    notified corridors, and environmental reserve zones using computational geometry.
    Guarantees 'CLEAR' is only returned when all OGC validity and conflict checks pass.
    """
    try:
        result = verify_parcel_geometry(
            proposed_geometry=request.proposed_geometry,
            existing_parcels=request.existing_parcels,
            overlap_threshold_pct=request.overlap_threshold_pct
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error("Geometry verification failure: %s", str(e), exc_info=True)
        raise HTTPException(status_code=400, detail="Geometry validation failed. Please check polygon coordinate structure.")


# =====================================================================
# FEATURE 3: Vernacular Citizen Grievance & Status Triage Agent
# =====================================================================
class GrievanceTriageRequest(BaseModel):
    citizen_query: str = Field(
        default="Mera survey no 204 hai Ganga Expressway ke liye. Notification aaye 6 mahine ho gaye par compensation ka paisa bank account me kab aayega?",
        description="Query text in English, Hindi, Hinglish, or regional dialect",
        min_length=3,
        max_length=4000
    )
    preferred_language: str = Field(default="hi", description="Preferred response language")
    context_record: Optional[Dict[str, Any]] = Field(
        default={
            "survey_no": "204",
            "project_name": "Ganga Expressway Phase-2",
            "status": "AWARD_PASSED",
            "compensation_amount": 2450000.0,
            "designated_officer": "Shri R.K. Sharma, Special LAO Meerut"
        },
        description="Optional land/compensation database record for the citizen"
    )


@app.post(
    "/api/v1/grievance-triage",
    response_model=GrievanceTriageResult,
    tags=["Feature 3 - Vernacular Citizen AI"]
)
def api_grievance_triage(request: GrievanceTriageRequest):
    """
    Triages citizen queries regarding compensation delays, circle rates, and R&R status.
    Features prompt-injection defense, crisis intervention (14416), and context desynchronization protection.
    """
    try:
        result = triage_citizen_grievance(
            citizen_query=request.citizen_query,
            preferred_language=request.preferred_language,
            context_record=request.context_record
        )
        return result
    except Exception as e:
        logger.error("Grievance triage failure: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Grievance triage processing encountered an error.")


# =====================================================================
# FEATURE 5: Automated Executive R&R & Award Note Generator
# =====================================================================
@app.post(
    "/api/v1/generate-award-summary",
    response_model=AwardSummaryResponse,
    tags=["Feature 5 - Executive Award & R&R Reports"]
)
def api_generate_award_summary(request: ProjectAwardData):
    """
    Synthesizes project acquisition progress and financial disbursement into a formal
    government-style executive note and renders a downloadable PDF.
    """
    try:
        response = build_award_summary_pdf(request)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error("Report generation failure: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Executive report generation encountered an error.")


@app.get(
    "/api/v1/download-report/{filename:path}",
    response_class=FileResponse,
    tags=["Feature 5 - Executive Award & R&R Reports"],
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Bilingual Executive Land Acquisition & Award PDF Report"
        }
    }
)
def api_download_report(filename: str):
    """
    Downloads the generated executive PDF report directly as an attachment.
    Resiliently accepts bare filename, full path, or URL path.
    """
    import urllib.parse
    decoded = urllib.parse.unquote(filename)
    safe_filename = os.path.basename(decoded.replace("\\", "/"))
    file_path = os.path.join(".tmp", "reports", safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"Requested report PDF '{safe_filename}' not found on server."
        )
    
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=safe_filename,
        content_disposition_type="attachment"
    )


# =====================================================================
# FEATURE 6: NLAMS AI Sahayak & Web Navigator Assistant
# =====================================================================
@app.post(
    "/api/v1/navigator-chat",
    response_model=NavigatorChatResponse,
    tags=["Feature 6 - AI Sahayak & Web Navigator"]
)
def api_navigator_chat(request: NavigatorChatRequest):
    """
    Intelligent conversational assistant that navigates the NLAMS portal, resolves
    domain-specific land acquisition and compensation disputes, and grounds legal provisions.
    """
    try:
        response = process_navigator_chat(request)
        return response
    except Exception as e:
        logger.error("Navigator chat failure: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="The AI Sahayak encountered an internal processing error.")


# =====================================================================
# FEATURE 1: Multimodal Gazette Notification & Land Record OCR
# =====================================================================
@app.post(
    "/api/v1/extract-document",
    response_model=DocumentExtractionResult,
    tags=["Feature 1 - Multimodal Gazette OCR"]
)
def api_extract_document(request: DocumentExtractionRequest):
    """
    Ingests scanned revenue records (Khasra, Khatauni, RoR) and official Gazette
    notifications (Section 4, Section 11, Section 19) to extract structured cadastral
    entities, land categories, owner shares, and encumbrances.
    """
    try:
        result = extract_document_entities(request)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error("Document extraction failure: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Document extraction encountered an internal processing error.")


# =====================================================================
# FEATURE 2: Statutory RFCTLARR Compensation & Fair Valuation Engine
# =====================================================================
@app.post(
    "/api/v1/calculate-valuation",
    response_model=ValuationResponse,
    tags=["Feature 2 - Statutory RFCTLARR Valuation Engine"]
)
def api_calculate_valuation(request: ValuationRequest):
    """
    Executes mathematically exact, legally audited compensation determinations
    under the First Schedule of the RFCTLARR Act 2013 (Base Circle Rate, Rural Multiplier,
    Attached Assets, 100% Solatium, 12% p.a. Additional Interest, and Family Entitlements).
    """
    try:
        result = calculate_rfctlarr_valuation(request)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error("Valuation calculation failure: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Compensation valuation calculation encountered an internal processing error.")


# =====================================================================
# FEATURE 7: NLAMS Dhwani Sahayak (Vernacular Voice-to-Action Engine)
# =====================================================================
@app.post(
    "/api/v1/voice-query",
    response_model=VoiceQueryResponse,
    tags=["Feature 7 - Dhwani Sahayak (Vernacular Voice AI)"]
)
def api_voice_query(request: VoiceQueryRequest):
    """
    Ingests spoken queries (speech transcripts or raw audio base64) from rural landholders,
    normalizes regional dialects (Hindi, Bhojpuri, Awadhi, Hinglish), executes autonomous
    actions (portal navigation, status check, dispute guidance), and provides a spoken
    conversational Devanagari response for Text-to-Speech (TTS) audio readout.
    """
    try:
        response = process_voice_query(request)
        return response
    except Exception as e:
        logger.error("Voice query processing failure: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Voice query processing encountered an internal processing error.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


