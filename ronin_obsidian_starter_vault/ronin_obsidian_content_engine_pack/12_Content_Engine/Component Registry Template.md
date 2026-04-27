---
type: component_registry
component_name:
component_kind: page
site_target: blackbeltlegacy.local
route:
data_source:
pod_dependency:
service_dependency:
health:
---

# Component Registry — {{component_name}}

JETTY: {{component_name}} renders one site-facing view so shared content can be displayed with the right brand context on the right route.
LESSON: Separate canonical content from presentational components so one data source can power many frontends.
WIRING: {{route}} -> {{component_name}} -> {{data_source}}.
HEALTH: 🟡 8.8/10 | Improve after props and data contracts stabilize.

## Intent
- what it renders:
- why it exists:
- who uses it:

## Inputs
- props:
- query shape:
- permissions:

## Outputs
- displayed fields:
- actions:
- linked routes:

## Reuse rules
- shared across sites?
- site-specific wrapper?
- safe public fields only?
