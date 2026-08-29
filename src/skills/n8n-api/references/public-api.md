# n8n Public API reference notes

Use this reference after `GET /api/v1/discover` has identified the relevant resource. It records important behavior from stable n8n `2.36.8` (released 2026-08-28); it is not a substitute for the target instance's discovery response or OpenAPI schema.

## Official sources

- [n8n public REST API overview](https://docs.n8n.io/connect/n8n-api/)
- [Authentication and API-key scopes](https://docs.n8n.io/connect/n8n-api/authentication/)
- [Endpoint reference](https://docs.n8n.io/connect/n8n-api/api-reference/)
- [Pagination](https://docs.n8n.io/connect/n8n-api/pagination/)
- [API playground](https://docs.n8n.io/connect/n8n-api/use-an-api-playground/)
- [Stable 2.36.8 OpenAPI root](https://github.com/n8n-io/n8n/blob/n8n%402.36.8/packages/cli/src/public-api/v1/openapi.yml)
- [n8n releases](https://github.com/n8n-io/n8n/releases)
- [npm stable channel](https://www.npmjs.com/package/n8n?activeTab=versions)

The product version and public API schema version are separate. Stable `2.36.8` exposes API base `/api/v1`; its OpenAPI document reports schema version `1.1.1`.

## Capability discovery

The current API includes:

```http
GET /api/v1/discover
GET /api/v1/discover?resource=workflow
GET /api/v1/discover?resource=workflow&operation=update&include=schemas
```

The response is filtered to the caller's API-key scopes and includes:

- active `scopes`
- supported `resources` and `operations`
- allowed endpoint methods and paths
- request schemas when `include=schemas` is requested
- a `specUrl` for the complete OpenAPI document

Use discovery before hard-coding a newly introduced endpoint. On an older instance without `/discover`, use its built-in `/api/v1/docs` instead.

## Stable 2.36.8 resource map

The stable OpenAPI source includes these resource families. Availability still depends on key scopes, role, license, and configuration.

| Resource | Notable operations |
|---|---|
| Workflows | create/update/delete, version retrieval, publish/unpublish, archive/unarchive, transfer, evaluation test runs |
| Executions | list/get/delete, retry, stop one, stop by bounded filters, get/update execution tags |
| Credentials | list/create/get metadata/update/delete/test, retrieve type schema, transfer |
| Tags and variables | create/list/read or update/delete as exposed by discovery |
| Data tables | table CRUD, row read/insert/update/upsert/clear/delete, column list/create/update/delete |
| Projects | create/list/update/delete and project-member management |
| Folders | CRUD within a project |
| Users | list/create/get/delete and global-role change |
| Audit and insights | generate a security audit; retrieve insights summary |
| Community packages | install/list/update/uninstall |
| Source control | pull from the configured repository |
| Instance settings | selected LDAP, SSO, security-policy, OpenTelemetry, and log-streaming operations |
| n8n packages | beta export/import operations |

Do not treat this table as permission to mutate any resource. It is a routing aid for discovery.

## Changes from older API guidance

### Workflow publication

Use:

```http
POST /workflows/{id}/publish
POST /workflows/{id}/unpublish
```

`/activate` and `/deactivate` remain compatibility aliases in stable `2.36.8`, but are marked deprecated. Publishing can accept a specific `versionId`; a `409` can indicate a workflow-review or webhook-path conflict.

Updating a published workflow republishes by default. When the discovered update endpoint supports it, append `publishIfActive=false` to save the update as a draft instead.

Workflow creation/update schemas now include fields such as project/folder placement, descriptions, node groups, and pinned data. Request the current schema rather than copying an old example. Tags are read-only in the stable workflow create/update schema; manage tag assignment only through endpoints exposed by discovery.

### Execution operations

Current execution filters include more statuses than older examples, such as `canceled`, `crashed`, `new`, and `unknown`. Use the discovered enum.

Retrying an execution can repeat external side effects. The retry body can select the currently saved workflow with `loadWorkflow: true`; otherwise behavior uses the execution's stored workflow. Verify the target execution, workflow, and intended version before retrying.

Bulk stop accepts status and optional workflow/time filters. Never omit the optional filters accidentally when the intended scope is one workflow or time window.

### Credentials

Current stable supports credential metadata reads, updates, tests, schema discovery, and transfer in addition to create/delete. GET responses do not contain secret data. Use:

```http
GET /credentials/schema/{credentialTypeName}
```

Build secret-bearing payloads without logging them. A successful test can contact the external provider and should be treated as a real network action.

### Data tables, folders, and project members

These resources are present in the stable OpenAPI source and were missing from the old skill. Discover their schemas because row filters, column types, folder placement, and member roles are version-sensitive.

Data-table upsert supports a filter, row data, optional returned data, and a `dryRun` field in the stable schema. Prefer a dry run when supported, then use a narrow unique filter and verify the affected row.

### Source control

Stable `2.36.8` documents only:

```http
POST /source-control/pull
```

Do not invent public endpoints for preferences, status, push, or disconnect. The pull feature must be licensed and connected. Start with `force: false` and `autoPublish: none`. A `409` reports conflicts; `force: true` discards local changes and requires separate, explicit authorization after reviewing the conflict list.

### Generic workflow execution

The stable public API has no general endpoint that runs an arbitrary workflow. Distinguish:

- `/webhook/<path>`: production trigger configured by a published Webhook node
- `/webhook-test/<path>`: temporary editor listener
- workflow evaluation test runs: test/evaluation feature, not a generic production trigger

Webhook authentication is configured on the trigger node; `X-N8N-API-KEY` is not automatically valid for a webhook.

## Pagination

Official documentation sets the default page size to 100 and the maximum to 250. List responses use an opaque `nextCursor`:

```json
{
  "data": [],
  "nextCursor": "opaque-value"
}
```

Repeat the request with the same filters and `cursor=<url-encoded-nextCursor>`. Stop only when `nextCursor` is absent or null. Apply a user-requested cap separately from the page size.

## Mutation safeguards

### Workflow update, archive, delete, publish, or unpublish

1. Resolve the workflow by ID and verify its name/project.
2. Read the current version and publication state when exposed.
3. For updates, construct a schema-valid writable payload and choose draft versus republish intentionally.
4. For archive/delete/unpublish, state the runtime effect and exact ID before the call.
5. Re-read and verify the final state.

### Execution retry or stop

1. Read the execution with data omitted unless required.
2. Confirm workflow ID, status, and time.
3. Warn that retry may repeat external effects.
4. Apply the narrowest available filter for bulk stop.
5. Verify the returned/new execution status.

### Data-table clear/delete/update

1. Read table metadata and relevant rows.
2. Preview the filter and expected row count; use `dryRun` where the schema supports it.
3. Avoid unfiltered clear/delete unless the user explicitly requested all rows.
4. Verify affected rows or counts.

### Source-control pull

1. Confirm the exact instance, connected branch, and intended direction of change.
2. Use `force: false` and `autoPublish: none` first.
3. Inspect every returned/conflicting file.
4. Do not switch to `force: true` or automatic publication without explicit authorization.
5. Verify imported resources and publication state.

### Community packages and instance settings

Package install/update/uninstall and LDAP/SSO/security/logging settings change the instance trust or runtime surface. Inspect current state, exact package/version or settings diff, and rollback path before mutation. Do not broaden an ordinary workflow-management request into instance administration.

## HTTP and error behavior

- Send the API key as `X-N8N-API-KEY`; use Enterprise scoped keys with the minimum required scopes.
- Non-Enterprise keys have all capabilities available to the account, so compensate with careful operation scoping.
- `403` can mean key scope, project role, ownership, license, or policy restrictions.
- `409` is state-specific. Inspect the response rather than retrying blindly.
- Retry safe reads on transient failures with bounded exponential backoff and jitter. Respect `Retry-After`.
- Do not automatically replay writes unless the operation is proven idempotent and the prior outcome is known.
- Execution data, audit output, variables, webhook URLs, and workflow node parameters may be sensitive even when the API key itself is redacted.
