# Metal Building 3D Prototype

> **PROTOTYPE — not product code.** This directory is a throwaway visualization
> spike and is not imported by any app.

From the repository root, run:

```sh
bun scripts/prototypes/metal-building-3d/serve.js
```

Then open <http://localhost:4173>.

The prototype reuses the workspace's existing Three.js installation at
`apps/web/node_modules/three`. That directory must already be installed; this
prototype has no package manifest or dependencies of its own. The server resolves
the dependency relative to its own directory, so it works from any checkout or
worktree.

`serve.js` exposes the installed Three.js module directly. It serves
`OrbitControls.js` after rewriting its bare `from "three"` import to the local
`/vendor/three.module.js` URL in memory.
