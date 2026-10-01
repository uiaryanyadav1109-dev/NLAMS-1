# Directive: Statutory RFCTLARR Compensation & Fair Valuation Engine

## 1. Goal
Execute deterministic, mathematically exact, and legally unassailable compensation calculations under the First Schedule of the RFCTLARR Act 2013. The engine computes market value, applies rural/urban multiplying factors (1.0x to 2.0x), incorporates attached assets (structures, timber/fruit trees), adds mandatory 100% Solatium, calculates 12% per annum additional market value interest from Section 11 preliminary notification to award, and produces itemized per-family entitlement breakdowns.

## 2. Inputs
- `parcel_id`: Unique identifier (e.g. "UP-MRT-2026-P01")
- `khasra_no`: Khasra / Survey number (e.g. "104/2")
- `area_sqm`: Acquired area in square meters (Float > 0)
- `base_circle_rate_sqm`: Minimum base circle rate per square meter (Float > 0)
- `average_registered_sale_rate_sqm`: Optional average of top 50% sale deeds registered in last 3 years
- `location_type`: String (`RURAL` | `URBAN`)
- `radial_distance_from_urban_km`: Float (distance from nearest urban limit in km, applicable for rural multiplier)
- `state`: String (State name for statutory factor schedule)
- `assets_attached`: Optional dictionary:
  - `structures_inr`: PWD certified value of buildings, wells, tube-wells
  - `trees_inr`: Horticulture/Forest Dept certified value of fruit and timber trees
  - `standing_crops_inr`: Agriculture Dept value of standing crops
- `section_11_notification_date`: Date string (YYYY-MM-DD)
- `award_or_possession_date`: Date string (YYYY-MM-DD)
- `affected_families`: List of beneficiary families:
  - `family_id`: String
  - `head_of_family`: String
  - `share_percentage`: Float (Sum across families must equal 100.0%)
  - `bank_details`: Optional account/IFSC metadata

## 3. Execution Tool
- `execution/calculate_valuation.py`

## 4. Statutory Formula & First Schedule Rules
1. **Base Market Value ($M_v$)**:
   $$\text{Base Rate} = \max(\text{base\_circle\_rate\_sqm}, \text{average\_registered\_sale\_rate\_sqm})$$
   $$M_v = \text{Base Rate} \times \text{area\_sqm}$$
2. **Multiplying Factor ($F$)**:
   - `URBAN`: $F = 1.0$
   - `RURAL`: Scaled based on distance from urban boundary:
     - Distance $\le 10\text{ km} \rightarrow F = 1.20$
     - $10 < \text{Distance} \le 20\text{ km} \rightarrow F = 1.50$
     - $20 < \text{Distance} \le 30\text{ km} \rightarrow F = 1.75$
     - $\text{Distance} > 30\text{ km} \rightarrow F = 2.00$
     - If distance not specified, defaults to state statutory rural multiplier (default $1.50$).
   $$\text{Multiplied Land Value } (L_v) = M_v \times F$$
3. **Total Land and Asset Value ($T_{la}$)**:
   $$T_{la} = L_v + \text{structures\_inr} + \text{trees\_inr} + \text{standing\_crops\_inr}$$
4. **Mandatory Solatium ($S$) - Section 30(1)**:
   $$S = 1.00 \times T_{la} \quad (100\% \text{ of Total Land and Asset Value})$$
5. **Additional Market Value Interest ($I_{12}$) - Section 30(3)**:
   $$N_{\text{days}} = \text{Date Difference}(\text{section\_11\_notification\_date}, \text{award\_or\_possession\_date})$$
   $$I_{12} = M_v \times 0.12 \times \frac{N_{\text{days}}}{365.25}$$
6. **Total Compensation Award ($A_{\text{total}}$)**:
   $$A_{\text{total}} = T_{la} + S + I_{12}$$
7. **Family Entitlement Breakdown**:
   $$\text{Family Award}_i = A_{\text{total}} \times \frac{\text{share\_percentage}_i}{100}$$

## 5. Outputs
Structured JSON response:
- `parcel_id`: String
- `khasra_no`: String
- `applied_rate_sqm`: Float
- `rate_basis`: String ("CIRCLE_RATE" or "AVERAGE_SALE_DEED")
- `multiplying_factor`: Float (1.0 to 2.0)
- `base_market_value_inr`: Float
- `multiplied_land_value_inr`: Float
- `total_assets_value_inr`: Float
- `solatium_amount_inr`: Float (100%)
- `additional_interest_inr`: Float (12% p.a.)
- `interest_period_days`: Integer
- `total_compensation_award_inr`: Float
- `family_entitlements`: List of family award allocations
- `tax_exemption_note`: "Compensation is 100% tax-exempt under Section 96 of RFCTLARR Act 2013."
- `legal_certificate_stub`: Statutory compliance verification hash
