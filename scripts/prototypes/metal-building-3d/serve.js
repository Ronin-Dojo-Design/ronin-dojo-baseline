import { join } from "node:path";

const port = 4173;
const prototypeDir = import.meta.dir;
const threeRoot = join(
  prototypeDir,
  "../../../apps/web/node_modules/three",
);
const threeModulePath = join(threeRoot, "build/three.module.js");
const orbitControlsPath = join(
  threeRoot,
  "examples/jsm/controls/OrbitControls.js",
);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function missingDependencyResponse(path) {
  return new Response(
    `Missing ${path}. Install the apps/web dependencies before running this prototype.\n`,
    {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    },
  );
}

async function serveFile(path, extension) {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    return new Response("Not found\n", { status: 404 });
  }

  return new Response(file, {
    headers: { "content-type": contentTypes[extension] },
  });
}

const server = Bun.serve({
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === "/" || pathname === "/index.html") {
      return serveFile(join(prototypeDir, "index.html"), ".html");
    }

    if (pathname === "/main.js") {
      return serveFile(join(prototypeDir, "main.js"), ".js");
    }

    if (pathname === "/vendor/three.module.js") {
      const file = Bun.file(threeModulePath);
      if (!(await file.exists())) {
        return missingDependencyResponse(threeModulePath);
      }

      return new Response(file, {
        headers: { "content-type": contentTypes[".js"] },
      });
    }

    if (pathname === "/vendor/OrbitControls.js") {
      const file = Bun.file(orbitControlsPath);
      if (!(await file.exists())) {
        return missingDependencyResponse(orbitControlsPath);
      }

      const source = await file.text();
      const rewritten = source.replace(
        /from\s+["']three["']/g,
        'from "/vendor/three.module.js"',
      );

      return new Response(rewritten, {
        headers: { "content-type": contentTypes[".js"] },
      });
    }

    return new Response("Not found\n", { status: 404 });
  },
});

console.log(`Metal building prototype: http://localhost:${server.port}`);
