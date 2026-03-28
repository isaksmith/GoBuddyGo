import { Router, type IRouter } from "express";

const router: IRouter = Router();

const MESHY_API_BASE = "https://api.meshy.ai/openapi/v1";

router.post("/image-to-3d", async (req, res) => {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Meshy API key not configured" });
    return;
  }

  const { imageDataUri } = req.body as { imageDataUri?: string };
  if (!imageDataUri || !imageDataUri.startsWith("data:")) {
    res.status(400).json({ error: "imageDataUri (base64 data URI) is required" });
    return;
  }

  try {
    const response = await fetch(`${MESHY_API_BASE}/image-to-3d`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageDataUri,
        enable_pbr: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `Meshy API error: ${text}` });
      return;
    }

    const data = (await response.json()) as { result: string };
    res.json({ taskId: data.result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

router.get("/image-to-3d/:taskId", async (req, res) => {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Meshy API key not configured" });
    return;
  }

  const { taskId } = req.params;

  try {
    const response = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `Meshy API error: ${text}` });
      return;
    }

    const data = (await response.json()) as {
      status: string;
      model_urls?: { glb?: string; fbx?: string; obj?: string };
      progress?: number;
    };

    const meshyStatus = data.status?.toLowerCase() ?? "pending";

    let status: "pending" | "succeeded" | "failed";
    if (meshyStatus === "succeeded") {
      status = "succeeded";
    } else if (meshyStatus === "failed" || meshyStatus === "expired") {
      status = "failed";
    } else {
      status = "pending";
    }

    const modelUrl = data.model_urls?.glb ?? null;

    res.json({
      status,
      modelUrl: status === "succeeded" ? modelUrl : null,
      progress: data.progress ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
