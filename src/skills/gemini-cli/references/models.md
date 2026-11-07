# Models and multimodal input

Snapshot: 2026-11-07. Antigravity account access, Gemini Developer API access, and
Google Cloud access differ. Model lists and limits change.

## CLI reasoning

Run `agy models`. This account's `agy 1.5.2` returned:

- `gemini-3.8-flash-low`, `gemini-3.8-flash-medium`, `gemini-3.8-flash-high`.
- `gemini-4-argon-low`, `gemini-4-argon-medium`, `gemini-4-argon-high`.
- Partner-provider models too; use Gemini when Gemini is requested.

Use Flash for routine tasks and Argon for difficult reasoning when available.
Pin returned slugs with `--model`; do not guess suffixes from API IDs. The
built-in image generator has its own model; changing the reasoning model does
not select a media endpoint.

## Gemini API routing

| Need | API model examples | Distinction |
| --- | --- | --- |
| Reasoning, code, multimodal analysis | `gemini-4-argon`, `gemini-3.8-flash` | Understanding media does not imply generating it |
| Efficient text tasks | `gemini-3.5-flash-lite` | Check input/tool support |
| Image creation/editing | `gemini-nano-banana-2.1`, `gemini-3.1-flash-image`, `gemini-3-pro-image` | Nano Banana family |
| Video creation/editing with audio | `gemini-omni-1.2-flash` | Separate from video analysis |
| Songs/background music | `lyria-3.5`, `lyria-3-clip-preview` | Full songs vs short clips |
| Streaming instrumental music | `lyria-realtime-exp` | Experimental real-time workflow |
| Narration/dialogue | `gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts` | Speech differs from music |
| Live voice/video conversation | `gemini-3.8-live`, `gemini-3.8-live-extended-thinking` | Bidirectional sessions |
| Speech recognition/diarization | `gemini-3.5-transcribe`, `gemini-3.5-transcribe-live` | Speech-to-text with timing/speaker features |
| Multimodal semantic search | `gemini-embedding-2` | Embeddings, not generated prose |

Check [model cards](https://ai.google.dev/gemini-api/docs/models) and
[deprecations](https://ai.google.dev/gemini-api/docs/deprecations) before execution.
Freshly fetched docs can be newer than search snippets. On this verification
date they recommend Nano Banana 2.1 and Omni 1.2, and state that Gemini API Veo
3.1 preview endpoints shut down on 2026-10-22. Veo on Google's enterprise platform
has a different lifecycle; do not generalize the shutdown to every service.

## Analyze existing media

Antigravity supports media attachments. Use available interactive attachment
controls or explicit file paths and verify the agent actually read the media.
Persistent stream-json CLI input supports text blocks only. Never infer visual
or audio content from filenames or URLs alone.

For direct API analysis, select a compatible general Gemini model and use the
current guides for [images](https://ai.google.dev/gemini-api/docs/image-understanding),
[audio](https://ai.google.dev/gemini-api/docs/audio),
[video](https://ai.google.dev/gemini-api/docs/video-understanding), and
[PDFs](https://ai.google.dev/gemini-api/docs/document-processing). Choose inline
bytes or the Files API according to size/model constraints. YouTube URL input
is model/surface-specific; do not assume an `agy` prompt downloads the video.

For search grounding, structured extraction, tool calling, code execution, URL
context, or batch work, check model-specific support. API tools differ from
Antigravity terminal tools. Embedding, Live API, and transcription need their
own SDK methods rather than image/audio generation calls.

Sources: local `agy models`,
[Antigravity model selection](https://antigravity.google/docs/models/),
[Gemini API catalog](https://ai.google.dev/gemini-api/docs/models),
[video lifecycle](https://ai.google.dev/gemini-api/docs/video).
