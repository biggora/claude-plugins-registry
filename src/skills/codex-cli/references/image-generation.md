# Images through Codex CLI

Read for terminal image generation/editing or registered GitVane POD jobs.

## Built-in tool and API fallback

Use built-in ImageGen by default for a Codex CLI image task. Running `codex exec` does not select the Python/API fallback. Read the installed `imagegen` skill and use the image tool exposed to that session, possibly through code mode. Built-in generation does not require `OPENAI_API_KEY`.

If unavailable, report it. Switch to an API script/provider only when the user explicitly authorizes that method. For an authorized API request, follow the installed imagegen skill's CLI reference; its script requires an API key. Never request that key for built-in generation. The agent's `--model` does not select the image model; keep unreported built-in model/quality values unknown.

Inspect CLI version, login status, feature flags and the installed imagegen skill. Resolve its location using actual `CODEX_HOME` (often `skills/.system/imagegen/`). A flag or skill alone does not prove that the session exposes the tool. Without a request to generate, report configuration checks separately from real generation evidence.

Use one built-in call per requested image/variant; preserve exact text, style, ratio, background and reference roles. Inspect local edit targets first. Use the tool's returned file path, which can initially be under `CODEX_HOME/generated_images/`; copy/import to the user's destination and retain the exact prompt. Preserve alpha for transparent images. `--output-last-message` is not an image output option.

## GitVane POD workflow

Apply these constraints only to `producer-pod/`:

1. Resolve the absolute external `POD_ASSETS_DIR` from the process environment or through the existing POD root `.env` loader. Never dump `.env` or secrets. Generated artwork and exact prompts stay outside Git.
2. Read `.agents/skills/pod-style-<id>/SKILL.md`. Preserve slogan, topic and portfolio collection. Use 1:1 or 5:6; one master per image, not per product. Preserve exact registered wording.
3. Use Studio's existing immutable job IDs when supplied. Otherwise save a full exact prompt externally and prepare one job per composition, from the repository root:

```powershell
pnpm --dir producer-pod pod job prepare <slug> --prompt-file <absolute-prompt-path> --provider builtin --variant <composition-name> --ratio 5:6
pnpm --dir producer-pod pod job start <job-id>
```

4. Read the returned saved prompt and attempt ID. Generate only after successfully starting a prepared attempt. Use that prompt verbatim. If start returns `completed`, reuse the stored result without generating. If it reports `running`, `unknown` or `failed` on a repeated start, stop and resolve/retry explicitly.
5. Import the file path returned by ImageGen into that attempt:

```powershell
pnpm --dir producer-pod pod import-image <slug> --file <returned-image-path> --attempt <started-attempt-id>
```

6. Verify completed records, file hashes, dimensions and `.prompt.txt` sidecars. Refresh Studio for new variants; preserve the user's selection. A visual rejection does not make a successful technical generation failed.

If the tool fails after start, record a known failure using `pod job resolve <attempt-id> --status failed --notes <reason>`; use `unknown` when the outcome is uncertain. Never automatically retry. If an image was obtained but import failed, retain the file and attempt ID; recover interrupted local saves without regenerating.

A changed style/composition creates new jobs. Repeating an identical completed/failed job requires `pod job retry <job-id> --reason <reason>`. Edits/upscales are derived imports using `--parent-attempt`; inspect current import options. Process multiple job IDs sequentially, one call per job, and stop/report remaining IDs on ambiguous failure. Do not start concurrent calls for the same attempt.

## Launch Studio's prepared task on Windows

Save the copied Studio task as UTF-8 externally. It already contains job IDs and import instructions. Specify **built-in ImageGen**, not simply "CLI generation".

```powershell
# Run from GitVane's root; export the absolute external POD_ASSETS_DIR first.
$podRepoDir = (Get-Location).Path
if (-not $env:POD_ASSETS_DIR -or -not [IO.Path]::IsPathRooted($env:POD_ASSETS_DIR)) {
  throw 'Set POD_ASSETS_DIR to the absolute external assets directory.'
}
$podAssetsPath = [IO.Path]::GetFullPath($env:POD_ASSETS_DIR).TrimEnd([char[]]'\/')
$podRepoPath = [IO.Path]::GetFullPath($podRepoDir).TrimEnd([char[]]'\/')
if ($podAssetsPath -eq $podRepoPath -or $podAssetsPath.StartsWith($podRepoPath + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'POD_ASSETS_DIR must be outside the repository.'
}
$podRunDir = Join-Path $env:POD_ASSETS_DIR 'codex-runs'
New-Item -ItemType Directory -Path $podRunDir -Force | Out-Null
# User/Studio handoff writes this task file before launch.
$podTaskFile = Join-Path $podRunDir 'generation-task.txt'
$podRunId = [guid]::NewGuid().ToString()
$podFinalFile = Join-Path $podRunDir "$podRunId.final.txt"
$podEventsFile = Join-Path $podRunDir "$podRunId.events.jsonl"
$OutputEncoding = [Text.UTF8Encoding]::new($false)
Get-Content -LiteralPath $podTaskFile -Raw -Encoding utf8 -ErrorAction Stop |
  codex -a never exec -C $podRepoDir -s workspace-write --add-dir $env:POD_ASSETS_DIR --json -o $podFinalFile - |
  Set-Content -LiteralPath $podEventsFile -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw 'Codex failed; inspect the attempt before retrying.' }
```

POD commands load root `.env`; it is not automatically exported to the parent PowerShell process. Set only the needed `POD_ASSETS_DIR` before this example. `--add-dir` allows shell writes externally but does not establish image-tool access. If a returned source path is inaccessible, report the access problem rather than silently relaxing permissions.

After launch inspect `pod jobs --slug <slug>` and verify imported files. Process exit success alone is insufficient. Report generation method, job/attempt IDs, final image/prompt paths and remaining failures. This reference documents launch instructions; it does not implement a Studio button or background runner.

Sources: [official ImageGen skill](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/imagegen/SKILL.md), [non-interactive execution](https://developers.openai.com/codex/noninteractive/), repository `producer-pod/docs/generation-registry.md` and `producer-pod/docs/local-studio.md`.
