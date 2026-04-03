const MESHY_API_BASE = "https://api.meshy.ai/openapi/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("MESHY_API_KEY");
  if (!apiKey) {
    return json({ error: "Meshy API key not configured" }, 500);
  }

  // Derive taskId from the URL path.
  // URL is like: /functions/v1/image-to-3d  or  /functions/v1/image-to-3d/some-task-id
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  const fnIndex = segments.lastIndexOf("image-to-3d");
  const taskId = fnIndex !== -1 ? (segments[fnIndex + 1] ?? null) : null;

  try {
    if (req.method === "POST" && !taskId) {
      // POST /image-to-3d — submit a photo and get back a taskId
      const body = await req.json() as { imageDataUri?: string };
      if (!body.imageDataUri?.startsWith("data:")) {
        return json({ error: "imageDataUri (base64 data URI) is required" }, 400);
      }

      const response = await fetch(`${MESHY_API_BASE}/image-to-3d`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: body.imageDataUri, enable_pbr: false }),
      });

      if (!response.ok) {
        return json({ error: `Meshy API error: ${await response.text()}` }, response.status);
      }

      const data = await response.json() as { result: string };
      return json({ taskId: data.result });

    } else if (req.method === "GET" && taskId) {
      // GET /image-to-3d/:taskId — poll for status
      const response = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        return json({ error: `Meshy API error: ${await response.text()}` }, response.status);
      }

      const data = await response.json() as {
        status: string;
        model_urls?: { glb?: string };
        progress?: number;
      };

      const meshyStatus = data.status?.toLowerCase() ?? "pending";
      const status: "pending" | "succeeded" | "failed" =
        meshyStatus === "succeeded" ? "succeeded"
        : meshyStatus === "failed" || meshyStatus === "expired" ? "failed"
        : "pending";

      return json({
        status,
        modelUrl: status === "succeeded" ? (data.model_urls?.glb ?? null) : null,
        progress: data.progress ?? 0,
      });

    } else {
      return json({ error: "Not found" }, 404);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
