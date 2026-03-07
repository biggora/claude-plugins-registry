# NotebookLM Authentication

## First-Time Setup (Browser)

```bash
pip install "notebooklm-py[browser]"
playwright install chromium
notebooklm login
```

This opens a browser, you log into Google, and cookies are saved to `~/.notebooklm/storage_state.json`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTEBOOKLM_HOME` | Base directory for config (default: `~/.notebooklm`) |
| `NOTEBOOKLM_AUTH_JSON` | Inline auth JSON — no file needed (for CI/CD) |
| `NOTEBOOKLM_DEBUG_RPC` | Set to `1` for debug logging |

## CI/CD (No Browser)

Export cookies from a logged-in session, then:

```bash
export NOTEBOOKLM_AUTH_JSON='{"cookies": [{"name": "SID", "value": "...", ...}], "csrf_token": "...", "session_id": "..."}'
```

Or in Python:
```python
import os
os.environ["NOTEBOOKLM_AUTH_JSON"] = '{"cookies": [...]}'
async with await NotebookLMClient.from_storage() as client:
    ...
```

## Auth Precedence (highest → lowest)
1. Explicit `path` arg to `from_storage()`
2. `NOTEBOOKLM_AUTH_JSON` env var
3. `$NOTEBOOKLM_HOME/storage_state.json`
4. `~/.notebooklm/storage_state.json`

## Token Refresh

CSRF tokens auto-refresh on 401/403. For proactive refresh:
```python
await client.refresh_auth()
```

If session cookies expire entirely → re-run `notebooklm login`.

## Diagnose Auth Issues

```bash
notebooklm auth check
notebooklm auth check --test   # Also validates network
notebooklm auth check --json   # Machine-readable
```