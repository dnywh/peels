import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const requestedDir = process.argv[2] ?? "src";
const rootDir = join(projectRoot, requestedDir);
const port = Number(process.env.PORT ?? 3001);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

function getFilePath(url) {
  const pathname = decodeURIComponent(
    new URL(url, `http://localhost`).pathname
  );
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = normalize(join(rootDir, relativePath));

  if (!filePath.startsWith(`${rootDir}${sep}`) && filePath !== rootDir) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  const filePath = getFilePath(request.url ?? "/");

  if (!filePath) {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Length": fileStat.size,
      "Content-Type":
        mimeTypes[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${requestedDir}/ at http://127.0.0.1:${port}`);
});
