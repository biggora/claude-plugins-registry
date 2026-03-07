# Artifact Generation Options

## Audio Overview (Podcast)

```python
await client.artifacts.generate_audio(
    nb_id,
    instructions="Focus on practical applications",  # optional
    format="deep-dive",    # deep-dive | brief | critique | debate
    length="default",      # short | default | long
    language="en",         # ISO language code
    source_ids=None,       # list of source IDs to limit scope
)
```

CLI: `notebooklm generate audio "instructions" --format deep-dive --length long --wait`

Download: MP3 or MP4

## Video Overview

```python
await client.artifacts.generate_video(
    nb_id,
    instructions="Explainer for beginners",
    format="explainer",    # explainer | brief
    style="whiteboard",    # auto | classic | whiteboard | kawaii | anime | watercolor | retro-print | heritage | paper-craft
    language="en",
)
```

CLI: `notebooklm generate video --style kawaii --format brief --wait`

Download: MP4

## Slide Deck

```python
await client.artifacts.generate_slide_deck(
    nb_id,
    instructions="Focus on key metrics",
    format="detailed",     # detailed | presenter
    length="default",      # default | short
)
```

CLI: `notebooklm generate slide-deck --format presenter --wait`

Download: PDF or PPTX (PPTX not available in web UI!)

## Quiz

```python
await client.artifacts.generate_quiz(
    nb_id,
    difficulty="medium",   # easy | medium | hard
    quantity="standard",   # fewer | standard | more
)
```

CLI: `notebooklm generate quiz --difficulty hard --quantity more --wait`

Download: `output_format` → `json` | `markdown` | `html`

## Flashcards

```python
await client.artifacts.generate_flashcards(
    nb_id,
    difficulty="medium",
    quantity="standard",
)
```

CLI: `notebooklm generate flashcards --quantity more --wait`

Download: `output_format` → `json` | `markdown` | `html`

## Infographic

```python
await client.artifacts.generate_infographic(
    nb_id,
    instructions="Highlight statistics",
    orientation="portrait",  # landscape | portrait | square
    detail="standard",       # concise | standard | detailed
)
```

CLI: `notebooklm generate infographic --orientation portrait --detail detailed --wait`

Download: PNG

## Report

```python
await client.artifacts.generate_report(
    nb_id,
    format="study-guide",   # briefing-doc | study-guide | blog-post | custom
    instructions="Include key examples",  # extra instructions appended to template
)
```

CLI: `notebooklm generate report --format blog-post --append "target audience: beginners" --wait`

Download: Markdown

## Data Table

```python
await client.artifacts.generate_data_table(
    nb_id,
    instructions="Compare pricing, features, and limitations of each tool",
)
```

CLI: `notebooklm generate data-table "compare main concepts" --wait`

Download: CSV

## Mind Map

```python
# Synchronous — returns immediately, no wait needed
result = await client.artifacts.generate_mind_map(nb_id)
await client.artifacts.download_mind_map(nb_id, "mindmap.json")
```

CLI: `notebooklm generate mind-map`

Download: JSON (hierarchical structure)

## Revise Individual Slide

```python
# Requires existing slide deck artifact ID
await client.artifacts.revise_slide(
    nb_id,
    artifact_id="art_xxx",
    slide_index=0,           # 0-based
    instructions="Move title to top, add bullet points",
)
```

CLI: `notebooklm generate revise-slide "revise instructions" --artifact <id> --slide 0 --wait`

## Artifact Management

```python
# List all artifacts
artifacts = await client.artifacts.list(nb_id)
artifacts = await client.artifacts.list(nb_id, artifact_type="audio")

# Get specific artifact
artifact = await client.artifacts.get(nb_id, artifact_id)

# Rename
await client.artifacts.rename(nb_id, artifact_id, "New Name")

# Delete
await client.artifacts.delete(nb_id, artifact_id)

# Export to Google Docs/Sheets
await client.artifacts.export(nb_id, artifact_id, export_type="docs", title="My Export")

# Get AI suggestions
suggestions = await client.artifacts.suggestions(nb_id)
```