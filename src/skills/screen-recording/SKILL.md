---
name: screen-recording
description: >
  Autonomous video creation skill for the Agent — creates product demos, presentation videos,
  UI walkthroughs, and narrated screencasts entirely without user intervention.
  Use this skill whenever a user asks to: "record a screen", "create a demo video", "make a product video",
  "create a presentation video", "record a walkthrough", "make a screencast", "automate video creation",
  "generate a narrated video", or anything involving producing an MP4/video file showing content, UI, or animations.
  This skill covers the full pipeline: animated frames → video assembly → TTS narration → final MP4.
  Always trigger this skill for any video generation or screen recording automation task.
---

> ⚠️ **Platform notes**: Approach 1 (Programmatic) works on **Linux, macOS, and Windows**. Approach 2 (Xvfb) is **Linux-only**. TTS via pyttsx3 uses espeak-ng on Linux, NSSpeechSynthesizer on macOS, and SAPI5 on Windows — no extra install needed on macOS/Windows.

# Screen Recording Skill

Autonomous video creation pipeline for the Agent. No user interaction required after initial brief.

## What this skill creates

- **Product demo videos** — animated walkthroughs showing features, UI flows, dashboards
- **Presentation videos** — slide-style videos with animated content and narration
- **Screen recordings** — capture of a virtual X11 display (Xvfb) with real browser/app content
- **Narrated screencasts** — video + TTS voiceover, fully automated

---

## Architecture: 3 Confirmed Approaches

### Approach 1 — Programmatic Animation (RECOMMENDED)
**Best for**: product demos, feature showcases, presentation videos, marketing videos

Stack: `Pillow` → frame generation → `MoviePy` → video assembly → `pyttsx3+espeak` → narration

**Why preferred**: Fully offline, fast, no browser needed, complete creative control.

### Approach 2 — Virtual Display Recording (Linux only)
**Best for**: capturing real browser/app interactions, UI walkthroughs with live content

Stack: `Xvfb` (virtual display :99) → `FFmpeg x11grab` → records actual screen content

**Why use**: When you need to show a real running application or website.

### Approach 3 — Hybrid (Approach 1 + 2 combined)
**Best for**: complex demos mixing animated overlays with real UI screenshots

---

## Quick Start Workflow

### Step 1 — Understand the request
Determine:
- What content to show (UI flow, feature list, data visualization, slides)
- Duration (default: 30–120 seconds)
- Has narration? (default: yes, using pyttsx3)
- Resolution (default: 1280×720 HD)
- Output format (default: MP4, H.264)
- Output path (ask the user, or default to `./output.mp4` in the current working directory)

### Step 2 — Choose approach (see decision tree below)

### Step 3 — Generate video (see implementation guides)

### Step 4 — Present the file
```python
import os
output_path = os.path.join(os.getcwd(), "demo.mp4")
print(f"Video saved to: {output_path}")

# If present_files is available (e.g., Claude.ai sandbox), optionally copy there:
# import shutil
# shutil.copy(output_path, "/mnt/user-data/outputs/demo.mp4")
```

---

## Decision Tree

```
User wants a video
│
├── Need REAL browser/app on screen?
│   ├── YES → Approach 2 (Xvfb + x11grab, Linux only)
│   └── NO  → Continue
│
├── Presentation / slides / feature demo / marketing?
│   └── YES → Approach 1 (Programmatic, FASTEST)
│
└── Mix of real UI + animated overlays?
    └── YES → Approach 3 (Hybrid)
```

---

## Implementation: Approach 1 (Programmatic)

Read `references/approach1-programmatic.md` for the full implementation guide.

**Key pattern:**
```python
from moviepy import VideoClip, AudioFileClip
import numpy as np
from PIL import Image, ImageDraw
import pyttsx3, subprocess, tempfile, os

TMP = tempfile.gettempdir()

# 1. Generate TTS
engine = pyttsx3.init()
engine.setProperty('rate', 140)  # speaking speed
wav_path = os.path.join(TMP, 'narration.wav')
mp3_path = os.path.join(TMP, 'narration.mp3')
engine.save_to_file("Your narration text here", wav_path)
engine.runAndWait()
subprocess.run(['ffmpeg', '-i', wav_path, '-c:a', 'libmp3lame',
                mp3_path, '-y', '-loglevel', 'quiet'])

# 2. Generate frames
scenes = build_scene_list()  # list of {duration, draw_fn}

def make_frame(t):
    img = Image.new('RGB', (1280, 720), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    current_scene(draw, t)  # draw current scene content
    return np.array(img)

# 3. Assemble
total_duration = sum(s['duration'] for s in scenes)
clip = VideoClip(make_frame, duration=total_duration)
audio = AudioFileClip(mp3_path).with_duration(total_duration)
final = clip.with_audio(audio)
output_path = os.path.join(os.getcwd(), "output.mp4")
final.write_videofile(output_path, fps=24, logger=None)
```

---

## Implementation: Approach 2 (Xvfb + x11grab)

Read `references/approach2-xvfb.md` for the full implementation guide.

**Key pattern:**
```bash
# 1. Start virtual display
Xvfb :99 -screen 0 1280x720x24 &
XVFB_PID=$!

# 2. Start recording
DISPLAY=:99 ffmpeg -f x11grab -video_size 1280x720 -i :99 \
  -c:v libx264 -preset fast -r 24 recording.mp4 &
FFMPEG_PID=$!

# 3. Run your app/browser on DISPLAY=:99
DISPLAY=:99 chromium --no-sandbox --headless=new ...
# OR
DISPLAY=:99 python3 your_app.py

# 4. Stop recording
kill $FFMPEG_PID $XVFB_PID
```

---

## Audio / TTS

### pyttsx3 (OFFLINE — always works)
```python
import pyttsx3, tempfile, os
engine = pyttsx3.init()  # Uses espeak-ng (Linux), NSSpeechSynthesizer (macOS), SAPI5 (Windows)
engine.setProperty('rate', 140)   # 100-200, default ~200
engine.setProperty('volume', 0.9) # 0.0-1.0

# List voices:
for v in engine.getProperty('voices'):
    print(v.id, v.name)

TMP = tempfile.gettempdir()
engine.save_to_file("Text to speak", os.path.join(TMP, 'out.wav'))
engine.runAndWait()
```
Convert WAV→MP3: `ffmpeg -i "$TMPDIR/out.wav" -c:a libmp3lame "$TMPDIR/out.mp3" -y -loglevel quiet`

### Silent video (no narration)
```python
# Just skip the audio step, write video without audio
clip.write_videofile("output.mp4", fps=24, logger=None)
```

### Fallback Strategy

If TTS initialization fails (missing espeak-ng on Linux, etc.), generate a silent video instead of crashing:

```python
import tempfile, os

TMP = tempfile.gettempdir()
audio_path = None

try:
    import pyttsx3
    engine = pyttsx3.init()
    engine.setProperty('rate', 140)
    wav_path = os.path.join(TMP, 'narration.wav')
    engine.save_to_file(narration_text, wav_path)
    engine.runAndWait()
    mp3_path = os.path.join(TMP, 'narration.mp3')
    subprocess.run(['ffmpeg', '-i', wav_path, '-c:a', 'libmp3lame',
                    mp3_path, '-y', '-loglevel', 'quiet'])
    audio_path = mp3_path
except Exception as e:
    print(f"⚠️  TTS unavailable ({e}). Generating silent video.")

# When assembling:
if audio_path and os.path.exists(audio_path):
    audio = AudioFileClip(audio_path).with_duration(total_duration)
    final = clip.with_audio(audio)
else:
    final = clip
final.write_videofile(output_path, fps=24, logger=None)
```

---

## Design System

### Color Palettes (use consistently per video)
```python
# Tech/Product (dark)
BG = (12, 12, 32)          # background
HEADER = (25, 25, 60)       # header bar
ACCENT = (60, 120, 255)     # primary accent
TEXT = (255, 255, 255)      # main text
SUBTEXT = (150, 150, 200)   # secondary text

# Presentation (light)
BG = (245, 248, 255)
HEADER = (30, 60, 180)
ACCENT = (255, 100, 50)
TEXT = (20, 20, 40)
SUBTEXT = (100, 100, 130)
```

### Standard Resolutions
- `1280x720` — HD (default, fast)
- `1920x1080` — Full HD (for high-quality output)
- `1080x1920` — Vertical (mobile/social)

### Font Handling

Pillow's default bitmap font renders tiny unreadable text. Always load a TrueType font:

```python
from PIL import ImageFont
import os

def get_font(size=24):
    """Load a TrueType font with cross-platform fallback."""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",        # Linux (Debian/Ubuntu)
        "/usr/share/fonts/TTF/DejaVuSans.ttf",                    # Linux (Arch)
        "/System/Library/Fonts/Helvetica.ttc",                     # macOS
        "C:/Windows/Fonts/arial.ttf",                              # Windows
    ]
    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    print("⚠️  No TrueType font found — text will render small. Install dejavu-sans.")
    return ImageFont.load_default()

# Usage in draw functions:
title_font = get_font(36)
body_font = get_font(20)
small_font = get_font(14)
draw.text((x, y), "Hello", fill=C["text"], font=title_font)
```

### Animation Patterns
```python
# Smooth ease-in-out (0→1 over duration d, current time t from scene start)
def ease(t, d): 
    x = t/d
    return x*x*(3-2*x)

# Fade in text
alpha = int(255 * ease(t, 0.5))  # fade over 0.5s

# Slide in from left
x = int(-500 + 600 * ease(t, 0.8))

# Progress bar
fill_width = int(max_width * ease(t, d))
```

---

## Scene Structure Pattern

For multi-scene videos, use a scene list:

```python
scenes = [
    {
        "title": "Intro",
        "duration": 3,
        "narration": "Welcome to our product demo.",
        "draw": draw_intro_scene
    },
    {
        "title": "Feature 1",
        "duration": 5,
        "narration": "Our AI detects issues automatically.",
        "draw": draw_feature1_scene
    },
    # ...
]

# Build timeline
def make_frame(t):
    elapsed = 0
    for scene in scenes:
        if t < elapsed + scene['duration']:
            scene_t = t - elapsed
            scene['draw'](img, draw, scene_t, scene['duration'])
            return np.array(img)
        elapsed += scene['duration']
```

> **Narration timing**: The pattern above concatenates all narration into a single TTS call, so per-scene audio timing may drift. For precise sync, generate audio separately per scene:
>
> ```python
> from moviepy import concatenate_audioclips
> audio_clips = []
> for scene in scenes:
>     path = os.path.join(TMP, f"narration_{scene['title']}.wav")
>     engine.save_to_file(scene['narration'], path)
>     engine.runAndWait()
>     audio_clips.append(AudioFileClip(path).with_duration(scene['duration']))
> full_audio = concatenate_audioclips(audio_clips)
> ```

---

## FFmpeg Post-Processing

```bash
# Add subtitles/captions
ffmpeg -i input.mp4 -vf "subtitles=subs.srt" output.mp4

# Compress for web
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k web.mp4

# GIF (for short demos)
ffmpeg -i input.mp4 -vf "fps=12,scale=960:-1:flags=lanczos" -loop 0 demo.gif

# Trim
ffmpeg -i input.mp4 -ss 00:00:05 -t 00:00:30 -c copy trimmed.mp4

# Concatenate multiple clips
# Create concat.txt: file 'clip1.mp4' \n file 'clip2.mp4'
ffmpeg -f concat -safe 0 -i concat.txt -c copy combined.mp4
```

---

## Installation (run once if needed)

```bash
# Core dependencies (moviepy v2 required)
pip install "moviepy>=2.0" pillow opencv-python pyttsx3

# On Linux — offline TTS engine:
# apt-get install -y espeak-ng
# On macOS — pyttsx3 uses NSSpeechSynthesizer (no extra install needed)
# On Windows — pyttsx3 uses SAPI5 (no extra install needed)

# Verify
python3 -c "from moviepy import VideoClip; import pyttsx3; print('OK')"
```

> **Note**: If you get an "externally-managed-environment" error on Debian/Ubuntu, add `--break-system-packages` to the pip command.

---

## Common Pitfalls

| Problem | Solution |
|---|---|
| MoviePy `verbose` kwarg error | Use `logger=None` not `verbose=False` (MoviePy v2) |
| MoviePy import error (`from moviepy.editor`) | Use `from moviepy import VideoClip` (v2 syntax). Install `moviepy>=2.0` |
| pyttsx3 "no espeak" error | Linux: `apt-get install -y espeak-ng`. macOS/Windows: works out of the box |
| gTTS/edge-tts connection error | Use pyttsx3 (offline, always works) |
| Black video output | Check `make_frame` returns `np.array(img)` not `img` |
| Tiny/unreadable text | Use `ImageFont.truetype()` with font path — see Font Handling section |
| Audio/video length mismatch | Use `.with_duration(video.duration)` on audio clip |
| Xvfb display conflict | Use `DISPLAY=:99` and kill after recording (Linux only) |

---

## Reference Files

- `references/approach1-programmatic.md` — Full Approach 1 code templates
- `references/approach2-xvfb.md` — Full Approach 2 (Xvfb) code templates
- `references/design-patterns.md` — Advanced animations, transitions, UI components