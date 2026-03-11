# Headless Mode & Scripting Reference

## How Headless Mode is Triggered

- Passing a prompt via `-p` or `--prompt` flag
- Running in a non-TTY environment (pipes, CI, cron)
- Stdin piped input

## Output Formats

| Flag | Behavior |
|---|---|
| *(default)* | Raw text to stdout, ANSI codes stripped in non-TTY |
| `--output-format json` | Single JSON object after all turns complete |
| `--output-format stream-json` | Newline-delimited JSON (JSONL) events in real-time |

## JSON Output Schema

```json
{
  "response": "The final text response",
  "stats": {
    "models": {
      "gemini-2.5-pro": {
        "api": {
          "totalRequests": 2,
          "totalErrors": 0,
          "totalLatencyMs": 5053
        },
        "tokens": {
          "prompt": 24939,
          "candidates": 20,
          "total": 25113,
          "cached": 21263,
          "thoughts": 154,
          "tool": 0
        }
      }
    },
    "tools": {
      "totalCalls": 1,
      "totalSuccess": 1,
      "totalFail": 0,
      "totalDurationMs": 1881,
      "byName": {
        "google_web_search": { "count": 1, "success": 1, "fail": 0 }
      }
    },
    "files": {
      "totalLinesAdded": 5,
      "totalLinesRemoved": 2
    }
  }
}
```

## Exit Codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | General error |
| 42 | Input error (invalid arguments, missing config) |
| 53 | Turn limit exceeded |

## Session Management in Headless Mode

```bash
# Sessions are auto-saved to ~/.gemini/sessions/<project_hash>/<session_id>.jsonl

# Resume a previous session
gemini -p "Continue from where we left off" --resume <session_id>
```

## Input Sources (merged in order)

1. Stdin pipe
2. `-p` prompt argument

## Bash Scripting Patterns

### Pattern 1: Simple text response
```bash
gemini -p "Summarize @./README.md" > summary.txt
```

### Pattern 2: JSON response with jq extraction
```bash
RESPONSE=$(gemini -p "Generate a changelog entry" --output-format json | jq -r '.response')
echo "$RESPONSE" >> CHANGELOG.md
```

### Pattern 3: Conditional on token usage
```bash
RESULT=$(gemini -p "Review @./src/main.py" --output-format json)
TOKENS=$(echo "$RESULT" | jq '.stats.models."gemini-2.5-pro".tokens.total')
echo "Used $TOKENS tokens"
echo "$RESULT" | jq -r '.response'
```

### Pattern 4: Pipe chain
```bash
git log --oneline -20 | gemini -p "Summarize the recent development activity"
```

### Pattern 5: Auto-accept all tool actions (auto-approve)
```bash
# For CI pipelines where no human is present
gemini -p "Fix lint errors in @./src/ and save changes" --auto-approve --output-format json
```

### Pattern 6: Batch processing multiple files
```bash
#!/bin/bash
for py_file in $(find src -name "*.py"); do
  echo "Processing: $py_file"
  gemini -p "Add type hints to @$py_file and save" --auto-approve
done
```

### Pattern 7: Structured data extraction
```bash
# Get structured JSON from model
gemini --output-format json \
  "Return a raw JSON object with keys 'version' and 'deps' from @package.json" \
  | jq -r '.response' > data.json
```

### Pattern 8: Git commit automation
```bash
#!/bin/bash
DIFF=$(git diff --cached)
if [ -z "$DIFF" ]; then
  echo "Nothing staged"
  exit 1
fi

MSG=$(echo "$DIFF" | gemini -p "Write a concise conventional commit message (max 72 chars)" --output-format json | jq -r '.response')
echo "Committing: $MSG"
git commit -m "$MSG"
```

## PowerShell Patterns (Windows)

```powershell
# Batch process Python files to Markdown docs
Get-ChildItem -Recurse -Filter "*.py" | ForEach-Object {
  $newName = $_.FullName -replace '\.py$', '.md'
  gemini "Generate Markdown documentation for @$($_.FullName). Print to stdout." | Out-File -FilePath $newName -Encoding utf8
}

# JSON response
$output = gemini --output-format json "Return raw JSON with 'version' and 'deps' from @package.json" | ConvertFrom-Json
$output.response > data.json
```

## GitHub Actions Integration

```yaml
- name: AI Code Review
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: |
    REVIEW=$(git diff origin/main...HEAD | gemini -p "Review these changes for bugs and issues" --output-format json | jq -r '.response')
    echo "$REVIEW" >> $GITHUB_STEP_SUMMARY
```

## Known Limitations

- Custom slash commands (`.toml`) currently do NOT work in headless/non-interactive mode (open issue). Workaround: embed the full prompt text directly in your script.
- Extensions also unavailable in headless mode currently.