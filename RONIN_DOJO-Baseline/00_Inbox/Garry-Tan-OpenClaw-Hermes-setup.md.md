Garry Tan Runs 100,000 Pages of Brain, 100+ Skills, and One Thin Harness

Garry Tan's personal AI isn't a chatbot. It's a runtime with 100+ skills, 100,000 pages of structured knowledge, and a meta-skill that writes new skills automatically.

Here's how it works:

**The harness**

* OpenClaw receives input, matches it to a skill, dispatches
* Thin by design. A few thousand lines of routing logic, nothing else
* The harness knows nothing about books, meetings, or people. It just routes
* Hosting options: spare computer at home via Tailscale, or Render/Railway in the cloud
* Alternative harness: Hermes Agent. Garry runs both simultaneously
* Pi is a third option if you want to build your own harness from scratch
* After every new skill is created, run `check_resolvable` to verify it's wired into the resolver

**The skills**

* 100+ markdown files, each handling one specific task
* `book-mirror`: extracts all chapters, runs a sub-agent per chapter, maps each one to Garry's actual life context in two columns (what the author argues / how it maps to his actual life)
* `meeting-ingestion`: pulls transcript, structures a summary, then walks every person and company mentioned and updates their brain pages with what was discussed. The entity propagation is the real output, not the meeting summary
* `enrich`: pulls from 5 sources, merges into one cited brain page with career arc, contact info, meeting history, and relationship context
* `perplexity-research`: runs web search via Perplexity, but checks the brain first before synthesizing, so output explicitly flags what's new versus already captured
* `cross-modal-eval`: sends output through multiple models, has them score each other on quality dimensions you define. This is how factual errors in `book-mirror` got caught and baked back into the skill
* `media-ingest`: handles video, audio, PDF, screenshots, GitHub repos. Transcribes, extracts entities, files to the correct brain location
* `skillify`: the meta-skill. Run `/skillify` on any completed workflow and it examines what happened, extracts the repeatable pattern, writes a tested skill file with triggers and edge cases, and registers it in the resolver automatically
* Skills compose: `book-mirror` calls `brain-ops` for storage, `enrich` for context, `cross-modal-eval` for quality checks, and `pdf-generation` for output in sequence
* When you improve one skill, every workflow that calls it gets better automatically

**The brain**

* 100,000 pages of structured knowledge in a git repo
* Every person gets a page: timeline, current state, open threads, relationship score
* Every meeting triggers entity propagation: after every call, the system walks through every person and company mentioned and updates their pages with what was discussed
* Every book gets a chapter-by-chapter mirror
* Every article, podcast, and video gets ingested, tagged, and cross-referenced
* Page schema: compiled truth at top (current best understanding), append-only timeline below (events in chronological order), raw source material as data sidecars
* Per-section brain searches on every right-column entry: when the book talks about difficult conversations, it pulls from actual meeting notes with specific people, not generic synthesis
* 97.6% recall on LongMemEval, beating MemPalace with no large language model in the retrieval loop
* Deep retrieval uses GBrain tool use: every cited entry in a mirror links back to an actual brain page
* Think personal Wikipedia where every page is continuously updated by an AI that was at the meeting, read the email, watched the talk, and ingested the PDF

**The models**

* Opus 4.7 1M for precision tasks and catching factual errors
* GPT-5.5 for exhaustive extraction, recall, and missing context
* DeepSeek V4-Pro for creative passes, third perspectives, and catching when output reads as generic
* Groq with Llama for speed
* The skill decides which model runs for which task. The harness doesn't care
* Cross-modal evaluation runs multiple models against the same output and has them score each other. That's how `book-mirror` Version 1 caught three factual errors before Version 2 shipped
* Treating any single model as the answer is the wrong frame. The model is the engine, everything else is the car

**The resolver**

* The resolver is the routing table for intelligence
* It maps incoming requests to the right skill
* Every new skill registered with `check_resolvable` gets wired in automatically
* The harness dispatches based on resolver output. Nothing is hardcoded

**Real examples**

* Demis Hassabis fireside prep: accumulated brain page built over months from articles, podcast transcripts, and meeting notes. Published beliefs on artificial general intelligence timelines ("50% scaling, 50% innovation," 5 to 10 years out). Mallaby biography highlights. Stated research priorities: continual learning, world models, long-term memory. Cross-references to Garry's own public positions. Three live demo scripts for showing multi-hop reasoning during the conversation. All ready in under 2 minutes
* Book mirror on Pema Chödrön's *When Things Fall Apart*: 22 chapters, each processed by a sub-agent. Output was a 30,000-word document mapping every chapter to Garry's actual life: family history, founder conversations that week, patterns from therapy, late-night writing sessions. Took 40 minutes. A $300/hour therapist with full context couldn't do it in 40 hours
* Book mirror Version 1 had three factual errors: wrong marital status, wrong birth country. `cross-modal-eval` caught them. The fix got baked into the skill. Every mirror since has been clean
* Garry has run this on 20+ books. Each mirror knows about every mirror before it. The context compounds

**The open source stack**

* GBrain: knowledge infrastructure, 97.6% recall on LongMemEval, ships with 39 installable skills including everything above, one command to install
* OpenClaw: primary harness
* Hermes Agent: alternative harness, Garry runs both
* GStack: coding skill framework, used as a skill inside OpenClaw when the agent needs to write code, includes a programmable browser both headed and headless
* Full data repos on GitHub
* Start with GBrain, do one real task with your agent, run `/skillify` on it, run `check_resolvable`, repeat
* Here's the [Github](https://github.com/garrytan/gbrain)