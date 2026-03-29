import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

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

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Go Buddy Go - API Server</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1B0B54, #1A3399, #0A5FA0);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #fff;
      text-align: center;
      padding: 20px;
    }
    .card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 480px;
      backdrop-filter: blur(10px);
    }
    h1 { font-size: 2.5rem; margin-bottom: 8px; }
    .accent { color: #ffd166; }
    .subtitle {
      color: #ffd166;
      font-size: 0.9rem;
      letter-spacing: 4px;
      margin-bottom: 24px;
    }
    p { color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 16px; }
    .status {
      display: inline-block;
      background: #3ECF8E;
      color: #fff;
      padding: 6px 20px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>GO <span class="accent">BUDDY</span> GO</h1>
    <div class="subtitle">CO-PILOT MODE</div>
    <p>This is the API server for the Go Buddy Go companion app — a gamified mobile app for siblings of children using GoBabyGo ride-on vehicles.</p>
    <p>Download the app on your mobile device to get started!</p>
    <div class="status">API ONLINE</div>
  </div>
</body>
</html>`);
});

export default app;
