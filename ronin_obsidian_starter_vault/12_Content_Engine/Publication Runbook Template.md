---
type: publication_runbook
campaign:
site_target: blackbeltlegacy.local
priority: high
due:
status: active
---

# Publication Runbook — {{title}}

JETTY: This runbook tracks the operational steps needed to move content from draft to live so publishing behaves like a repeatable system instead of memory.
LESSON: Workflow state is operational truth; do not bury it inside public-facing content fields.
WIRING: Content tasks -> content publications -> live URLs -> reporting dashboard.
HEALTH: 🟡 8.6/10 | Good for solo ops; move to custom tables when collaboration grows.

## Steps
- [ ] Approve canonical atom #review
- [ ] Approve social variant #review
- [ ] Approve curriculum variant #review
- [ ] Export media #media
- [ ] Publish to WordPress / Pod #publish
- [ ] Publish to IG / FB / YouTube #publish
- [ ] Save live URLs back into publication log #ops
- [ ] Mark atom as published #ops
