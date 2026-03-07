# Kokoro ONNX — High-Quality Neural TTS

Kokoro is a state-of-the-art offline neural TTS engine. Produces near-human quality audio.
Available in this environment (`kokoro-onnx` installed) but requires model files.

## Languages Supported

English (US/UK), Chinese, Japanese, Korean, French, Spanish, Hindi, Portuguese, Italian, Brazilian Portuguese

## Installation

```bash
pip install kokoro-onnx soundfile --break-system-packages
```

## Model Download (requires internet once)

```python
from huggingface_hub import hf_hub_download

# Download model files
model_path = hf_hub_download(repo_id="hexgrad/Kokoro-82M-ONNX", filename="kokoro-v1.0.onnx")
voices_path = hf_hub_download(repo_id="hexgrad/Kokoro-82M-ONNX", filename="voices-v1.0.bin")

print(f"Model: {model_path}")
print(f"Voices: {voices_path}")
```

Or manually download and place in `/tmp/kokoro/`:
- `kokoro-v1.0.onnx`
- `voices-v1.0.bin`

## Usage

```python
from kokoro_onnx import Kokoro
import soundfile as sf
import subprocess

def kokoro_tts(text: str, output_mp3: str, voice: str = 'af_heart', speed: float = 1.0,
               model_path: str = '/tmp/kokoro/kokoro-v1.0.onnx',
               voices_path: str = '/tmp/kokoro/voices-v1.0.bin'):
    """
    Generate high-quality neural TTS with Kokoro.
    
    Voices:
      English (US): af_heart, af_bella, af_nicole, am_adam, am_michael
      English (UK): bf_emma, bf_isabella, bm_george, bm_lewis
      Japanese: jf_nezuko, jf_tsumugi, jm_kumo
      Chinese: zf_xiaobei, zf_xiaoni, zm_yunjian
      French: ff_siwis
      Korean: kf_alpha
      Spanish: es-419-af-dalia, es-419-am-diego
      Hindi: hf_alpha, hm_omega
      Italian: if_sara, im_nicola
      Brazilian PT: pf_dora, pm_alex
      Portuguese: ptf_edite
    """
    kokoro = Kokoro(model_path, voices_path)
    
    samples, sample_rate = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
    
    wav_path = output_mp3.replace('.mp3', '.wav')
    sf.write(wav_path, samples, sample_rate)
    
    subprocess.run([
        'ffmpeg', '-i', wav_path,
        '-c:a', 'libmp3lame', '-b:a', '192k',
        output_mp3, '-y', '-loglevel', 'quiet'
    ], check=True)
    
    return output_mp3

# Example
kokoro_tts(
    "Welcome to our product demo. This neural TTS produces natural speech.",
    "/tmp/kokoro_output.mp3",
    voice="af_heart"
)
```

## Language Code Mapping

```python
KOKORO_LANG = {
    'en-us': 'en-us',
    'en-gb': 'en-gb',
    'ja':    'ja',
    'zh':    'zh',
    'fr':    'fr-fr',
    'ko':    'ko',
    'es':    'es',
    'hi':    'hi',
    'it':    'it',
    'pt':    'pt-br',
    'pt-pt': 'pt-pt',
}
```

## Caching Model Between Sessions

```python
import os, shutil
from pathlib import Path

CACHE_DIR = Path('/home/claude/.kokoro_cache')
CACHE_DIR.mkdir(exist_ok=True)

MODEL_CACHED = CACHE_DIR / 'kokoro-v1.0.onnx'
VOICES_CACHED = CACHE_DIR / 'voices-v1.0.bin'

def get_or_download_kokoro():
    if MODEL_CACHED.exists() and VOICES_CACHED.exists():
        return str(MODEL_CACHED), str(VOICES_CACHED)
    
    from huggingface_hub import hf_hub_download
    model = hf_hub_download("hexgrad/Kokoro-82M-ONNX", "kokoro-v1.0.onnx")
    voices = hf_hub_download("hexgrad/Kokoro-82M-ONNX", "voices-v1.0.bin")
    
    shutil.copy(model, MODEL_CACHED)
    shutil.copy(voices, VOICES_CACHED)
    
    return str(MODEL_CACHED), str(VOICES_CACHED)
```