import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const rootDir = process.cwd();
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".webp": "image/webp"
};

function resolvePath(urlPath) {
  const safePath = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(rootDir, safePath === "\\" || safePath === "/" ? "index.html" : safePath);
  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  return join(rootDir, "index.html");
}

http
  .createServer((request, response) => {
    const filePath = resolvePath(request.url || "/");
    const extension = extname(filePath).toLowerCase();
    const type = mimeTypes[extension] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store"
    });

    createReadStream(filePath).pipe(response);
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`Static server running at http://localhost:${port}`);
  });
