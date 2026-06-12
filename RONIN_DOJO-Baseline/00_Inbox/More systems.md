Done. I audited the repo and rebuilt the control-pack against this stack.

Four-part repo read

1. What’s already built  
This repo is already a real platform spine: Next.js web, Expo mobile, Postgres, Prisma, Better-Auth, and MDX-in-git for current public content, with a repo-native docs/wiki/session system already in place.     
The schema is far beyond a stub — it already has Passport, DirectoryProfile, Organization, Discipline, RankSystem, Rank, Membership, Tournament, Registration, RegistrationEntry, and content-direction models like ContentAtom/ContentTask.  

2. What still smells transitional  
A few things are clearly still in transition: the schema still carries Dirstarter reference models marked for later removal, the auth doc still leaves the mobile auth contract open between Better-Auth mobile SDK vs JWT bridge, and the docs themselves honestly show mid-range health and incomplete backlink wiring.       
Also, the repo currently uses MDX as the live public content path while the richer content-atom system is present as an emerging direction, not yet the one true editorial center.    

3. How it differs from the old monorepo  
The old monorepo’s center of gravity was WordPress/PODS/multi-brand duplication and a heavier external control plane; the new repo is explicitly one app, one DB, one schema, brand as a column, with repo-native sessions, rituals, protocols, and wiki docs.      

4. Best next sprint  
The strongest next sprint is still stabilize Milestone 1 / S2, not widen the system: finish the Passport/auth/bootstrap path, prove organization create/join, prove membership shells, and land directory/privacy behavior cleanly before expanding harder into content-engine or broader rollout work. That follows the repo’s own current program plan and session flow.      

Updated docs pack

ZIP pack  
[ronin_dojo_baseline_systems_pack.zip](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack.zip?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)

Open folder  
[ronin_dojo_baseline_systems_pack](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)

Included

- [Repo audit](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/01_RONIN_DOJO_BASELINE_REPO_AUDIT.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [Truth index](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/02_REPO_TRUTH_INDEX_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [Alias ledger](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/03_ALIASES_AND_CANONICAL_IDS_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [Manual-boundary registry](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/04_MANUAL_BOUNDARY_REGISTRY_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [JETTY 3.0 systems profile](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/05_JETTY_3.0_SYSTEMS_PROFILE_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [Usage guide](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/06_HOW_TO_USE_THESE_REGISTRIES_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [Next-session loading order](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/07_NEXT_SESSION_LOADING_ORDER_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [SOP: data + wiring flows](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/08_SOP_DATA_AND_WIRING_FLOWS_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [SOP: E2E user lifecycle](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/09_SOP_E2E_USER_LIFECYCLE_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [SOP: agent workflows + rituals + protocols folder map](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/10_SOP_AGENT_WORKFLOWS_AND_RITUALS_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [Content engine command center + intake system](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/11_CONTENT_ENGINE_COMMAND_CENTER_AND_INTAKE_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)
- [Video shortcuts + Iggy automation flow](sandbox:/mnt/data/ronin_dojo_baseline_systems_pack/12_VIDEO_SHORTCUTS_AND_IGGY_AUTOMATION_BASELINE.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=43266696-b7f0-432e-a1af-09c89e4fd40d)

I aligned these to the repo’s actual control plane:

- latest SESSION_NNNN file as active handoff truth, not the old dashboard state machine  
- repo-native opening/closing rituals    
- repo-native wiki index and JETTY 3.0 as the documentation spine    
- the new multi-brand-as-column architecture, not the old replicated brand stack  

And I adjusted the content-engine docs so they fit this repo’s reality:

- current public content = MDX in repo
- knowledge/process memory = wiki + sessions
- emerging reusable structured editorial system = ContentAtom direction in schema/docs      

The clean next move is to take this pack and turn it into repo-ready files at the exact target paths you want under docs/, with a proposed folder map and filenames that match the baseline repo conventions.


https://chatgpt.com/s/t_69f233e233a88191ab6915c89a1063d1

