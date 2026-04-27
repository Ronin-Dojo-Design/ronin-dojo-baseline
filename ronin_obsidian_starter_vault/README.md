# Ronin Obsidian Starter Vault

This starter vault is designed to teach Obsidian while also fitting the Ronin architecture.

## Big idea
Use Obsidian as your **thinking, planning, drafting, and review layer**.
Use Ronin custom tables and Pods as your **published system-of-record layers**.

That means:
- Obsidian is where you sketch, connect, refine, and queue work.
- Pods are where selected editorial content can be published once it is ready.
- Ronin custom tables remain the home for transactional truth.

## Recommended plugin stack
### Core plugins
- Daily notes
- Templates
- Properties
- File explorer
- Canvas
- Bases (optional, still evolving)
- Obsidian URI
- Web Clipper

### Community plugins
- Tasks
- Dataview
- Templater

## First setup pass
1. Open this folder as a vault in Obsidian.
2. Enable core plugins: Daily notes, Templates, Properties view.
3. Install community plugins: Tasks, Dataview, Templater.
4. Set Templater template folder to `90_Templates`.
5. Point Daily Notes to `01_Daily` and use `90_Templates/TEMPLATE - Daily Note.md`.
6. Start from `02_Dashboards/Command Center.md`.

## Modeling rules for this vault
- Do not flatten everything into one generic note type.
- Keep curriculum, techniques, lesson plans, class notes, mood notes, and student notes distinct.
- Put tasks inside the note that owns the work.
- Use dashboards to collect tasks instead of moving tasks to a separate app first.
- Only promote notes to Pods or the site when they reach `ready_to_publish`.

## Publish pipeline suggestion
- `draft` -> `review` -> `ready_to_publish` -> `published`
- `publish_target` controls where the note may eventually go.
- `source_of_truth` reminds you whether this note is planning-only, editorial-ready, or truly canonical.
