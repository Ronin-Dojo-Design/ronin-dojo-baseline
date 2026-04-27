# Command Center

## Today
```tasks
not done
(path includes 03_Curriculum) OR (path includes 04_Techniques) OR (path includes 05_Lesson_Plans) OR (path includes 06_Class_Notes)
sort by due
sort by path
```

## Curriculum in progress
```dataview
TABLE module, discipline, style, status, review_status, publish_target
FROM "03_Curriculum"
SORT module ASC, file.name ASC
```

## Techniques ready for review
```dataview
TABLE discipline, style, category, safety_level, review_status
FROM "04_Techniques"
WHERE status != "published"
SORT review_status ASC, file.name ASC
```

## Lesson plans by unit
```dataview
TABLE curriculum_unit, class_type, duration_minutes, status
FROM "05_Lesson_Plans"
SORT curriculum_unit ASC, file.name ASC
```

## Recent class and mood notes
```dataview
TABLE date, visibility_scope, status
FROM "06_Class_Notes" OR "07_Mood_Notes"
SORT date DESC
LIMIT 20
```

## Publish queue
```dataview
TABLE note_type, publish_target, status, review_status
FROM "03_Curriculum" OR "04_Techniques" OR "05_Lesson_Plans" OR "06_Class_Notes" OR "07_Mood_Notes"
WHERE status = "ready_to_publish"
SORT publish_target ASC, file.name ASC
```
