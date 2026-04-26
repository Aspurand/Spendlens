# Sage — SpendLens AI assistant

A thin Anthropic API proxy. Browsers call this function with their existing Supabase JWT; the function verifies the JWT and forwards to Anthropic with the API key (which never leaves the server).

## One-time setup

1. **Install the Supabase CLI** (one-time, on your machine):
   ```bash
   npm install -g supabase
   ```

2. **Link this folder to your project** (run from the `Spendlens/` repo root):
   ```bash
   supabase login
   supabase link --project-ref pqkdsznxffwrbibkiape
   ```

3. **Set the Anthropic API key as a secret** (server-side only — never in the repo):
   ```bash
   supabase secrets set ANTHROPIC_KEY=sk-ant-...
   ```

4. **Deploy the function:**
   ```bash
   supabase functions deploy sage
   ```

5. **Verify it's live** (should return 401 — that means it's reachable and auth-gated):
   ```bash
   curl -i https://pqkdsznxffwrbibkiape.supabase.co/functions/v1/sage
   ```

## Updating the function

After editing `index.ts`:
```bash
supabase functions deploy sage
```

To rotate the Anthropic key:
```bash
supabase secrets set ANTHROPIC_KEY=sk-ant-NEW
supabase functions deploy sage   # picks up new secret
```

## Recommended billing safety net

In the [Anthropic console](https://console.anthropic.com/settings/limits), set a monthly spend cap (e.g. $20). If anything ever leaks or runs away, your max damage is bounded.
