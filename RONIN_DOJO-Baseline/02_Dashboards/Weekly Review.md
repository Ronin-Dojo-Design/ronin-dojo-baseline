# Weekly Review

## Inbox triage
```dataview
LIST FROM "00_Inbox"
SORT file.ctime DESC
```

## Stale drafts
```dataview
TABLE note_type, status, review_status, file.mtime
FROM "03_Curriculum" OR "04_Techniques" OR "05_Lesson_Plans" OR "06_Class_Notes" OR "07_Mood_Notes"
WHERE status = "draft" OR status = "review"
SORT file.mtime ASC
```

## Open tasks grouped by folder
```tasks
not done
group by folder
sort by due
```

## Review prompts
- Which curriculum unit moved this week?
- Which techniques need better cues or safety notes?
- Which lesson plans should become reusable templates?
- Which class notes should become formal curriculum changes?
- Which mood notes reveal pacing, energy, or engagement patterns?
