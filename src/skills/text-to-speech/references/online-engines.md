# Online TTS Engines Reference

Use when internet access is available. Superior quality to offline engines.

## Priority Order

1. **OpenAI TTS** — best quality, via Anthropic API artifacts
2. **edge-tts** (Microsoft Azure) — free, neural quality, 100+ voices
3. **gTTS** (Google) — free, good quality, 40+ languages

---

## edge-tts (Microsoft Neural TTS — FREE)

Best free online option. 400+ voices, 100+ languages, neural quality.

```bash
pip install edge-tts --break-system-packages
```

```python
import asyncio
import edge_tts

async def edge_tts_generate(text: str, output_mp3: str, voice: str = "en-US-AriaNeural"):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_mp3)
    return output_mp3

# Sync wrapper
def tts(text: str, output_mp3: str, voice: str = "en-US-AriaNeural"):
    asyncio.run(edge_tts_generate(text, output_mp3, voice))

# List voices
async def list_voices():
    voices = await edge_tts.list_voices()
    for v in voices:
        print(v['ShortName'], v['Locale'], v['Gender'])
```

### Recommended Voices

```python
EDGE_VOICES = {
    'en-us-f': 'en-US-AriaNeural',      # US English, female, natural
    'en-us-m': 'en-US-GuyNeural',       # US English, male
    'en-gb-f': 'en-GB-SoniaNeural',     # UK English, female
    'ru-f':    'ru-RU-SvetlanaNeural',  # Russian, female
    'ru-m':    'ru-RU-DmitryNeural',    # Russian, male
    'de-f':    'de-DE-KatjaNeural',     # German
    'fr-f':    'fr-FR-DeniseNeural',    # French
    'es-f':    'es-ES-ElviraNeural',    # Spanish
    'zh-f':    'zh-CN-XiaoxiaoNeural',  # Chinese
    'ja-f':    'ja-JP-NanamiNeural',    # Japanese
    'ar-f':    'ar-EG-SalmaNeural',     # Arabic
    'hi-f':    'hi-IN-SwaraNeural',     # Hindi
    'ko-f':    'ko-KR-SunHiNeural',     # Korean
    'pt-f':    'pt-BR-FranciscaNeural', # Portuguese
    'it-f':    'it-IT-ElsaNeural',      # Italian
    'nl-f':    'nl-NL-ColetteNeural',   # Dutch
    'pl-f':    'pl-PL-AgnieszkaNeural', # Polish
}
```

---

## gTTS (Google Text-to-Speech — FREE)

```bash
pip install gtts --break-system-packages
```

```python
from gtts import gTTS
import subprocess

def gtts_generate(text: str, output_mp3: str, lang: str = 'en', slow: bool = False):
    tts = gTTS(text=text, lang=lang, slow=slow)
    tts.save(output_mp3)
    return output_mp3

# Language codes: 'en', 'ru', 'de', 'fr', 'es', 'zh-CN', 'ja', 'ko', 'ar', 'hi', etc.
```

---

## OpenAI TTS (via API — best quality)

Use when building Claude-powered artifacts. Call from JavaScript in artifacts:

```javascript
// In artifact — OpenAI TTS via fetch
const response = await fetch("https://api.openai.com/v1/audio/speech", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "tts-1-hd",  // or "tts-1" for faster/cheaper
    input: "Your text here",
    voice: "alloy",     // alloy, echo, fable, onyx, nova, shimmer
    response_format: "mp3"
  })
});
const audioBlob = await response.blob();
const url = URL.createObjectURL(audioBlob);
// play or download
```

### OpenAI Voice Options
- `alloy` — neutral, versatile
- `echo` — male, calm
- `fable` — British male, expressive
- `onyx` — deep male
- `nova` — female, warm
- `shimmer` — female, clear

---

## Choosing Between Engines

```
Need best quality? → OpenAI TTS (if API key available)
Free + neural quality? → edge-tts (Microsoft Neural)
Simple + multilingual? → gTTS
No internet? → Kokoro ONNX (if models available) or pyttsx3
```