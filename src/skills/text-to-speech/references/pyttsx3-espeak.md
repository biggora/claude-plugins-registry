# pyttsx3 + espeak-ng Reference

Primary TTS engine for this environment. Fully offline, 131+ languages.

## Full API

```python
import pyttsx3

engine = pyttsx3.init()

# Properties
engine.setProperty('rate', 145)      # words per minute (100–200, default 200)
engine.setProperty('volume', 1.0)    # 0.0–1.0
# Note: 'pitch' property is accepted but has no effect in espeak backend

# List all voices
voices = engine.getProperty('voices')
for v in voices:
    print(v.id, v.name, v.languages)

# Set a specific voice
engine.setProperty('voice', 'gmw/en-gb-scotland')

# Speak (blocking, uses system audio — not useful in agent)
# engine.say("Hello"); engine.runAndWait()

# Save to file (USE THIS in agent context)
engine.save_to_file("Text to speak", '/tmp/output.wav')
engine.runAndWait()
```

## Recommended Voice IDs per Language

```python
VOICE_MAP = {
    'en':    'gmw/en-gb-scotland',  # clearest English
    'en-us': 'gmw/en-us',
    'ru':    'zle/ru',
    'de':    'gmw/de',
    'fr':    'roa/fr',
    'es':    'roa/es',
    'it':    'roa/it',
    'pt':    'roa/pt-pt',
    'nl':    'gmw/nl',
    'pl':    'zls/pl',
    'cs':    'zlw/cs',
    'zh':    'sit/cmn',
    'ja':    'jpn/ja',
    'ko':    'ko',
    'ar':    'sem/ar',
    'hi':    'inc/hi',
    'tr':    'trk/tr',
    'sv':    'gmw/sv',
    'da':    'gmw/da',
    'fi':    'urj/fi',
    'uk':    'zle/uk',
}
```

## Quality Optimization

```python
def high_quality_tts(text: str, out_wav: str, lang: str = 'en', rate: int = 145):
    import pyttsx3, subprocess
    
    engine = pyttsx3.init()
    engine.setProperty('rate', rate)
    engine.setProperty('volume', 1.0)
    
    voice_id = VOICE_MAP.get(lang, f'gmw/{lang}')
    voices = engine.getProperty('voices')
    matched = next((v for v in voices if v.id == voice_id), None)
    if matched:
        engine.setProperty('voice', matched.id)
    
    engine.save_to_file(text, out_wav)
    engine.runAndWait()
    
    # Enhance with FFmpeg: resample to 44.1kHz + EQ for speech clarity
    enhanced = out_wav.replace('.wav', '_enhanced.wav')
    subprocess.run([
        'ffmpeg', '-i', out_wav,
        '-af', 'aresample=44100,equalizer=f=3000:t=o:w=1:g=3,equalizer=f=200:t=o:w=1:g=-2,loudnorm=I=-16:TP=-1.5:LRA=11',
        enhanced, '-y', '-loglevel', 'quiet'
    ], check=True)
    
    return enhanced
```

## Paragraph-by-Paragraph Generation

For long texts, generate in chunks to avoid engine timeouts:

```python
def tts_long_text(paragraphs: list[str], output_mp3: str, lang: str = 'en'):
    import pyttsx3, subprocess, os
    
    chunks = []
    engine = pyttsx3.init()
    engine.setProperty('rate', 145)
    
    for i, para in enumerate(paragraphs):
        if not para.strip():
            continue
        wav = f'/tmp/chunk_{i}.wav'
        engine.save_to_file(para, wav)
        engine.runAndWait()
        chunks.append(wav)
    
    # Add 0.3s pause between paragraphs
    concat_list = '/tmp/tts_concat.txt'
    with open(concat_list, 'w') as f:
        for wav in chunks:
            f.write(f"file '{wav}'\n")
    
    subprocess.run([
        'ffmpeg', '-f', 'concat', '-safe', '0', '-i', concat_list,
        '-c:a', 'libmp3lame', '-b:a', '192k',
        output_mp3, '-y', '-loglevel', 'quiet'
    ], check=True)
    
    # Cleanup
    for wav in chunks:
        os.unlink(wav)
    
    return output_mp3
```

## Getting Audio Duration

```python
import subprocess, json

def get_audio_duration(path: str) -> float:
    """Returns duration in seconds."""
    result = subprocess.run([
        'ffprobe', '-v', 'quiet', '-print_format', 'json',
        '-show_format', path
    ], capture_output=True, text=True)
    data = json.loads(result.stdout)
    return float(data['format']['duration'])
```