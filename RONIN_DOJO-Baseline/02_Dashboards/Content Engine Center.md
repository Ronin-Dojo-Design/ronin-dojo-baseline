---
type: dashboard
title: Content Engine Center
---

# Content Engine Center

## Today

```tasks
not done
(due today) OR (scheduled today)
sort by priority
sort by due
```

## Waiting on Media

```tasks
not done
description includes #media
sort by due
```

## Ready to Publish

```tasks
not done
description includes #publish
sort by due
```

## Content Atoms by Status

```dataview
table status, publish_state, site_targets, channels, due
from "12_Content_Engine"
where type = "content_atom"
sort due asc
```

## Distribution Variants

```dataview
table parent_atom, channel, site_target, variant_status, publish_date
from "12_Content_Engine"
where type = "distribution_variant"
sort publish_date asc
```

## Publication Runbooks

```dataview
table campaign, site_target, priority, due
from "12_Content_Engine"
where type = "publication_runbook"
sort due asc
```
