Yes — add this pack in addition to the raw imports, then normalize from there.

I built the repo-ready final versions at the exact target paths and names:

[baseline_repo_ready_docs_pack.zip](sandbox:/mnt/data/baseline_repo_ready_docs_pack.zip?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)  
[Open the pack folder](sandbox:/mnt/data/baseline_repo_ready_docs_pack?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)  
[Drop-in order](sandbox:/mnt/data/baseline_repo_ready_docs_pack/DROP_IN_ORDER.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)  
[Adoption checklist](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/wiki/baseline-docs-adoption-checklist.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)

Key files inside:

- [repo-truth-index.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/wiki/repo-truth-index.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [aliases-and-canonical-ids.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/wiki/aliases-and-canonical-ids.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [manual-boundary-registry.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/wiki/manual-boundary-registry.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [jetty-3-baseline-systems-profile.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/jetty-3-baseline-systems-profile.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [how-to-use-these-registries.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/how-to-use-these-registries.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [next-session-loading-order.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/protocols/next-session-loading-order.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [sop-data-and-wiring-flows.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/runbooks/sop-data-and-wiring-flows.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [sop-e2e-user-lifecycle.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/runbooks/sop-e2e-user-lifecycle.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [sop-agent-workflows-and-rituals.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/runbooks/sop-agent-workflows-and-rituals.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [content-engine/command-center-and-intake.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/wiki/content-engine/command-center-and-intake.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)
- [content-engine/video-shortcuts-and-iggy-flow.md](sandbox:/mnt/data/baseline_repo_ready_docs_pack/docs/knowledge/wiki/content-engine/video-shortcuts-and-iggy-flow.md?_chatgptios_conversationID=69e5266e-6dd0-8332-94d1-7e53fbb632b6&_chatgptios_messageID=d5e9b8aa-9b96-4c95-ab6e-bb6e26c6a828)

Why this is the right shape: the baseline repo already uses the latest SESSION_NNNN.md as the live handoff, not the old dashboard state machine; it already has repo-native opening/closing rituals; and it already treats the wiki index + JETTY 3.0 as the documentation spine.           This also stays consistent with the content/command-center doctrine you already established earlier.  

My recommendation:

- keep your raw imported files for one comparison pass
- paste these normalized files into their target locations
- update docs/knowledge/wiki/index.md
- then archive the raw imports under something like docs/_imports/baseline-systems-pack/

After that, the next real move should still be Passport bootstrap smoke proof, not another doc sprint.