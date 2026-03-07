# espeak-ng CLI Reference

Direct command-line usage of espeak-ng. Useful when you need fine-grained control over
phonemes, prosody, SSML, or want to avoid the Python pyttsx3 overhead.

---

## Basic Usage

```bash
# Speak to stdout (pipe to ffmpeg)
espeak-ng "Hello world"

# Save to WAV file
espeak-ng -w /tmp/output.wav "Hello world"

# Read from file
espeak-ng -w /tmp/output.wav -f /tmp/script.txt

# Read from stdin
echo "Hello world" | espeak-ng -w /tmp/output.wav
```

---

## Key Flags

| Flag | Description | Example |
|------|-------------|---------|
| `-v <voice>` | Voice/language | `-v en-gb`, `-v ru`, `-v de` |
| `-s <rate>` | Speed in words/min (default 175) | `-s 140` |
| `-p <pitch>` | Pitch 0–99 (default 50) | `-p 55` |
| `-a <amplitude>` | Volume 0–200 (default 100) | `-a 120` |
| `-g <gap>` | Gap between words in 10ms units | `-g 5` |
| `-w <file>` | Write WAV output to file | `-w out.wav` |
| `-f <file>` | Read input from text file | `-f script.txt` |
| `--ipa` | Print IPA phonemes to stdout | `--ipa` |
| `-q` | Quiet — no audio, just phoneme output | `-q --ipa` |
| `--pho` | Output phoneme mnemonics | `--pho` |
| `-m` | Interpret input as SSML markup | `-m` |
| `-b 1` | Input is UTF-8 (default on Linux) | `-b 1` |
| `--punct` | Speak punctuation characters | `--punct` |
| `-z` | No final sentence pause | `-z` |

---

## Voice Selection

```bash
# List all voices
espeak-ng --voices

# List voices for a language
espeak-ng --voices=en
espeak-ng --voices=ru
espeak-ng --voices=zh

# Key voice IDs
# English:  en, en-gb, en-us, en-gb-scotland, en-gb-x-gbclan, en-gb-x-rp
# Russian:  ru
# German:   de
# French:   fr
# Spanish:  es, es-419 (Latin America)
# Chinese:  cmn (Mandarin), yue (Cantonese)
# Japanese: ja
# Arabic:   ar
# Hindi:    hi
# Korean:   ko
# Italian:  it
# Dutch:    nl
# Polish:   pl
# Ukrainian: uk
# Turkish:  tr
# Swedish:  sv
# Portuguese: pt, pt-br
```

---

## SSML Support

espeak-ng understands a subset of SSML. Pass `-m` flag to enable:

```bash
espeak-ng -m -w /tmp/ssml_out.wav '<speak>
  Hello, <break time="500ms"/> how are you?
  <prosody rate="slow" pitch="+5st">This part is slower and higher.</prosody>
  <emphasis level="strong">Important point here.</emphasis>
  Back to normal speed now.
</speak>'
```

### Supported SSML Tags

```xml
<!-- Pause -->
<break time="300ms"/>
<break time="1s"/>

<!-- Prosody control -->
<prosody rate="slow">...</prosody>        <!-- slow, medium, fast, x-slow, x-fast -->
<prosody rate="0.8">...</prosody>         <!-- relative rate: 0.5–2.0 -->
<prosody pitch="+5st">...</prosody>       <!-- semitones: -12st to +12st -->
<prosody pitch="high">...</prosody>       <!-- x-low, low, medium, high, x-high -->
<prosody volume="loud">...</prosody>      <!-- silent, x-soft, soft, medium, loud, x-loud -->

<!-- Emphasis -->
<emphasis level="strong">...</emphasis>  <!-- none, reduced, moderate, strong -->

<!-- Say-as (number/date formatting) -->
<say-as interpret-as="cardinal">42</say-as>
<say-as interpret-as="ordinal">3</say-as>
<say-as interpret-as="characters">CPU</say-as>
<say-as interpret-as="date" format="ymd">2024-03-15</say-as>
<say-as interpret-as="time" format="hms24">14:30:00</say-as>

<!-- Phoneme (IPA or x-sampa) -->
<phoneme alphabet="ipa" ph="həˈloʊ">Hello</phoneme>
<phoneme alphabet="x-sampa" ph="h@'loU">Hello</phoneme>

<!-- Sub (spoken alias) -->
<sub alias="Artificial Intelligence">AI</sub>

<!-- Language switch -->
<voice xml:lang="fr">Bonjour</voice>
```

---

## Phoneme Control

```bash
# Get IPA phonemes for text
espeak-ng -q --ipa "Hello world"
# → həlˈəʊ wˈɜːld

# Get x-sampa phonemes
espeak-ng -q --pho "Hello world"

# Speak using IPA directly
espeak-ng -w /tmp/ipa.wav "<phoneme alphabet='ipa' ph='həˈloʊ'>Hello</phoneme>" -m

# Print phoneme list for a language
espeak-ng --voices=en --pho
```

---

## Python Subprocess Integration

```python
import subprocess

def espeak_tts(text: str, output_wav: str,
               voice: str = "en-gb-scotland",
               speed: int = 145,
               pitch: int = 52,
               amplitude: int = 110,
               ssml: bool = False) -> str:
    """
    Generate TTS via espeak-ng CLI.
    Returns path to output WAV file.
    """
    cmd = [
        "espeak-ng",
        "-v", voice,
        "-s", str(speed),
        "-p", str(pitch),
        "-a", str(amplitude),
        "-w", output_wav,
    ]
    if ssml:
        cmd.append("-m")
    cmd.append(text)
    
    subprocess.run(cmd, check=True, capture_output=True)
    return output_wav


def espeak_tts_file(input_txt: str, output_wav: str,
                    voice: str = "en-gb-scotland",
                    speed: int = 145) -> str:
    """Generate TTS from a text file."""
    subprocess.run([
        "espeak-ng", "-v", voice, "-s", str(speed),
        "-f", input_txt, "-w", output_wav
    ], check=True, capture_output=True)
    return output_wav


def get_ipa(text: str, lang: str = "en") -> str:
    """Return IPA transcription of text."""
    result = subprocess.run(
        ["espeak-ng", "-v", lang, "-q", "--ipa", text],
        capture_output=True, text=True
    )
    return result.stdout.strip()
```

---

## WAV → MP3 Pipeline

```bash
# Basic
ffmpeg -i /tmp/espeak.wav -c:a libmp3lame -b:a 192k /tmp/output.mp3 -y -loglevel quiet

# Enhanced speech quality (cleaner high-mids, reduced low rumble)
ffmpeg -i /tmp/espeak.wav \
  -af "aresample=44100,equalizer=f=3000:t=o:w=1:g=3,equalizer=f=200:t=o:w=1:g=-2,loudnorm=I=-16:TP=-1.5:LRA=11" \
  -c:a libmp3lame -b:a 192k /tmp/output.mp3 -y -loglevel quiet
```

---

## Multi-voice Script (narrator + character)

```python
import subprocess, os

def multi_voice_tts(lines: list[dict], output_mp3: str) -> str:
    """
    lines = [
      {"text": "Welcome.", "voice": "en-gb-scotland", "speed": 140},
      {"text": "Thank you.", "voice": "en-us",         "speed": 160},
    ]
    """
    wavs = []
    for i, line in enumerate(lines):
        wav = f"/tmp/mv_{i}.wav"
        subprocess.run([
            "espeak-ng",
            "-v", line.get("voice", "en-gb-scotland"),
            "-s", str(line.get("speed", 145)),
            "-p", str(line.get("pitch", 50)),
            "-w", wav,
            line["text"]
        ], check=True, capture_output=True)
        wavs.append(wav)
    
    concat = "/tmp/mv_concat.txt"
    with open(concat, "w") as f:
        for wav in wavs:
            f.write(f"file '{wav}'\n")
    
    subprocess.run([
        "ffmpeg", "-f", "concat", "-safe", "0", "-i", concat,
        "-c:a", "libmp3lame", "-b:a", "192k",
        output_mp3, "-y", "-loglevel", "quiet"
    ], check=True)
    
    for wav in wavs:
        os.unlink(wav)
    
    return output_mp3
```

---

## Useful Tuning Combinations

```bash
# Natural male English (UK)
espeak-ng -v en-gb-scotland -s 145 -p 42 -a 110 -w out.wav "Text here"

# Natural female English (RP)
espeak-ng -v en-gb-x-rp -s 150 -p 62 -a 110 -w out.wav "Text here"

# Russian — clear and measured
espeak-ng -v ru -s 130 -p 50 -a 120 -w out.wav "Текст здесь"

# Fast technical narration (US English)
espeak-ng -v en-us -s 175 -p 48 -a 105 -w out.wav "Text here"

# Slow, deliberate presentation voice
espeak-ng -v en-gb-scotland -s 120 -p 50 -g 8 -a 115 -w out.wav "Text here"
```