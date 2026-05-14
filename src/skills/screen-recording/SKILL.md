---
name: screen-recording
description: "Record the actual screen to video. Use this skill whenever a user asks to: \"record my screen\", \"capture my screen\", \"make a screen recording\", \"screencast\", \"record what's on screen\", \"capture desktop\", \"record a video of my screen\", \"take a video of my desktop\", \"screen capture to video\", or anything involving recording the actual display output to an MP4/video file. Also supports creating synthetic demo videos programmatically when no real screen capture is needed (product demos, animated presentations). Always trigger this skill for any screen recording, screen capture, or video creation task."
---

> **Requires FFmpeg** for primary recording. Install: `choco install ffmpeg` (Windows), `brew install ffmpeg` (macOS), `apt install ffmpeg` (Linux). Python fallback available if FFmpeg is not installed (no audio/cursor).

# Screen Recording Skill

Record the actual screen — full desktop, a specific region, or a named window — to MP4 video with optional audio and cursor capture.

## What this skill does

- **Screen recording** — capture what's actually on screen (primary purpose)
- **Region/window recording** — capture a specific area or application window
- **Audio capture** — record system audio alongside video
- **Synthetic video generation** — create animated demo videos programmatically (secondary)

---

## Quick Start

### Record full screen for 30 seconds
```python
import platform, subprocess, shutil, signal, os

def record_screen(output="recording.mp4", duration=30, fps=30, audio=False):
    system = platform.system()
    cmd = ["ffmpeg"]

    if system == "Windows":
        if audio:
            cmd += ["-f", "dshow", "-i", "audio=Stereo Mix"]
        cmd += ["-f", "gdigrab", "-framerate", str(fps), "-draw_mouse", "1",
                "-i", "desktop"]
    elif system == "Darwin":
        devices = "0" if not audio else "0:1"
        cmd += ["-f", "avfoundation", "-framerate", str(fps),
                "-capture_cursor", "1", "-i", devices]
    else:  # Linux
        if audio:
            cmd += ["-f", "pulse", "-i", "default"]
        display = os.environ.get("DISPLAY", ":0.0")
        cmd += ["-f", "x11grab", "-framerate", str(fps), "-draw_mouse", "1",
                "-i", display]

    cmd += ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
            "-pix_fmt", "yuv420p"]
    if audio:
        cmd += ["-c:a", "aac", "-b:a", "128k"]
    if duration:
        cmd += ["-t", str(duration)]
    cmd += [output, "-y"]

    print(f"Recording → {output}")
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE)
    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.send_signal(signal.SIGINT)
        proc.wait()
    print(f"Saved: {output} ({os.path.getsize(output):,} bytes)")
    return output

record_screen("recording.mp4", duration=30)
```

---

## Decision Tree

```
User wants a video
│
├─ Record what's actually on screen?
│  ├─ FFmpeg installed? → Approach 1: FFmpeg (RECOMMENDED)
│  └─ No FFmpeg?       → Approach 2: Python fallback (mss + OpenCV)
│
└─ Create a synthetic animated demo/presentation?
   └─ YES → Approach 3: Programmatic generation (Pillow + MoviePy)
```

---

## Approach 1: FFmpeg Screen Recording (RECOMMENDED)

FFmpeg uses platform-native capture APIs for fast, high-quality recording with audio and cursor support.

Read `references/ffmpeg-recording.md` for the full platform reference including window capture, audio device detection, and quality tuning.

### Platform-specific input formats

| Platform | Input Format | Cursor | Audio | Region |
|----------|-------------|--------|-------|--------|
| Windows | `gdigrab` | `-draw_mouse 1` | `-f dshow -i audio="Stereo Mix"` | `-offset_x/-offset_y/-video_size` |
| macOS | `avfoundation` | `-capture_cursor 1` | Device index `"0:1"` | `-vf crop=w:h:x:y` |
| Linux X11 | `x11grab` | `-draw_mouse 1` | `-f pulse -i default` | `-video_size WxH -i :0.0+X,Y` |
| Linux Wayland | `wf-recorder` | Default | `-a` flag | `-g "x,y wxh"` |

### Full screen recording

**Windows:**
```bash
ffmpeg -f gdigrab -framerate 30 -draw_mouse 1 -i desktop -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -t 30 recording.mp4 -y
```

**macOS:**
```bash
ffmpeg -f avfoundation -framerate 30 -capture_cursor 1 -i "0" -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -t 30 recording.mp4 -y
```

**Linux (X11):**
```bash
ffmpeg -f x11grab -framerate 30 -draw_mouse 1 -i :0.0 -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p -t 30 recording.mp4 -y
```

### Region recording

```python
# Record a specific area: (x=100, y=200, width=800, height=600)
region = (100, 200, 800, 600)

if system == "Windows":
    cmd += ["-offset_x", "100", "-offset_y", "200", "-video_size", "800x600", "-i", "desktop"]
elif system == "Darwin":
    cmd += ["-i", "0", "-vf", "crop=800:600:100:200"]  # crop after capture
else:  # Linux
    cmd += ["-video_size", "800x600", "-i", ":0.0+100,200"]
```

### Window recording

**Windows** — by window title:
```bash
ffmpeg -f gdigrab -framerate 30 -i title="My App" -c:v libx264 -preset ultrafast recording.mp4 -y
```

**macOS/Linux** — get window bounds, then record as region. See `references/ffmpeg-recording.md` for platform-specific window geometry detection.

### Audio capture

Audio device names vary per system. Detect available devices:

```python
import subprocess, platform

system = platform.system()
if system == "Windows":
    # Lists DirectShow audio devices
    subprocess.run(["ffmpeg", "-list_devices", "true", "-f", "dshow", "-i", "dummy"])
elif system == "Darwin":
    # Lists AVFoundation devices (screens + audio)
    subprocess.run(["ffmpeg", "-f", "avfoundation", "-list_devices", "true", "-i", ""])
else:
    # PulseAudio sources
    subprocess.run(["pactl", "list", "short", "sources"])
```

> **Windows note**: "Stereo Mix" must be enabled in Sound Settings → Recording tab. Right-click → Show Disabled Devices → Enable "Stereo Mix".

### Stopping the recording

- **Duration-based**: Use `-t SECONDS` in the FFmpeg command
- **Manual stop**: Send `SIGINT` (Ctrl+C) to the FFmpeg process
- **From Python**: `proc.send_signal(signal.SIGINT)` then `proc.wait()`

---

## Approach 2: Python Fallback (No FFmpeg)

When FFmpeg is not available, use `mss` for screenshots and `cv2.VideoWriter` to assemble them.

Read `references/python-fallback.md` for the full working template.

```bash
pip install mss opencv-python numpy
```

### Basic capture loop
```python
import mss, cv2, numpy as np, time

def record_screen_python(output="recording.mp4", duration=30, fps=20, region=None):
    with mss.mss() as sct:
        if region:
            x, y, w, h = region
            area = {"left": x, "top": y, "width": w, "height": h}
        else:
            mon = sct.monitors[1]
            area = {"left": mon["left"], "top": mon["top"],
                    "width": mon["width"], "height": mon["height"]}

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(output, fourcc, fps, (area["width"], area["height"]))
        interval = 1.0 / fps
        start = time.time()

        while time.time() - start < duration:
            t0 = time.time()
            frame = np.array(sct.grab(area))[:, :, :3]
            writer.write(frame)
            elapsed = time.time() - t0
            if elapsed < interval:
                time.sleep(interval - elapsed)

        writer.release()
        print(f"Saved: {output}")
```

### Limitations
- **No audio** — mss captures pixels only
- **No cursor** — cursor is not included in screenshots
- **Lower FPS** — typically 15-25 fps depending on resolution
- **Larger files** — mp4v codec is less efficient than H.264

---

## Approach 3: Synthetic Video Generation

For creating animated demo videos, product showcases, or presentations without recording the real screen.

Read `references/programmatic-generation.md` for the full implementation guide.

**Stack**: Pillow (frame drawing) → MoviePy (video assembly) → pyttsx3 (TTS narration)

```bash
pip install "moviepy>=2.0" pillow pyttsx3
```

**Key pattern:**
```python
from moviepy import VideoClip, AudioFileClip
from PIL import Image, ImageDraw
import numpy as np

def make_frame(t):
    img = Image.new('RGB', (1280, 720), (12, 12, 32))
    draw = ImageDraw.Draw(img)
    draw.text((100, 300), f"Frame at t={t:.1f}s", fill=(255, 255, 255))
    return np.array(img)

clip = VideoClip(make_frame, duration=10)
clip.write_videofile("demo.mp4", fps=24, logger=None)
```

---

## Post-Processing (FFmpeg)

```bash
# Compress for sharing
ffmpeg -i recording.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k compressed.mp4

# Trim (start at 5s, keep 30s)
ffmpeg -i recording.mp4 -ss 00:00:05 -t 00:00:30 -c copy trimmed.mp4

# Convert to GIF (for docs/chat)
ffmpeg -i recording.mp4 -vf "fps=12,scale=960:-1:flags=lanczos" -loop 0 demo.gif

# Add text overlay
ffmpeg -i recording.mp4 -vf "drawtext=text='Demo':fontcolor=white:fontsize=24:x=20:y=20" overlay.mp4

# Extract audio
ffmpeg -i recording.mp4 -vn -c:a mp3 audio.mp3

# Concatenate clips
# Create concat.txt: file 'clip1.mp4' \n file 'clip2.mp4'
ffmpeg -f concat -safe 0 -i concat.txt -c copy combined.mp4
```

---

## Installation

### FFmpeg (required for Approach 1)

| Platform | Command |
|----------|---------|
| Windows | `choco install ffmpeg` or `winget install FFmpeg` or download from ffmpeg.org |
| macOS | `brew install ffmpeg` |
| Ubuntu/Debian | `sudo apt install ffmpeg` |
| Arch | `sudo pacman -S ffmpeg` |

Verify: `ffmpeg -version`

### Python packages

```bash
# For Approach 2 (Python fallback)
pip install mss opencv-python numpy

# For Approach 3 (synthetic video generation)
pip install "moviepy>=2.0" pillow pyttsx3

# On Linux, for TTS in Approach 3:
# sudo apt install espeak-ng
```

### Wayland (Linux)

If on Wayland (`echo $WAYLAND_DISPLAY` returns a value), install wf-recorder:
```bash
sudo apt install wf-recorder    # Ubuntu
sudo pacman -S wf-recorder      # Arch
```

---

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| FFmpeg not found | Install FFmpeg and ensure it's on PATH |
| Windows: no audio device | Enable "Stereo Mix" in Sound Settings → Recording → Show Disabled Devices |
| macOS: permission denied | Grant Screen Recording permission: System Settings → Privacy → Screen Recording |
| Linux: `x11grab` fails on Wayland | Use `wf-recorder` instead (see Wayland section) |
| Linux: no audio with x11grab | Install PulseAudio: `sudo apt install pulseaudio` |
| Black/empty video | Check DISPLAY variable on Linux (`echo $DISPLAY`), permissions on macOS |
| Recording too large | Re-encode: `ffmpeg -i big.mp4 -crf 28 -preset slow small.mp4` |
| Python fallback: low FPS | Reduce capture resolution or target FPS |
| Python fallback: no cursor | Known limitation — use FFmpeg approach for cursor capture |
| MoviePy import error | Use `from moviepy import VideoClip` (v2 syntax), install `moviepy>=2.0` |

---

## Reference Files

- `references/ffmpeg-recording.md` — Full FFmpeg command reference per platform, audio devices, window capture, quality tuning
- `references/python-fallback.md` — Complete mss + OpenCV recording template with performance tips
- `references/programmatic-generation.md` — Pillow + MoviePy synthetic video generation (animated demos)
- `references/design-patterns.md` — UI components and animation patterns for synthetic videos
