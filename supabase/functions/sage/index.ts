// SpendLens · Sage — thin proxy to Anthropic API
//
// Why a proxy: the Anthropic API key never leaves the server. Browsers call
// this function with their Supabase JWT; the function verifies the JWT (so
// only signed-in users can call) and forwards to Anthropic with the key.
//
// Deploy:
//   supabase functions deploy sage
// Secret:
//   supabase secrets set ANTHROPIC_KEY=sk-ant-...
// Test locally:
//   supabase functions serve sage --env-file ./supabase/.env.local

import Anthropic from "npm:@anthropic-ai/sdk@0.40.1";
import { createClient } from "npm:@supabase/supabase-js@2";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!ANTHROPIC_KEY) console.error("[sage] ANTHROPIC_KEY is not set");
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) console.error("[sage] Supabase env vars missing (auto-injected at runtime)");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY! });
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return errJson(405, "method not allowed");

  // ── Auth: only signed-in SpendLens users may call this function.
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return errJson(401, "missing bearer token");
  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
  if (authErr || !user) return errJson(401, "invalid auth");

  // ── Parse body
  let body: any;
  try { body = await req.json(); } catch { return errJson(400, "invalid JSON"); }

  const {
    model = "claude-haiku-4-5",
    max_tokens = 1024,
    system,
    messages,
    output_config,
    thinking,
    cache_control,
    stream = false,
  } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return errJson(400, "messages[] required");
  }

  try {
    if (stream) {
      // Stream passthrough — pipe Anthropic SSE straight to the browser.
      // Using raw fetch here so we can hand off the readable stream as-is
      // without buffering the full response.
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model, max_tokens, system, messages,
          ...(output_config ? { output_config } : {}),
          ...(thinking ? { thinking } : {}),
          ...(cache_control ? { cache_control } : {}),
          stream: true,
        }),
      });
      if (!upstream.ok || !upstream.body) {
        const text = await upstream.text();
        return errJson(upstream.status, text);
      }
      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...cors,
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
          "connection": "keep-alive",
        },
      });
    }

    // Non-streaming: use the SDK for typed errors and easier debugging.
    const resp = await anthropic.messages.create({
      model,
      max_tokens,
      ...(system ? { system } : {}),
      messages,
      ...(output_config ? { output_config } : {}),
      ...(thinking ? { thinking } : {}),
      ...(cache_control ? { cache_control } : {}),
    } as any);

    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[sage] anthropic error:", e?.status, e?.message);
    return errJson(e?.status || 500, e?.message || "anthropic error");
  }
});

function errJson(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
