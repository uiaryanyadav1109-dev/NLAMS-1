"""
execution/model_router.py

Intelligent Model Router for NLAMS AI Engine.
Dynamically routes requests between Gemini models based on payload complexity:
- Fast / Simple queries (chat, simple status) -> gemini-2.5-flash (Fast, responsive)
- Complex legal disputes, high token count, or heavy multimodal -> gemini-2.5-pro (Deep reasoning)
- Automatic fallback from Pro to Flash on failure/rate-limit.
"""

import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()


def select_optimal_model(
    text_content: str,
    task_type: str = "general",
    has_image_or_pdf: bool = False,
    is_legal_dispute: bool = False
) -> str:
    """
    Selects the optimal model dynamically:
    - task_type: 'grievance', 'award_report', 'document_extraction'
    """
    # Override if user explicitly configured one in .env
    forced_model = os.getenv("FORCE_GEMINI_MODEL")
    if forced_model:
        return forced_model

    word_count = len(text_content.split())

    # Conditions that require Pro model if explicitly enabled or configured
    pro_model = os.getenv("PRO_GEMINI_MODEL", "gemini-2.5-flash")
    if is_legal_dispute or task_type == "document_extraction":
        return pro_model

    if word_count > 300:
        return pro_model

    # Default to fast, low-latency flash model
    return "gemini-2.5-flash"


def call_gemini_with_dynamic_routing(
    client: Any,
    contents: Any,
    task_type: str = "general",
    is_legal_dispute: bool = False,
    config: Optional[Any] = None
) -> Any:
    """
    Executes generate_content with intelligent model selection and auto-failover.
    """
    # Extract representative text for complexity check
    sample_text = str(contents) if not isinstance(contents, list) else " ".join(str(c) for c in contents)
    primary_model = select_optimal_model(
        text_content=sample_text,
        task_type=task_type,
        is_legal_dispute=is_legal_dispute
    )
    fallback_model = "gemini-2.5-flash" if primary_model != "gemini-2.5-flash" else None

    try:
        # Try primary optimal model
        response = client.models.generate_content(
            model=primary_model,
            contents=contents,
            config=config,
        )
        return response, primary_model
    except Exception as e:
        if fallback_model:
            print(f"[Model Router] Primary model '{primary_model}' encountered error: {e}. Falling back to '{fallback_model}'.")
            response = client.models.generate_content(
                model=fallback_model,
                contents=contents,
                config=config,
            )
            return response, fallback_model
        raise e
