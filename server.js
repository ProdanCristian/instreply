import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./localhost+1-key.pem"),
  cert: fs.readFileSync("./localhost+1.pem"),
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prerenderManifestPath = path.join(
  __dirname,
  ".next",
  "prerender-manifest.json"
);
if (
  process.env.NODE_ENV === "production" &&
  !fs.existsSync(prerenderManifestPath)
) {
  console.log("Creating empty prerender-manifest.json file");
  fs.writeFileSync(
    prerenderManifestPath,
    JSON.stringify({
      version: 4,
      routes: {},
      dynamicRoutes: {},
      notFoundRoutes: [],
      preview: {
        previewModeId: crypto.randomBytes(16).toString("hex"),
        previewModeSigningKey: crypto.randomBytes(32).toString("hex"),
        previewModeEncryptionKey: crypto.randomBytes(32).toString("hex"),
      },
    })
  );
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log("> Ready on https://localhost:3000");
  });
});
