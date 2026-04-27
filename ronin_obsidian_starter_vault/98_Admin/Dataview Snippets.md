# Dataview Snippets

## All curriculum units grouped by status
```dataview
TABLE module, discipline, style, review_status
FROM "03_Curriculum"
SORT status ASC, module ASC
```

## Techniques that still need review
```dataview
TABLE category, safety_level, review_status
FROM "04_Techniques"
WHERE review_status != "approved"
SORT file.name ASC
```

## Latest class notes
```dataview
TABLE date, visibility_scope, file.mtime
FROM "06_Class_Notes"
SORT date DESC
LIMIT 10
```
