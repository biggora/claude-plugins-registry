# Image, music, speech, and video workflows

Verified against freshly fetched official Google documentation on 2026-11-07.
Read only the section needed for the task. Examples use the Google Gen AI Python
SDK (`google-genai`), not the retired `google-generativeai` SDK.

## Choose access before generating

For Antigravity images, use its built-in image workflow when available. For
Gemini API media, use an existing authorized `GEMINI_API_KEY` and API project.
Antigravity OAuth/Google AI subscriptions do not establish API billing. Check
[current prices](https://ai.google.dev/gemini-api/docs/pricing) and account/model
access before a new paid route; do not silently switch to a billed API if the
requested CLI route fails. Do not create or expose credentials.

For SDK examples, use the task's Python environment; install/update
`google-genai` there only if needed. `genai.Client()` reads an existing environment
key. If Interactions API helpers are missing, check SDK version and current docs
rather than inventing a REST equivalent. Examples below are single generation
requests: choose an unused output path, run only the requested mode, and do not
rerun merely to improve aesthetics without a remaining iteration budget.

## Images through Antigravity

Live-tested on 2026-11-07 with `agy 1.5.3`: an existing Google account sign-in
successfully generated a food thumbnail without a separate API key. The built-in
`image-generator` subagent saved an actual JPEG artifact. Invoke it with a
natural-language task; do not select an image API ID as `--model`.

For this account-based route, inspect only `modelProvider` in
`~/.gemini/antigravity-cli/settings.json`; the successful test had no provider
override. If it is `gemini`, the CLI is configured for API-key mode: report the
conflict rather than silently changing global settings or using that key.
Keep the existing account session; no new login or API key is needed when it
already works. Do not describe this as unlimited or guaranteed free access.

Run the following in a task-local child PowerShell process, so removing API-key
variables affects only that process and its children, not the parent shell or
persisted user environment. Never print secret values.

```powershell
$settingsPath = Join-Path $env:USERPROFILE '.gemini/antigravity-cli/settings.json'
if (Test-Path -LiteralPath $settingsPath) {
  $provider = (Get-Content -Raw -LiteralPath $settingsPath | ConvertFrom-Json).modelProvider
  if ($provider -eq 'gemini') { throw 'API-key mode is configured; account mode is required for this task.' }
}
Remove-Item Env:\GEMINI_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:\GOOGLE_API_KEY -ErrorAction SilentlyContinue
$promptText = @'
Generate one photorealistic food photograph for a cooking-video thumbnail:
golden roast chicken with baby potatoes and rosemary in a dark ceramic dish,
warm daylight, close three-quarter overhead view, landscape 16:9, no text.
Use ONLY Antigravity's built-in image generator and the existing signed-in
Google account. Save the actual image artifact and return its absolute local
path. Do not use a separate API key, external generation API, or another provider.
Do not modify project code or settings. On a denied tool, authentication failure,
or unavailable image generator, report the cause and stop. Produce one final image.
'@
$raw = agy -p $promptText --model gemini-3.8-flash-medium --output-format json --print-timeout 5m
if ($LASTEXITCODE -ne 0) { throw 'Antigravity process failed; inspect stderr.' }
$result = ($raw -join "`n") | ConvertFrom-Json
if ($result.status -ne 'SUCCESS') { throw "Antigravity status: $($result.status)" }
$result.response
```

The reasoning slug above worked in the test; reselect from `agy models` if it
becomes unavailable. Read stderr as well as the JSON envelope. The returned path
was under `~/.gemini/antigravity-cli/brain/<conversation_id>/`; use the actual
returned path instead of constructing one. Verify the file, inspect the image,
and copy it into the requested output directory when a workspace copy is needed.

For edits, identify the actual source file and requested changes in the prompt.
Native tool behavior can include internal attempts; do not promise an exact
number of underlying model calls. If unavailable, report that limitation before
changing access routes. Respect the host's image-editing tool requirements.

### Check actual image dimensions

Set `$imagePath` to the returned local image path, then inspect the file's
decoded dimensions. For example, with the installed `ffprobe`:

```powershell
$imageFile = Get-Item -LiteralPath $imagePath -ErrorAction Stop
if ($imageFile.Length -le 0) { throw 'Image artifact is empty.' }
$probeRaw = ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height -of json $imageFile.FullName
if ($LASTEXITCODE -ne 0) { throw 'Could not inspect image dimensions.' }
$stream = (($probeRaw -join "`n") | ConvertFrom-Json).streams[0]
if ($null -eq $stream -or $stream.width -le 0 -or $stream.height -le 0) {
  throw 'No valid image dimensions found.'
}
[pscustomobject]@{
  path = $imageFile.FullName
  codec = $stream.codec_name
  width = $stream.width
  height = $stream.height
  exact16by9 = ([long]$stream.width * 9 -eq [long]$stream.height * 16)
}
```

An image metadata reader such as Pillow or ImageMagick is an alternative if
`ffprobe` is unavailable. Do not infer dimensions from the prompt, filename,
Markdown artifact, or CLI prose. The live test's response claimed 16:9, but the
file was **1376×768**, which is only approximately 16:9 (`1376*9 != 768*16`).
Report actual width and height and compare them with any requested exact size
or aspect ratio. If exact dimensions are required, disclose the mismatch and
make an authorized resize/crop as a separate output, preserving the original;
otherwise report the native size without claiming exact compliance. View the
image as well: metadata cannot verify the dish, composition, or absence of text.

Sources: [CLI release notes](https://antigravity.google/docs/changelog?tab=cli),
[model/tool distinction](https://antigravity.google/docs/models/).

## Images through Gemini API

Nano Banana 2.1 (`gemini-nano-banana-2.1`) supports image creation, conversational
editing, reference-image fusion, and image/text output. Nano Banana Pro
(`gemini-3-pro-image`) is another option for complex asset production. Check the
current model card for size, aspect ratio, grounding, and reference limits.

```python
import base64
from pathlib import Path
from google import genai

client = genai.Client()
result = client.interactions.create(
    model="gemini-nano-banana-2.1",
    input="An overhead photo of roasted vegetables, warm daylight, no text.",
)
image = result.output_image
if image is None:
    raise RuntimeError("No image returned; inspect the response before retrying")
if image.mime_type != "image/png":
    raise RuntimeError(f"Choose an output extension for {image.mime_type}")
Path("vegetables.png").write_bytes(base64.b64decode(image.data))
```

For an edit, replace `input` with text and the actual reference image:

```python
reference = Path("source.png")
edit_input = [
    {"type": "text", "text": "Change the background to a wooden table."},
    {"type": "image", "mime_type": "image/png",
     "data": base64.b64encode(reference.read_bytes()).decode("ascii")},
]
```

Use `input=edit_input` in the request above; match MIME to the source file.
For multi-turn editing, preserve the interaction ID and use the documented
`previous_interaction_id` continuation instead of losing prior visual context.

Sources: [image generation](https://ai.google.dev/gemini-api/docs/image-generation),
[Nano Banana 2.1](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1).

## Music and songs

Lyria is a separate music-model family available through Gemini API. Use
`lyria-3-clip-preview` for 30-second drafts/loops or `lyria-3.5` for longer songs.
Specify duration, instruments, mood, tempo, and whether vocals are wanted.
For cooking-video background music, explicitly request instrumental-only audio.

```python
import base64
from pathlib import Path
from google import genai

client = genai.Client()
result = client.interactions.create(
    model="lyria-3-clip-preview",
    input="30-second warm acoustic cooking background, 90 BPM, instrumental only.",
)
audio = result.output_audio
if audio is None:
    raise RuntimeError("No music returned; inspect the response before retrying")
Path("cooking-music.mp3").write_bytes(base64.b64decode(audio.data))
if result.output_text:
    Path("cooking-music-lyrics.txt").write_text(result.output_text, encoding="utf-8")
```

The documented song output is MP3; confirm the returned MIME type before saving
if selecting another endpoint. Lyria 3.5 generation is single-turn, so do not
promise conversational editing of an existing track. For real-time instrumental
steering, use `lyria-realtime-exp` and the separate WebSocket workflow in the
[Lyria RealTime guide](https://ai.google.dev/gemini-api/docs/music-generation-realtime).
A general Gemini model can write lyrics or prompts; that is not audio generation.

Source: [music generation](https://ai.google.dev/gemini-api/docs/music-generation).

## Narration and dialogue

Use Gemini TTS for spoken scripts, not Lyria. Current models include
`gemini-3.8-flash-tts` and the more efficient `gemini-3.8-flash-lite-tts`.
In this generation of TTS, `text` is the verbatim script; put delivery directions
in `speech_metadata.style` rather than accidentally speaking them aloud.

```python
import base64
from pathlib import Path
from google import genai

client = genai.Client()
result = client.interactions.create(
    model="gemini-3.8-flash-tts",
    input=[{"type": "user_input", "content": [{
        "type": "text", "text": "Today we are roasting seasonal vegetables.",
        "annotations": [{"type": "speech_metadata", "style": "warm and clear"}],
    }]}],
    response_format={"type": "audio"},
    generation_config={"speech_config": [{"voice": "Kore"}]},
)
audio = result.output_audio
if audio is None:
    raise RuntimeError("No narration returned; inspect the response before retrying")
Path("narration.wav").write_bytes(base64.b64decode(audio.data))
```

Unary 3.8 TTS defaults to WAV with a RIFF header; save it directly. Streaming
uses raw PCM by default, so do not treat those chunks as complete WAV files.
For multi-speaker scripts, use speaker annotations and the documented speaker
mapping. Voice design and authorized voice replication are separate optional
workflows; use their current guides when requested. Terminal `/voice` and Live
API conversations are different from exported narration.

Source: [speech generation](https://ai.google.dev/gemini-api/docs/speech-generation).

## Video generation and editing

Current Gemini API docs recommend Omni 1.2 (`gemini-omni-1.2-flash`) for short
videos with native audio, reference images, and conversational editing/extension.
They state that Gemini API Veo 3.1 preview endpoints shut down on 2026-10-22;
do not copy older `veo-3.1-*-generate-preview` examples into a new API workflow.

```python
import base64
from pathlib import Path
from google import genai

client = genai.Client()
result = client.interactions.create(
    model="gemini-omni-1.2-flash",
    input="A smooth close-up shot of vegetables roasting in an oven, no dialogue.",
    response_format={"type": "video", "aspect_ratio": "16:9"},
)
video = result.output_video
if video is None:
    raise RuntimeError("No video returned; inspect the response before retrying")
Path("roasting.mp4").write_bytes(base64.b64decode(video.data))
```

For edits or extensions, use the current guide's media inputs and conversation
continuation; preserve IDs and input references. Do not promise long-form video
from a short-clip endpoint or silently substitute an enterprise Veo service.

Sources: [video routing/lifecycle](https://ai.google.dev/gemini-api/docs/video),
[Omni generation and editing](https://ai.google.dev/gemini-api/docs/omni).

## Verify and return the actual artifact

Check the file exists and is nonempty, then inspect it using an available image
viewer or audio/video playback/probe. Confirm type, requested dimensions or
aspect ratio, duration where applicable, and the visible/audible requirements.
For images, follow the actual-dimensions check above; `ffprobe` can also inspect
exported audio/video when installed. Do not
claim perceptual quality from file existence alone. Return absolute artifact
paths and disclose checks that could not be performed. Keep blocked/empty output
separate from successful generation; never save an error response as media.
