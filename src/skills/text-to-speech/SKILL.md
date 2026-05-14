---
name: text-to-speech
description: "Converts any text to speech audio files fully autonomously, without user intervention. Use this skill whenever a user asks to: \"convert text to speech\", \"generate audio narration\", \"create a voiceover\", \"make a TTS audio file\", \"add narration to a video\", \"generate MP3/WAV from text\", \"create audio for a presentation\", or anything involving producing spoken audio from written text. Also trigger when user needs audio narration for product videos, demos, slideshows, or automated workflows. Always use this skill before generating any video narration, even if narration seems like a minor part of the task."
---

# Text-to-Speech (TTS) Skill

Fully autonomous audio generation pipeline. No user intervention required.

## What this skill produces

- **MP3 / WAV audio files** from any text input
- **Multilingual narration** (131+ languages via espeak-ng)
- **Video-ready voiceovers** for product demos and presentations
- **Batch narration** for automated workflows

---

## Engine Selection Guide

### Confirmed Working Engines (ordered by quality)

| Engine | Quality | Speed | Languages | Notes |
|---|---|---|---|---|
| **pyttsx3 + espeak-ng** | ★★★☆ | Fast | 131+ | **PRIMARY — always available** |
| **espeak-ng CLI** | ★★★☆ | Fast | 131+ | Direct CLI, same backend |
| **flite** | ★★☆☆ | Very fast | EN only | Lightweight fallback |
| **Kokoro ONNX** | ★★★★★ | Medium | EN, ZH, JA, KO, FR, ES, HI, PT, IT, BR | High-quality neural TTS — **use if model files available** |
| **gTTS** | ★★★★☆ | Fast | 40+ | Google Neural — needs internet |
| **edge-tts** | ★★★★★ | Fast | 100+ | Microsoft Neural — needs internet |

> ⚠️ **Environment constraint**: This agent has no internet access. Use pyttsx3/espeak-ng or Kokoro (offline). For production with internet access, prefer edge-tts or gTTS.

---

## Quick Start

### Standard Narration (always works)

```python
import pyttsx3
import subprocess

def generate_tts(text: str, output_mp3: str, lang: str = "en", rate: int = 145, voice_id: str = None):
    """Generate TTS audio. lang = 'en', 'ru', 'de', 'fr', 'es', 'zh', etc."""
    engine = pyttsx3.init()
    engine.setProperty('rate', rate)      # 100–200, 145 = natural
    engine.setProperty('volume', 1.0)
    
    # Select voice by language
    if voice_id:
        engine.setProperty('voice', voice_id)
    else:
        voices = engine.getProperty('voices')
        for v in voices:
            if lang == 'en' and 'en-gb' in v.id.lower():
                engine.setProperty('voice', v.id)
                break
            elif lang != 'en' and lang in v.id.lower() and 'lv' not in v.id:
                engine.setProperty('voice', v.id)
                break
    
    wav_path = output_mp3.replace('.mp3', '.wav')
    engine.save_to_file(text, wav_path)
    engine.runAndWait()
    
    # Convert WAV → MP3 with audio enhancement
    subprocess.run([
        'ffmpeg', '-i', wav_path,
        '-af', 'aresample=44100,equalizer=f=3000:t=o:w=1:g=3,equalizer=f=200:t=o:w=1:g=-2',
        '-c:a', 'libmp3lame', '-b:a', '192k',
        output_mp3, '-y', '-loglevel', 'quiet'
    ], check=True)
    
    return output_mp3

# Example usage
generate_tts("Welcome to our product demo.", "/tmp/narration.mp3", lang="en")
generate_tts("Добро пожаловать в демонстрацию продукта.", "/tmp/narration_ru.mp3", lang="ru")
```

---

## Installation (run once per session if needed)

```bash
pip install pyttsx3 --break-system-packages -q
apt-get install -y espeak-ng -q

# Verify
python3 -c "import pyttsx3; e=pyttsx3.init(); print('OK:', len(e.getProperty('voices')), 'voices')"
```

---

## Engine Details

Read the appropriate reference file for the engine you're using:

- **`references/pyttsx3-espeak.md`** — Primary engine: full API, voice selection, SSML-like control, quality tips
- **`references/espeak-cli.md`** — Direct espeak-ng CLI usage, flags, phoneme control
- **`references/kokoro-onnx.md`** — High-quality neural TTS (offline, needs model download)
- **`references/online-engines.md`** — gTTS, edge-tts, OpenAI TTS (when internet available)

---

## Multi-scene Narration (for videos)

For video narration with multiple scenes, generate per-scene audio then concatenate:

```python
import pyttsx3, subprocess, os

scenes = [
    {"text": "Welcome to our AI-powered platform.", "duration_hint": 3},
    {"text": "Our system automatically detects and fixes issues.", "duration_hint": 5},
    {"text": "Get started today with a free trial.", "duration_hint": 3},
]

def scenes_to_audio(scenes: list, output_path: str, lang: str = "en") -> str:
    """Generate concatenated narration from scene list."""
    wav_files = []
    engine = pyttsx3.init()
    engine.setProperty('rate', 145)
    
    for i, scene in enumerate(scenes):
        wav = f"/tmp/scene_{i}.wav"
        engine.save_to_file(scene["text"], wav)
        engine.runAndWait()
        wav_files.append(wav)
    
    # Build concat list for ffmpeg
    concat_txt = "/tmp/concat_list.txt"
    with open(concat_txt, 'w') as f:
        for wav in wav_files:
            f.write(f"file '{wav}'\n")
    
    subprocess.run([
        'ffmpeg', '-f', 'concat', '-safe', '0', '-i', concat_txt,
        '-c:a', 'libmp3lame', '-b:a', '192k',
        output_path, '-y', '-loglevel', 'quiet'
    ], check=True)
    
    return output_path

scenes_to_audio(scenes, "/tmp/full_narration.mp3")
```

---

## Language Reference (top languages)

| Code | Language | espeak-ng voice ID |
|------|----------|--------------------|
| `en` | English (GB) | `gmw/en-gb-scotland` |
| `en-us` | English (US) | `gmw/en-us` |
| `ru` | Russian | `zle/ru` |
| `de` | German | `gmw/de` |
| `fr` | French | `roa/fr` |
| `es` | Spanish | `roa/es` |
| `zh` | Chinese (Mandarin) | `sit/cmn` |
| `ar` | Arabic | `sem/ar` |
| `ja` | Japanese | `jpn/ja` |
| `pt` | Portuguese | `roa/pt` |

Full list: `espeak-ng --voices`

---

## FFmpeg Audio Post-processing

```bash
# WAV → MP3 (standard)
ffmpeg -i input.wav -c:a libmp3lame -b:a 192k output.mp3 -y

# WAV → MP3 with EQ enhancement (clearer speech)
ffmpeg -i input.wav \
  -af "aresample=44100,equalizer=f=3000:t=o:w=1:g=3,equalizer=f=200:t=o:w=1:g=-2" \
  -c:a libmp3lame -b:a 192k output.mp3 -y

# Adjust speech speed without pitch change (0.85 = slower, 1.15 = faster)
ffmpeg -i input.wav -af "atempo=0.90" output_slow.wav -y

# Add silence padding (0.5s before, 0.5s after)
ffmpeg -i input.wav -af "adelay=500|500,apad=pad_dur=0.5" output_padded.wav -y

# Normalize audio volume
ffmpeg -i input.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" output_norm.wav -y
```

---

## Common Pitfalls

| Problem | Solution |
|---|---|
| `pyttsx3` hangs / no audio | Run `apt-get install -y espeak-ng` first |
| Russian text sounds robotic | Use `rate=130`, `engine.setProperty('voice', 'zle/ru')` |
| Audio too quiet | Add `-af "volume=2.0"` in ffmpeg or set `engine.setProperty('volume', 1.0)` |
| gTTS / edge-tts timeout | No internet in this environment — use pyttsx3 |
| Kokoro needs model files | Download from HuggingFace when internet is available; see `references/kokoro-onnx.md` |
| Audio/video sync off in video | Use `ffprobe` to get exact audio duration; see screen-recording skill |
| Characters not spoken (symbols) | Pre-process text: strip `*`, `#`, `>`, `|` before passing to TTS |

---

## Text Pre-processing

Always clean text before TTS to avoid robotic artifacts:

```python
import re

def clean_for_tts(text: str) -> str:
    """Remove markdown and symbols that confuse TTS engines."""
    text = re.sub(r'#{1,6}\s*', '', text)        # headers
    text = re.sub(r'\*{1,2}(.+?)\*{1,2}', r'\1', text)  # bold/italic
    text = re.sub(r'`{1,3}[^`]*`{1,3}', '', text)        # code blocks
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)       # links → link text
    text = re.sub(r'[|>]', '', text)              # table/quote chars
    text = re.sub(r'\s+', ' ', text).strip()
    return text
```

---

## Integration with Screen Recording Skill

When used inside the screen-recording skill, replace the basic pyttsx3 call with this skill's `generate_tts()` function for better audio quality and language support. The audio pipeline is identical — just swap the TTS step.