interface Env {
  XAI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}

interface ClientSecretResponse {
  value: string;
  expires_at: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    return json({ error: "Voice scheduling is not configured." }, 503);
  }

  const origin = context.request.headers.get("Origin") ?? "";
  const allowed = (context.env.ALLOWED_ORIGINS ?? "https://steveknowsweb.com,https://www.steveknowsweb.com")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  try {
    const upstream = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_after: { seconds: 300 },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("xAI client_secrets failed:", upstream.status, detail);
      return json({ error: "Could not start voice session." }, 502, headers);
    }

    const data = (await upstream.json()) as ClientSecretResponse;
    return json({ token: data.value, expires_at: data.expires_at }, 200, headers);
  } catch (err) {
    console.error("voice session error:", err);
    return json({ error: "Could not start voice session." }, 500, headers);
  }
};

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get("Origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return new Response(null, { status: 204, headers });
};

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}