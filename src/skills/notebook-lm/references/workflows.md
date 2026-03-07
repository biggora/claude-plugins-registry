# NotebookLM Workflow Examples

## 1. Complete Quickstart

```python
import asyncio
from notebooklm import NotebookLMClient

async def main():
    async with await NotebookLMClient.from_storage() as client:
        # Create notebook
        nb = await client.notebooks.create("Research")
        
        # Add sources
        await client.sources.add_url(nb.id, "https://example.com/article", wait=True)
        await client.sources.add_file(nb.id, "./paper.pdf", wait=True)
        
        # Chat
        result = await client.chat.ask(nb.id, "What are the key findings?")
        print(result.answer)
        
        # Generate podcast
        status = await client.artifacts.generate_audio(
            nb.id, instructions="Make it engaging and accessible"
        )
        final = await client.artifacts.wait_for_completion(nb.id, status.task_id, timeout=300)
        if final.is_complete:
            await client.artifacts.download_audio(nb.id, "./podcast.mp3")

asyncio.run(main())
```

## 2. Research → Podcast Pipeline

```python
import asyncio
from notebooklm import NotebookLMClient

async def research_to_podcast(topic: str, output_path: str = "./podcast.mp3"):
    async with await NotebookLMClient.from_storage() as client:
        # Create notebook
        nb = await client.notebooks.create(f"Research: {topic}")
        
        # Start deep research
        research = await client.research.start(nb.id, topic, source="web", mode="deep")
        task_id = research.get("task_id")
        
        # Wait for research
        for _ in range(30):
            status = await client.research.poll(nb.id)
            if status.get("status") == "completed":
                sources = status.get("sources", [])
                await client.research.import_sources(nb.id, task_id, sources[:10])
                break
            await asyncio.sleep(10)
        
        # Generate podcast
        gen = await client.artifacts.generate_audio(
            nb.id, instructions=f"Engaging overview of {topic}"
        )
        final = await client.artifacts.wait_for_completion(nb.id, gen.task_id, timeout=600)
        
        if final.is_complete:
            await client.artifacts.download_audio(nb.id, output_path)
            print(f"Saved to {output_path}")
        
        return nb.id  # Keep for reference

asyncio.run(research_to_podcast("AI trends 2025"))
```

## 3. Bulk URL Import

```python
async def bulk_import(nb_id: str, urls: list[str]):
    async with await NotebookLMClient.from_storage() as client:
        for i, url in enumerate(urls):
            print(f"Adding {i+1}/{len(urls)}: {url}")
            await client.sources.add_url(nb_id, url, wait=False)
            await asyncio.sleep(1)  # Avoid rate limits
        print("All sources submitted. Processing in background.")
```

## 4. Generate All Content Types

```python
async def generate_all(nb_id: str):
    async with await NotebookLMClient.from_storage() as client:
        tasks = [
            client.artifacts.generate_audio(nb_id, format="deep-dive"),
            client.artifacts.generate_quiz(nb_id, difficulty="medium"),
            client.artifacts.generate_flashcards(nb_id),
            client.artifacts.generate_slide_deck(nb_id, format="detailed"),
            client.artifacts.generate_mind_map(nb_id),  # Sync, returns immediately
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results
```

## 5. Quiz Export in Multiple Formats

```python
async def export_quiz(nb_id: str):
    async with await NotebookLMClient.from_storage() as client:
        status = await client.artifacts.generate_quiz(nb_id, difficulty="hard", quantity="more")
        final = await client.artifacts.wait_for_completion(nb_id, status.task_id)
        
        if final.is_complete:
            await client.artifacts.download_quiz(nb_id, "quiz.json", output_format="json")
            await client.artifacts.download_quiz(nb_id, "quiz.md", output_format="markdown")
            await client.artifacts.download_quiz(nb_id, "quiz.html", output_format="html")
```

## 6. Save Chat History as Notes

```python
async def save_session(nb_id: str, questions: list[str]):
    async with await NotebookLMClient.from_storage() as client:
        for q in questions:
            await client.chat.ask(nb_id, q)
        # Save entire session as a notebook note
        history = await client.chat.history(nb_id)
        await client.notes.create(nb_id, content=str(history), title="Research Session")
```

## 7. CLI One-Liner Workflows

```bash
# Quick research notebook + podcast
notebooklm create "AI Research" && \
notebooklm source add-research "artificial intelligence 2025" --mode deep --import-all && \
notebooklm generate audio "engaging overview" --wait && \
notebooklm download audio ./ai-research.mp3

# Generate study materials from PDF
notebooklm create "Study" && \
notebooklm source add ./textbook.pdf && \
notebooklm generate quiz --difficulty hard --wait && \
notebooklm generate flashcards --quantity more --wait && \
notebooklm generate slide-deck --wait && \
notebooklm download quiz --format json ./quiz.json && \
notebooklm download flashcards --format markdown ./cards.md && \
notebooklm download slide-deck ./slides.pdf
```