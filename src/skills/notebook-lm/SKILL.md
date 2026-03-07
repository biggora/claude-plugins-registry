---
name: notebooklm
description: |
  Automate Google NotebookLM via the notebooklm-py Python library. Use this skill whenever the user wants to:
  - Create, manage, or delete NotebookLM notebooks
  - Add sources (URLs, YouTube, PDFs, files, text, Google Drive) to a notebook
  - Ask questions / chat with notebook content
  - Generate content: Audio Overview (podcast), Video Overview, Quiz, Flashcards, Slide Deck, Infographic, Report, Data Table, Mind Map
  - Download generated artifacts (MP3, MP4, PDF, PNG, CSV, JSON, Markdown)
  - Run web/Drive research and auto-import results
  - Manage sharing, notes, and source full-text extraction
  - Automate any NotebookLM workflow programmatically

  Trigger this skill for ANY request involving NotebookLM, notebooklm-py, Google NotebookLM automation, podcast/audio overview generation from notes, or bulk research pipelines.
---

# NotebookLM Skill

Provides full programmatic access to Google NotebookLM via the unofficial `notebooklm-py` library. Supports Python API and CLI — use the Python API for complex or multi-step workflows, CLI for quick one-off tasks.

## Prerequisites

```bash
pip install "notebooklm-py[browser]"
playwright install chromium

# First-time auth (opens browser)
notebooklm login
```

**Auth via env variable (CI/CD, no browser):**
```bash
export NOTEBOOKLM_AUTH_JSON='{"cookies": [...]}'
```

Read `references/auth.md` for detailed authentication setup.

## Quick Start Pattern

```python
import asyncio
from notebooklm import NotebookLMClient

async def main():
    async with await NotebookLMClient.from_storage() as client:
        nb = await client.notebooks.create("My Research")
        await client.sources.add_url(nb.id, "https://example.com/article", wait=True)
        result = await client.chat.ask(nb.id, "Summarize the main points")
        print(result.answer)

asyncio.run(main())
```

## API Reference Summary

### Client Structure
```
NotebookLMClient
├── .notebooks   → NotebooksAPI
├── .sources     → SourcesAPI
├── .artifacts   → ArtifactsAPI
├── .chat        → ChatAPI
├── .research    → ResearchAPI
├── .notes       → NotesAPI
└── .sharing     → SharingAPI
```

### Notebooks (`client.notebooks`)
| Method | Description |
|--------|-------------|
| `list()` | List all notebooks |
| `create(title)` | Create new notebook → `Notebook` |
| `get(notebook_id)` | Get notebook details |
| `delete(notebook_id)` | Delete notebook |
| `rename(notebook_id, new_title)` | Rename notebook |
| `get_description(notebook_id)` | Get AI summary + suggested topics |

### Sources (`client.sources`)
| Method | Description |
|--------|-------------|
| `add_url(nb_id, url, wait=True)` | Add URL/YouTube source |
| `add_file(nb_id, path, wait=True)` | Add local file (PDF, txt, md, docx, etc.) |
| `add_text(nb_id, text, title, wait=True)` | Add pasted text |
| `add_drive(nb_id, drive_id, title)` | Add Google Drive document |
| `list(nb_id)` | List all sources |
| `get(nb_id, source_id)` | Get source details |
| `fulltext(nb_id, source_id)` | Get indexed text content |
| `refresh(nb_id, source_id)` | Refresh URL source |
| `delete(nb_id, source_id)` | Delete source |

### Chat (`client.chat`)
| Method | Description |
|--------|-------------|
| `ask(nb_id, question, source_ids=None)` | Ask a question → `ChatResult` |
| `history(nb_id)` | Get conversation history |
| `configure(nb_id, mode=None, persona=None)` | Set chat mode/persona |

### Artifacts — Generate (`client.artifacts`)

All generate methods return a `GenerationStatus` with `task_id`. Use `wait_for_completion()` to poll until done.

| Method | Key Options | Download Method |
|--------|-------------|-----------------|
| `generate_audio(nb_id, instructions, format, length, language)` | format: `deep-dive/brief/critique/debate`, length: `short/default/long` | `download_audio(nb_id, path)` |
| `generate_video(nb_id, instructions, format, style)` | style: `classic/whiteboard/kawaii/anime/watercolor/...` | `download_video(nb_id, path)` |
| `generate_quiz(nb_id, difficulty, quantity)` | difficulty: `easy/medium/hard` | `download_quiz(nb_id, path, output_format)` |
| `generate_flashcards(nb_id, difficulty, quantity)` | — | `download_flashcards(nb_id, path, output_format)` |
| `generate_slide_deck(nb_id, instructions, format)` | format: `detailed/presenter` | `download_slide_deck(nb_id, path)` — PDF or PPTX |
| `generate_infographic(nb_id, orientation, detail)` | orientation: `landscape/portrait/square` | `download_infographic(nb_id, path)` |
| `generate_report(nb_id, format, instructions)` | format: `briefing-doc/study-guide/blog-post/custom` | `download_report(nb_id, path)` |
| `generate_data_table(nb_id, instructions)` | — | `download_data_table(nb_id, path)` |
| `generate_mind_map(nb_id)` | Sync, no wait needed | `download_mind_map(nb_id, path)` |

**Wait pattern:**
```python
status = await client.artifacts.generate_audio(nb_id, instructions="Focus on key facts")
final = await client.artifacts.wait_for_completion(nb_id, status.task_id, timeout=300)
if final.is_complete:
    await client.artifacts.download_audio(nb_id, "./podcast.mp3")
```

### Research (`client.research`)
```python
# Start web research
research = await client.research.start(nb_id, "quantum computing trends", source="web", mode="deep")
# Poll until complete
status = await client.research.poll(nb_id)
# Import discovered sources
await client.research.import_sources(nb_id, task_id, sources[:10])
```

## CLI Quick Reference

```bash
# Session
notebooklm login
notebooklm use <notebook_id>
notebooklm status

# Notebooks
notebooklm list
notebooklm create "My Notebook"
notebooklm delete <id>
notebooklm rename "New Title"

# Sources
notebooklm source add "https://example.com"
notebooklm source add ./paper.pdf
notebooklm source add-research "AI trends 2025" --mode deep --import-all
notebooklm source list

# Chat
notebooklm ask "What are the key themes?"

# Generate (--wait blocks until done)
notebooklm generate audio "make it engaging" --wait
notebooklm generate video --style whiteboard --wait
notebooklm generate quiz --difficulty hard --wait
notebooklm generate flashcards --quantity more --wait
notebooklm generate slide-deck --wait
notebooklm generate infographic --orientation portrait --wait
notebooklm generate report --format study-guide --wait
notebooklm generate mind-map

# Download
notebooklm download audio ./podcast.mp3
notebooklm download video ./overview.mp4
notebooklm download quiz --format json ./quiz.json
notebooklm download flashcards --format markdown ./cards.md
notebooklm download slide-deck ./slides.pdf
notebooklm download mind-map ./mindmap.json
notebooklm download data-table ./data.csv
```

## Common Workflows

### Research → Podcast
See `references/workflows.md` for the full pattern.

### Bulk Source Import
```python
urls = ["https://...", "https://...", ...]
for url in urls:
    await client.sources.add_url(nb_id, url, wait=False)
    await asyncio.sleep(1)  # Rate limiting
```

### Quiz Generation + JSON Export
```python
status = await client.artifacts.generate_quiz(nb_id, difficulty="hard")
final = await client.artifacts.wait_for_completion(nb_id, status.task_id)
await client.artifacts.download_quiz(nb_id, "quiz.json", output_format="json")
```

## Error Handling

```python
from notebooklm import RPCError

try:
    result = await client.notebooks.create("Test")
except RPCError as e:
    # Session expired → re-run `notebooklm login`
    # Rate limited → wait and retry
    print(f"Error: {e}")
```

**Common issues:**
- `RPCError` auth failure → re-run `notebooklm login` or call `await client.refresh_auth()`
- Rate limits → add `await asyncio.sleep(2)` between bulk operations
- Source not ready → use `wait=True` in `add_url()` / `add_file()`

## Reference Files

- `references/auth.md` — Detailed auth setup, CI/CD, environment variables
- `references/workflows.md` — Complete workflow examples (research→podcast, bulk import, etc.)
- `references/artifact-options.md` — All generation options, formats, and styles