# Vercel Production Environment Variables

## winston-chat (`chat.winstonai.io`)

Copy into **Vercel Dashboard → winston-chat** → Settings → Environment Variables → Production.

| Variable | Value | Notes |
|----------|-------|-------|
| `OPENAI_API_KEY` | *(your OpenAI key)* | Required for demo/portfolio/werule KBs — not commandcenter |
| `API_KEY` | *(secure key)* | Server auth for `/api/chat` |
| `NEXT_PUBLIC_API_KEY` | **Same as `API_KEY`** | Client sends as `x-api-key` header |
| `ALLOWED_ORIGINS` | See below | CORS for embeds |
| `NEXT_PUBLIC_PORTFOLIO_HOST` | `williamacampbell.com` | Portfolio host mapping |
| `COMMAND_CENTER_API_URL` | `https://www.winstonai.io` | Bridge target for `kb=commandcenter` |
| `AGENT_API_KEY` | *(shared secret)* | **Must match** winston-ai `AGENT_API_KEY` |

**ALLOWED_ORIGINS value:**

```
https://chat.winstonai.io,https://winstonai.io,https://www.winstonai.io,https://williamacampbell.com,https://we-rule.com,https://www.we-rule.com,https://*.squarespace.com
```

---

## winston-ai (`www.winstonai.io`)

Copy into **Vercel Dashboard → winston-ai** → Settings → Environment Variables → Production.

| Variable | Value | Notes |
|----------|-------|-------|
| `AGENT_API_KEY` | *(shared secret)* | **Must match** winston-chat — authorizes cross-origin `/api/agent/plan` |
| `LM_STUDIO_BASE_URL` | *(HTTPS tunnel URL)* | **Blocked on Vercel if localhost** — see below |
| `LM_STUDIO_MODEL` | *(model id)* | Optional; defaults to env or first loaded model |
| `SUPABASE_*` | *(existing)* | Command Center DB |

### LM Studio / production blocker

Vercel cannot reach `http://127.0.0.1:1234`. For production chat on phone:

1. Run LM Studio on your Mac with a model loaded
2. Expose port 1234 via **Cloudflare Tunnel** (see winston-ai `docs/PRODUCTION_TUNNEL_SETUP.md`)
3. **Porkbun DNS:** stable URL via CNAME `lmstudio` → `<tunnel-uuid>.cfargotunnel.com` (see `docs/NAMED_TUNNEL_PORKBUN.md` in winston-ai repo)
4. Set `LM_STUDIO_BASE_URL=https://your-tunnel.example/v1` on **winston-ai** Vercel Production
5. **Delete** `NEXT_PUBLIC_LM_STUDIO_URL` on winston-ai (mixed-content errors)
6. Redeploy winston-ai

Until the tunnel is live, `chat.winstonai.io` commandcenter mode returns 503 from the bridge.

**Nord VPN:** disable Nord DNS if quick tunnel fails with `no such host` on `api.trycloudflare.com`.

---

After saving env vars, redeploy both projects from the Deployments tab.

**Note:** OpenAI may return `credit_balance_exhausted` until billing credits are added at https://platform.openai.com/settings/organization/billing
