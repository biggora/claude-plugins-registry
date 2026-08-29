---
name: n8n-api
description: "Use for authenticated work with an n8n instance through its public REST API: discover capabilities, inspect or manage workflows and executions, credentials, tags, variables, projects, folders, data tables, users, audits, insights, source-control pulls, and supported instance settings. Do not use for ordinary workflow design with no API calls, undocumented internal /rest endpoints, or webhook handling alone."
---

# n8n Public REST API

Use the public `/api/v1` API in a version-aware, least-privilege way. This skill was validated against stable n8n `2.36.8` on 2026-08-29, but the target instance's discovery response and OpenAPI document are authoritative.

## Required inputs

Establish these before calling the API:

- the instance base URL, including any configured path prefix and excluding a trailing slash
- an API key available through an environment variable or secret manager
- the intended operation and exact target resource
- explicit authorization for any mutation, especially publish, retry, stop, delete, package, settings, or source-control operations

Do not ask the user to paste an API key into chat. Do not print, log, commit, or persist the key. If no key is available, explain how to create one in **Settings > n8n API** and let the user place it in the environment.

Use `N8N_BASE_URL` and `N8N_API_KEY` in examples. If the user's environment already uses `N8N_HOST`, preserve it rather than renaming configuration unnecessarily.

## Workflow

### 1. Classify the request

- Read-only inspection can proceed once the target instance is known and credentials are available.
- A write requires the user's requested outcome to clearly authorize that write.
- Bulk changes, execution retries, workflow publication, source-control pulls, and destructive operations require a preview of the exact scope before execution.
- If the user asks only for code or instructions, do not call their instance.

### 2. Discover what this instance and key support

Prefer capability discovery over a memorized endpoint list:

```bash
curl --silent --show-error --fail-with-body \
  -H "Accept: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_BASE_URL/api/v1/discover?resource=workflow&include=schemas"
```

`GET /discover` returns the scopes, resources, operations, endpoint paths, and a `specUrl` visible to the current API key. Use `resource` and `operation` filters to keep the response focused. Add `include=schemas` when constructing a request body.

For self-hosted instances, the built-in Swagger UI is at `/api/v1/docs`. It operates on live data. The hosted documentation playground proxies calls through Scalar; never enter a production key there. Use a limited-scope test key and test data if a playground is necessary.

If discovery is unavailable on an older instance, use that instance's `/api/v1/docs` or the official endpoint reference. Never fall back to undocumented `/rest/*` routes.

### 3. Resolve the exact endpoint and schema

- Confirm the method, path, query parameters, request schema, required scope, and feature availability from discovery/OpenAPI.
- Treat IDs and cursors as opaque strings. URL-encode path and query values.
- Do not assume Cloud, Community, Business, and Enterprise instances expose identical capabilities.
- Do not infer that a `403` means an endpoint is absent; check API-key scopes, project role, ownership, license, and instance configuration.
- For credential payloads, retrieve `/credentials/schema/{credentialTypeName}` instead of guessing fields.

Read [references/public-api.md](references/public-api.md) for the stable-version capability map, migration notes, and high-risk operation rules.

### 4. Read before writing

For an existing resource, fetch its current state and verify its ID, project, name, and relevant version before mutation. Build the smallest valid body from the discovered request schema.

- Do not send a GET response back unchanged as a create/update body: remove read-only fields and preserve only supported writable fields.
- A workflow update is a structural operation. Preserve `nodes`, `connections`, and required `settings` unless the requested change intentionally replaces them.
- On current n8n versions, updating a published workflow republishes it by default. Use `publishIfActive=false` when the user wants a draft and the target schema supports it.
- Credential reads omit secret data. Never treat a metadata response as a restorable credential backup.
- A webhook URL is not an authenticated public-API endpoint. Its authentication and payload contract come from the workflow's trigger configuration.

### 5. Execute safely

Use the API key only in the `X-N8N-API-KEY` header and send `Accept: application/json`. Add `Content-Type: application/json` only when sending JSON.

```bash
curl --silent --show-error --fail-with-body \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  --data-binary @payload.json \
  "$N8N_BASE_URL/api/v1/<discovered-path>"
```

Avoid verbose HTTP tracing around secrets or credential payloads. Set reasonable connect and request timeouts in unattended code. Retry only idempotent reads automatically; do not blindly retry creates, retries, imports, pulls, or other side-effecting requests.

### 6. Paginate completely

List endpoints use cursor pagination. The documented default page size is 100 and the maximum is 250. Follow `nextCursor` until it is absent/null, preserving all original filters and URL-encoding the cursor. Do not silently report a first page as the complete result.

### 7. Verify the outcome

After a successful mutation:

- read the affected resource or use a filtered list call
- verify the requested state, project/folder placement, and publish/archive status as applicable
- for execution actions, verify the resulting execution ID and status without dumping execution data unnecessarily
- for data-table writes, verify the affected row count or returned rows
- for source-control pull, inspect the returned file list and publication result

Report partial success explicitly. A `2xx` response proves request acceptance, not necessarily the user's end-to-end outcome.

## Current terminology and boundaries

- Prefer **publish/unpublish**. The legacy `/activate` and `/deactivate` workflow endpoints are deprecated on current stable n8n.
- The public API doesn't provide a generic "run any workflow" operation. Trigger a production webhook only when the workflow exposes one and the user authorizes the run. `/webhook-test` works only while the editor is listening. Evaluation test-run endpoints are a separate feature.
- Use the public API, not the internal editor API. Session cookies and undocumented endpoints are outside this skill.
- n8n API availability, scoped keys, projects, source control, log streaming, SSO, and other capabilities vary by hosting plan, license, role, and configuration.

## Error handling

- `400`: inspect the discovered schema and rejected fields.
- `401`: missing, expired, or invalid API key.
- `403`: insufficient API-key scope, project permission, ownership, license, or policy restriction.
- `404`: wrong base path/ID, inaccessible resource, unsupported endpoint, or hidden resource.
- `409`: state conflict; inspect the response and current resource state before deciding whether to retry.
- `429` or transient `5xx`: honor `Retry-After` when present and use bounded exponential backoff only where replay is safe.

Preserve the response status and body for diagnosis, but redact secrets, credential data, webhook URLs, and sensitive execution payloads from user-facing output.
