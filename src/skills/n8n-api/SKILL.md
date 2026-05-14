---
name: n8n-api
description: "Use this skill whenever the user wants to interact with an n8n instance via its public REST API. Triggers include: listing, creating, updating, deleting, activating or deactivating workflows; viewing or managing executions; managing credentials, tags, variables, users, or projects; auditing instance activity; triggering workflow runs; checking execution status; or any automation task involving the n8n API. Also use for requests like \"show my n8n workflows\", \"run workflow X\", \"list failed executions\", \"create a tag in n8n\", \"manage n8n variables\", or \"check n8n audit log\". Always use this skill for any n8n API interaction — it defines the correct endpoints, authentication, and patterns."
---

# n8n REST API Skill

Interact with an n8n automation platform instance via its public REST API v1.

## Environment Variables (REQUIRED)

Before making any API calls, ensure these environment variables are set:

| Variable | Description | Example |
|---|---|---|
| `N8N_HOST` | n8n instance hostname (with protocol, no trailing slash) | `https://n8n.example.com` |
| `N8N_API_KEY` | API key generated in n8n UI (Settings > API) | `n8n_api_...` |

```bash
export N8N_HOST="https://n8n.example.com"
export N8N_API_KEY="your-api-key-here"
```

If these are not set, **ask the user** to provide them before proceeding.

## Authentication

All requests require the `X-N8N-API-KEY` header:

```bash
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_HOST/api/v1/workflows"
```

Every request pattern below assumes:
- Base URL: `$N8N_HOST/api/v1`
- Header: `X-N8N-API-KEY: $N8N_API_KEY`
- Content-Type: `application/json` (for POST/PUT/PATCH)

---

## API Endpoints

### Workflows

| Method | Path | Description |
|---|---|---|
| GET | `/workflows` | List all workflows (supports `?active=true/false`, `?tags=tagId`, `?limit=N`, `?cursor=`) |
| GET | `/workflows/{id}` | Get a single workflow by ID |
| POST | `/workflows` | Create a new workflow |
| PUT | `/workflows/{id}` | Update an existing workflow (full replace) |
| DELETE | `/workflows/{id}` | Delete a workflow |
| POST | `/workflows/{id}/activate` | Activate a workflow |
| POST | `/workflows/{id}/deactivate` | Deactivate a workflow |
| POST | `/workflows/{id}/transfer` | Transfer workflow to another project |

#### List workflows

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows?limit=50" | jq .
```

Query parameters:
- `active` (boolean) — filter by active/inactive status
- `tags` (string) — filter by tag ID
- `name` (string) — filter by name (partial match)
- `limit` (number) — results per page (default 10, max 250)
- `cursor` (string) — pagination cursor from previous response

#### Get a workflow

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows/{id}" | jq .
```

#### Create a workflow

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Workflow",
    "nodes": [],
    "connections": {},
    "settings": {
      "executionOrder": "v1"
    }
  }' \
  "$N8N_HOST/api/v1/workflows" | jq .
```

Request body fields:
- `name` (string, required) — workflow name
- `nodes` (array, required) — array of node objects
- `connections` (object, required) — node connections map
- `settings` (object) — workflow settings
- `staticData` (object) — static data for the workflow
- `tags` (array of objects) — tags to assign `[{"id": "tagId"}]`

#### Update a workflow

```bash
curl -s -X PUT \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Workflow",
    "nodes": [...],
    "connections": {...},
    "settings": {...}
  }' \
  "$N8N_HOST/api/v1/workflows/{id}" | jq .
```

> **Note:** If the workflow is active, the updated version is automatically re-published.

#### Activate / Deactivate

```bash
# Activate
curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows/{id}/activate" | jq .

# Deactivate
curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows/{id}/deactivate" | jq .
```

#### Delete a workflow

```bash
curl -s -X DELETE -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows/{id}" | jq .
```

---

### Executions

| Method | Path | Description |
|---|---|---|
| GET | `/executions` | List executions (supports filters) |
| GET | `/executions/{id}` | Get a single execution |
| DELETE | `/executions/{id}` | Delete an execution |
| POST | `/executions/{id}/stop` | Stop a running execution |

#### List executions

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/executions?limit=20&status=error" | jq .
```

Query parameters:
- `workflowId` (string) — filter by workflow ID
- `status` (string) — `error`, `success`, `waiting`, `running`
- `limit` (number) — results per page (default 10, max 250)
- `cursor` (string) — pagination cursor
- `includeData` (boolean) — include full execution data (default false)

#### Get execution details

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/executions/{id}?includeData=true" | jq .
```

Response includes:
- `id` — execution ID
- `finished` — boolean
- `mode` — trigger mode (manual, webhook, trigger, etc.)
- `startedAt` / `stoppedAt` — timestamps
- `workflowId` — associated workflow
- `status` — success/error/waiting/running
- `data` — full execution data (when `includeData=true`)

#### Stop a running execution

```bash
curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/executions/{id}/stop" | jq .
```

---

### Credentials

| Method | Path | Description |
|---|---|---|
| GET | `/credentials` | List all credentials |
| POST | `/credentials` | Create new credential |
| DELETE | `/credentials/{id}` | Delete a credential |
| POST | `/credentials/{id}/transfer` | Transfer credential to another project |

#### List credentials

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/credentials?limit=50" | jq .
```

Query parameters:
- `limit` (number) — results per page
- `cursor` (string) — pagination cursor

#### Create credential

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "type": "httpHeaderAuth",
    "data": {
      "name": "Authorization",
      "value": "Bearer token123"
    }
  }' \
  "$N8N_HOST/api/v1/credentials" | jq .
```

Request body:
- `name` (string, required) — credential name
- `type` (string, required) — credential type (e.g., `httpHeaderAuth`, `oAuth2Api`, `httpBasicAuth`)
- `data` (object, required) — credential-specific data

> **Security note:** The API does not return credential secrets in GET responses. Only metadata (id, name, type, createdAt, updatedAt) is returned.

---

### Tags

| Method | Path | Description |
|---|---|---|
| GET | `/tags` | List all tags |
| GET | `/tags/{id}` | Get a single tag |
| POST | `/tags` | Create a new tag |
| PUT | `/tags/{id}` | Update a tag |
| DELETE | `/tags/{id}` | Delete a tag |

#### List tags

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/tags?limit=100" | jq .
```

#### Create tag

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "production"}' \
  "$N8N_HOST/api/v1/tags" | jq .
```

#### Update tag

```bash
curl -s -X PUT \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "staging"}' \
  "$N8N_HOST/api/v1/tags/{id}" | jq .
```

---

### Variables

| Method | Path | Description |
|---|---|---|
| GET | `/variables` | List all variables |
| POST | `/variables` | Create a variable |
| PUT | `/variables/{id}` | Update a variable |
| DELETE | `/variables/{id}` | Delete a variable |

#### List variables

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/variables" | jq .
```

#### Create variable

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "API_ENDPOINT", "value": "https://api.example.com"}' \
  "$N8N_HOST/api/v1/variables" | jq .
```

#### Update variable

```bash
curl -s -X PUT \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "API_ENDPOINT", "value": "https://api-v2.example.com"}' \
  "$N8N_HOST/api/v1/variables/{id}" | jq .
```

---

### Users

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users |
| GET | `/users/{id}` | Get user by ID (or `email:{email}`) |

#### List users

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/users?limit=50" | jq .
```

Query parameters:
- `limit` (number) — results per page
- `cursor` (string) — pagination cursor
- `includeRole` (boolean) — include role in response

---

### Projects

| Method | Path | Description |
|---|---|---|
| GET | `/projects` | List all projects |
| GET | `/projects/{id}` | Get project by ID |
| POST | `/projects` | Create a project |
| PUT | `/projects/{id}` | Update a project |
| DELETE | `/projects/{id}` | Delete a project |

#### List projects

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/projects" | jq .
```

#### Create project

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Marketing Automations"}' \
  "$N8N_HOST/api/v1/projects" | jq .
```

---

### Audit

| Method | Path | Description |
|---|---|---|
| POST | `/audit` | Generate a security audit report |

#### Generate audit

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"additionalOptions": {"categories": ["credentials", "nodes", "instance"]}}' \
  "$N8N_HOST/api/v1/audit" | jq .
```

Audit categories: `credentials`, `nodes`, `database`, `filesystem`, `instance`.

---

### Source Control

| Method | Path | Description |
|---|---|---|
| GET | `/source-control/preferences` | Get source control preferences |
| POST | `/source-control/preferences` | Set source control preferences |
| POST | `/source-control/pull` | Pull changes from remote |
| POST | `/source-control/push` | Push changes to remote |
| GET | `/source-control/status` | Get modified resources status |
| POST | `/source-control/disconnect` | Disconnect from source control |

#### Get status

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/source-control/status" | jq .
```

#### Pull from remote

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"force": false}' \
  "$N8N_HOST/api/v1/source-control/pull" | jq .
```

---

## Pagination

The n8n API uses **cursor-based pagination**. Responses include:

```json
{
  "data": [...],
  "nextCursor": "eyJsaW1pdCI6MTAsIm9mZnNldCI6MTB9"
}
```

To fetch the next page, pass `?cursor=<nextCursor>` on the next request. When `nextCursor` is `null`, there are no more results.

---

## Common Patterns

### List all workflows with their status

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows?limit=250" | \
  jq '.data[] | {id, name, active, updatedAt}'
```

### Find failed executions for a workflow

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/executions?workflowId=123&status=error&limit=50" | \
  jq '.data[] | {id, status, startedAt, stoppedAt}'
```

### Trigger a workflow manually via webhook

If a workflow has a Webhook node, you can trigger it directly:

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}' \
  "$N8N_HOST/webhook/{webhook-path}"
```

> **Note:** Webhook URLs use `/webhook/` or `/webhook-test/` path, not `/api/v1/`.

### Export a workflow as JSON

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows/{id}" | jq . > workflow-backup.json
```

### Import / restore a workflow from JSON

```bash
curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow-backup.json \
  "$N8N_HOST/api/v1/workflows" | jq .
```

### Bulk activate all workflows

```bash
# Get all inactive workflow IDs, then activate each
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows?active=false&limit=250" | \
  jq -r '.data[].id' | while read id; do
    curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
      "$N8N_HOST/api/v1/workflows/$id/activate" > /dev/null
    echo "Activated workflow $id"
  done
```

### Delete old executions (cleanup)

```bash
# Get executions older than a specific date and delete them
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/executions?status=success&limit=100" | \
  jq -r '.data[].id' | while read id; do
    curl -s -X DELETE -H "X-N8N-API-KEY: $N8N_API_KEY" \
      "$N8N_HOST/api/v1/executions/$id" > /dev/null
    echo "Deleted execution $id"
  done
```

---

## Error Handling

Common HTTP status codes:

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (missing or invalid API key) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 500 | Internal server error |

Error response format:

```json
{
  "code": 404,
  "message": "The requested workflow was not found"
}
```

---

## Implementation Notes

- Always read `N8N_HOST` and `N8N_API_KEY` from environment variables — never hardcode them
- Use `jq` for JSON processing in shell scripts
- For Node.js scripts, use `fetch()` or `axios` with the same headers
- Rate limiting: n8n does not enforce strict rate limits by default, but be respectful on shared instances
- Pagination: always handle `nextCursor` for endpoints that return lists
- Webhook URLs are separate from the API (`/webhook/` vs `/api/v1/`)
- Execution data can be large — use `includeData=false` (default) when listing executions
- Workflow JSON structure follows n8n's internal format (nodes + connections + settings)

## Node.js Example

```javascript
const N8N_HOST = process.env.N8N_HOST;
const N8N_API_KEY = process.env.N8N_API_KEY;

async function n8nApi(method, path, body = null) {
  const url = `${N8N_HOST}/api/v1${path}`;
  const options = {
    method,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`n8n API ${res.status}: ${await res.text()}`);
  return res.json();
}

// List workflows
const workflows = await n8nApi('GET', '/workflows?limit=50');
console.log(workflows.data);

// Create a tag
const tag = await n8nApi('POST', '/tags', { name: 'automated' });
console.log(tag);
```

## Python Example

```python
import os
import requests

N8N_HOST = os.environ["N8N_HOST"]
N8N_API_KEY = os.environ["N8N_API_KEY"]

HEADERS = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json",
}

def n8n_api(method, path, json=None):
    url = f"{N8N_HOST}/api/v1{path}"
    resp = requests.request(method, url, headers=HEADERS, json=json)
    resp.raise_for_status()
    return resp.json()

# List workflows
workflows = n8n_api("GET", "/workflows?limit=50")
for wf in workflows["data"]:
    print(f"{wf['id']}: {wf['name']} (active={wf['active']})")

# Create a variable
n8n_api("POST", "/variables", {"key": "ENV", "value": "production"})
```

---

## Verification

After any API interaction, verify:
- HTTP status code is 2xx
- Response contains expected fields (`id`, `name`, etc.)
- For workflow creation/update: check workflow appears in the list
- For activation: check `active` field is `true`
- For executions: check `status` matches expected outcome

## Failure Modes

- **401 Unauthorized**: API key is missing, invalid, or expired. Regenerate in n8n UI > Settings > API.
- **404 Not Found**: Wrong workflow/execution ID, or the resource was deleted. Verify ID with a list call.
- **400 Bad Request**: Invalid JSON body or missing required fields. Check request structure.
- **Connection refused**: Wrong `N8N_HOST` or n8n instance is down. Verify URL and instance status.
- **Empty `data` array**: No results match filters. Broaden query parameters.
