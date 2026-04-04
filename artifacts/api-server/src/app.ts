import fs from "fs";
import http from "http";
import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const EXPO_DEV_PORT = 18115;
const TEMPORARILY_DISABLE_API = process.env.DISABLE_API?.toLowerCase() === "true";

function isExpoDevRequest(req: express.Request): boolean {
  if (req.headers["expo-platform"]) return true;

  const url = req.originalUrl;
  if (url.includes(".bundle")) return true;
  if (url.includes("platform=ios") || url.includes("platform=android")) return true;
  if (url.startsWith("/inspector") || url.startsWith("/debugger") || url.startsWith("/symbolicate")) return true;
  if (url.startsWith("/logs") || url.startsWith("/status")) return true;
  if (url === "/message" || url.startsWith("/message?")) return true;
  if (url.startsWith("/.expo")) return true;

  return false;
}

function proxyToExpo(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (process.env.NODE_ENV === "production") return next();
  if (!isExpoDevRequest(req)) return next();

  const proxyReq = http.request(
    {
      hostname: "localhost",
      port: EXPO_DEV_PORT,
      path: req.originalUrl,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", () => {
    next();
  });
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

app.use(proxyToExpo);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const assetsDir = path.join(__dirname, "../public/assets");

app.get("/api/assets/model/:name", (req, res) => {
  const { name } = req.params;
  if (!/^[a-zA-Z0-9_-]+\.glb$/.test(name)) {
    res.status(400).json({ error: "Invalid asset name" });
    return;
  }

  const parsed = path.parse(name);
  const optimizedPath = path.join(assetsDir, `${parsed.name}.mobile${parsed.ext}`);
  const originalPath = path.join(assetsDir, name);
  const selectedPath = fs.existsSync(optimizedPath) ? optimizedPath : originalPath;

  if (!fs.existsSync(selectedPath)) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  res.type("model/gltf-binary");
  res.sendFile(selectedPath);
});

app.use("/api/assets", express.static(assetsDir));
if (TEMPORARILY_DISABLE_API) {
  app.use("/api", (_req, res) => {
    res.status(503).json({
      error: "API temporarily disabled",
      message: "The API is currently unavailable while access is restricted.",
    });
  });
} else {
  app.use("/api", router);
}

const webBuildDir = path.join(__dirname, "../../mobile/dist");
if (fs.existsSync(webBuildDir)) {
  app.use(express.static(webBuildDir, { dotfiles: "allow" }));
  app.get("/{*splat}", (req, res) => {
    const decodedPath = decodeURIComponent(req.path);
    const filePath = path.join(webBuildDir, decodedPath);
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.startsWith(webBuildDir) && fs.existsSync(normalizedPath) && fs.statSync(normalizedPath).isFile()) {
      return res.sendFile(normalizedPath);
    }
    const indexPath = path.join(webBuildDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Not Found");
    }
  });
}

export default app;
