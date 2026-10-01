# Directives (Layer 1: What to do)

Standard Operating Procedures (SOPs) live in this directory as Markdown files.

## Purpose
Directives define:
- **Goals**: What the workflow accomplishes
- **Inputs**: What parameters, data, or credentials are required
- **Tools / Scripts**: Python scripts in `execution/` to invoke
- **Outputs / Deliverables**: Expected cloud deliverables (e.g. Google Sheets/Slides) and intermediate formats
- **Edge Cases & Handling**: Known constraints, API rate limits, error fallbacks, and retry policies

## Directive Template

```markdown
# [Directive Name]

## Goal
A clear description of what this workflow achieves.

## Inputs
- Specific inputs, files, or environment parameters.

## Execution Tools
- `execution/[tool_name].py` with expected arguments.

## Outputs & Deliverables
- Deliverables (e.g. Google Sheets, Google Slides, cloud resources).
- Intermediate files (stored in `.tmp/`).

## Edge Cases & Annealing Notes
- Known API limitations or gotchas discovered through iterations.
```
