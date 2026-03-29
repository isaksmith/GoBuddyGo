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

app.use((req, res, next) => {
  const expoPlatform = req.headers["expo-platform"];
  if (expoPlatform && process.env.NODE_ENV !== "production") {
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
    if (req.method === "POST" || req.method === "PUT") {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
    return;
  }
  next();
});

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

app.use("/api/assets", express.static(path.join(__dirname, "../public/assets")));
app.use("/api", router);

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
