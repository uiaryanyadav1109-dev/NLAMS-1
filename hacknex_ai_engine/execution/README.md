# Execution Tools (Layer 3: Doing the work)

Deterministic Python scripts live here.

## Principles
1. **Deterministic & Testable**: Scripts should produce predictable outcomes given consistent inputs.
2. **Environment Variables**: Load environment variables and secrets from `.env` using `python-dotenv`.
3. **No Direct User Deliverables in Local Files**: Local files belong only in `.tmp/` for processing intermediates; true deliverables live in cloud services (Google Sheets, Google Slides, databases, etc.).
4. **Standalone & Executable**: Tools should be runnable directly or imported cleanly with appropriate CLI arguments.
