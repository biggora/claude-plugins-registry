# FFmpeg Screen Recording — Platform Reference

Complete command reference for recording the actual screen with FFmpeg.

## Table of Contents
- [Platform Detection](#platform-detection)
- [Windows (gdigrab)](#windows-gdigrab)
- [macOS (avfoundation)](#macos-avfoundation)
- [Linux X11 (x11grab)](#linux-x11-x11grab)
- [Linux Wayland](#linux-wayland)
- [Audio Capture](#audio-capture)
- [Window Capture](#window-capture)
- [Quality & Performance Tuning](#quality--performance-tuning)
- [Full Cross-Platform Script](#full-cross-platform-script)

---

## Platform Detection

```python
import platform, shutil, os

def detect_recording_backend():
    """Detect the best FFmpeg input format for this platform."""
    system = platform.system()
    has_ffmpeg = shutil.which("ffmpeg") is not None

    if not has_ffmpeg:
        return "python_fallback"

    if system == "Windows":
        return "gdigrab"
    elif system == "Darwin":
        return "avfoundation"
    else:  # Linux
        if os.environ.get("WAYLAND_DISPLAY"):
            if shutil.which("wf-recorder"):
                return "wf-recorder"
            return "x11grab"  # may not work on Wayland, but try
        return "x11grab"
```

---

## Windows (gdigrab)

### Full screen
```bash
ffmpeg -f gdigrab -framerate 30 -draw_mouse 1 -i desktop ^
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p ^
  recording.mp4 -y
```

### Specific region (x=100, y=200, 800x600)
```bash
ffmpeg -f gdigrab -framerate 30 -draw_mouse 1 ^
  -offset_x 100 -offset_y 200 -video_size 800x600 ^
  -i desktop -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p ^
  recording.mp4 -y
```

### Specific window by title
```bash
ffmpeg -f gdigrab -framerate 30 -draw_mouse 1 ^
  -i title="Untitled - Notepad" ^
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p ^
  recording.mp4 -y
```

### With audio (system sound)
```bash
ffmpeg -f dshow -i audio="Stereo Mix" ^
  -f gdigrab -framerate 30 -draw_mouse 1 -i desktop ^
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p ^
  -c:a aac -b:a 128k ^
  recording.mp4 -y
```

### List available audio devices
```bash
ffmpeg -list_devices true -f dshow -i dummy 2>&1 | findstr "audio"
```

> **Note**: "Stereo Mix" must be enabled in Windows Sound settings → Recording tab → right-click → Show Disabled Devices → Enable "Stereo Mix". If unavailable, use virtual audio cable software.

### With fixed duration (30 seconds)
```bash
ffmpeg -f gdigrab -framerate 30 -draw_mouse 1 -t 30 -i desktop ^
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p ^
  recording.mp4 -y
```

---

## macOS (avfoundation)

### List available devices
```bash
ffmpeg -f avfoundation -list_devices true -i "" 2>&1
```
Output shows numbered screen and audio devices. Typically: `[0]` = screen, `[1]` = microphone.

### Full screen (no audio)
```bash
ffmpeg -f avfoundation -framerate 30 -i "0" \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  recording.mp4 -y
```

### Full screen with audio
```bash
ffmpeg -f avfoundation -framerate 30 -i "0:1" \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  recording.mp4 -y
```

### Region capture (crop filter)
```bash
# Record full screen then crop to 800x600 at offset (100, 200)
ffmpeg -f avfoundation -framerate 30 -i "0" \
  -vf "crop=800:600:100:200" \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  recording.mp4 -y
```

> **Note**: avfoundation doesn't support offset/region natively. Use `-vf crop=w:h:x:y` to crop after capture. This captures the full screen and discards the rest — slightly less efficient but works.

### Cursor
macOS avfoundation captures the cursor by default. To hide it, use `-capture_cursor 0`.

---

## Linux X11 (x11grab)

### Full screen
```bash
ffmpeg -f x11grab -framerate 30 -draw_mouse 1 \
  -i :0.0 \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  recording.mp4 -y
```

### Specific region (800x600 at offset 100,200)
```bash
ffmpeg -f x11grab -framerate 30 -draw_mouse 1 \
  -video_size 800x600 -i :0.0+100,200 \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  recording.mp4 -y
```

### With audio (PulseAudio)
```bash
ffmpeg -f pulse -i default \
  -f x11grab -framerate 30 -draw_mouse 1 -i :0.0 \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  recording.mp4 -y
```

### With audio (ALSA)
```bash
ffmpeg -f alsa -i default \
  -f x11grab -framerate 30 -draw_mouse 1 -i :0.0 \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  recording.mp4 -y
```

### Get screen resolution
```bash
xdpyinfo | grep dimensions
# or
xrandr | grep '*'
```

---

## Linux Wayland

FFmpeg's x11grab does **not** work on Wayland. Use `wf-recorder` instead:

```bash
# Full screen
wf-recorder -f recording.mp4

# With audio
wf-recorder -a -f recording.mp4

# Specific region (interactive selection)
wf-recorder -g "$(slurp)" -f recording.mp4

# Fixed region
wf-recorder -g "100,200 800x600" -f recording.mp4
```

**Install**: `sudo apt install wf-recorder` (Ubuntu) or `sudo pacman -S wf-recorder` (Arch)

> **Detection**: Check `echo $WAYLAND_DISPLAY` — if set, you're on Wayland.

---

## Audio Capture

### Detect available audio devices

**Windows:**
```python
import subprocess
result = subprocess.run(
    ["ffmpeg", "-list_devices", "true", "-f", "dshow", "-i", "dummy"],
    capture_output=True, text=True
)
# Parse stderr for audio device names
for line in result.stderr.splitlines():
    if "audio" in line.lower():
        print(line.strip())
```

**macOS:**
```python
result = subprocess.run(
    ["ffmpeg", "-f", "avfoundation", "-list_devices", "true", "-i", ""],
    capture_output=True, text=True
)
for line in result.stderr.splitlines():
    print(line.strip())
```

**Linux:**
```bash
# PulseAudio
pactl list short sources

# ALSA
arecord -L
```

### Audio device selection in Python
```python
def get_audio_device():
    system = platform.system()
    if system == "Windows":
        return "Stereo Mix"  # Common default; detect with dshow list
    elif system == "Darwin":
        return "1"  # Audio device index from avfoundation list
    else:
        return "default"  # PulseAudio default source
```

---

## Window Capture

### Windows — by window title
```python
# FFmpeg gdigrab supports -i title="Window Title"
cmd = ["ffmpeg", "-f", "gdigrab", "-framerate", "30",
       "-i", f'title={window_title}',
       "-c:v", "libx264", "-preset", "ultrafast", output, "-y"]
```

### macOS — by window (not directly supported)
macOS avfoundation captures screens, not windows. Workaround:
1. Get window bounds with `osascript` (AppleScript)
2. Record full screen with crop filter

```python
import subprocess, json

def get_macos_window_bounds(app_name):
    script = f'''
    tell application "System Events"
        tell process "{app_name}"
            set pos to position of front window
            set sz to size of front window
            return (item 1 of pos) & "," & (item 2 of pos) & "," & (item 1 of sz) & "," & (item 2 of sz)
        end tell
    end tell
    '''
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    x, y, w, h = result.stdout.strip().split(",")
    return int(x), int(y), int(w), int(h)
```

### Linux X11 — by window ID
```bash
# Get window ID interactively (click on window)
xdotool selectwindow

# Get window geometry by ID
xdotool getwindowgeometry --shell WINDOW_ID

# Get by name
xdotool search --name "Firefox" | head -1
```

```python
import subprocess

def get_x11_window_geometry(window_name):
    wid = subprocess.run(
        ["xdotool", "search", "--name", window_name],
        capture_output=True, text=True
    ).stdout.strip().split('\n')[0]

    geo = subprocess.run(
        ["xdotool", "getwindowgeometry", "--shell", wid],
        capture_output=True, text=True
    ).stdout
    # Parse X, Y, WIDTH, HEIGHT from output
    vals = {}
    for line in geo.strip().split('\n'):
        k, v = line.split('=')
        vals[k] = int(v)
    return vals['X'], vals['Y'], vals['WIDTH'], vals['HEIGHT']
```

---

## Quality & Performance Tuning

### Encoding presets (speed vs size)
| Preset | Speed | File Size | Use Case |
|--------|-------|-----------|----------|
| `ultrafast` | Fastest | Largest | Live recording (recommended) |
| `superfast` | Very fast | Large | Recording with modest CPU |
| `fast` | Fast | Medium | Post-recording re-encode |
| `medium` | Moderate | Smaller | Final output for sharing |
| `slow` | Slow | Smallest | Archival quality |

### CRF values (quality vs size)
| CRF | Quality | Use Case |
|-----|---------|----------|
| 18 | Visually lossless | Maximum quality |
| 23 | High (default) | Good balance |
| 28 | Medium | Smaller files, acceptable quality |
| 35 | Low | Minimum usable quality |

### Recommended settings
```bash
# During recording (prioritize speed)
-preset ultrafast -crf 23

# Re-encode after recording (prioritize size)
ffmpeg -i recording.mp4 -c:v libx264 -preset slow -crf 23 compressed.mp4
```

### FPS recommendations
- `30` — Standard, smooth motion (default)
- `24` — Cinematic feel, smaller files
- `15` — Acceptable for static content (presentations, text-heavy screens)
- `60` — Smooth for fast-moving content (games, animations)

---

## Full Cross-Platform Script

```python
#!/usr/bin/env python3
"""
Cross-platform screen recorder using FFmpeg.
Usage: python3 record.py [output.mp4] [--duration 30] [--fps 30] [--audio] [--region x,y,w,h]
"""

import platform, subprocess, shutil, signal, os, sys

def build_ffmpeg_cmd(output, duration=None, fps=30, region=None, audio=False, window=None):
    system = platform.system()
    if not shutil.which("ffmpeg"):
        raise RuntimeError("FFmpeg not found. See: https://ffmpeg.org/download.html")

    cmd = ["ffmpeg"]

    if system == "Windows":
        if audio:
            cmd += ["-f", "dshow", "-i", "audio=Stereo Mix"]
        cmd += ["-f", "gdigrab", "-framerate", str(fps), "-draw_mouse", "1"]
        if window:
            cmd += ["-i", f"title={window}"]
        elif region:
            x, y, w, h = region
            cmd += ["-offset_x", str(x), "-offset_y", str(y),
                    "-video_size", f"{w}x{h}", "-i", "desktop"]
        else:
            cmd += ["-i", "desktop"]

    elif system == "Darwin":
        devices = "0" if not audio else "0:1"
        cmd += ["-f", "avfoundation", "-framerate", str(fps),
                "-capture_cursor", "1", "-i", devices]
        if region:
            x, y, w, h = region
            cmd += ["-vf", f"crop={w}:{h}:{x}:{y}"]

    else:  # Linux
        if audio:
            cmd += ["-f", "pulse", "-i", "default"]
        display = os.environ.get("DISPLAY", ":0.0")
        cmd += ["-f", "x11grab", "-framerate", str(fps), "-draw_mouse", "1"]
        if region:
            x, y, w, h = region
            cmd += ["-video_size", f"{w}x{h}", "-i", f"{display}+{x},{y}"]
        else:
            cmd += ["-i", display]

    cmd += ["-c:v", "libx264", "-preset", "ultrafast",
            "-crf", "23", "-pix_fmt", "yuv420p"]
    if audio:
        cmd += ["-c:a", "aac", "-b:a", "128k"]
    if duration:
        cmd += ["-t", str(duration)]
    cmd += [output, "-y"]
    return cmd


def record_screen(output="recording.mp4", duration=None, fps=30,
                  region=None, audio=False, window=None):
    """Record the screen to an MP4 file."""
    system = platform.system()

    # Wayland special case
    if system == "Linux" and os.environ.get("WAYLAND_DISPLAY"):
        if shutil.which("wf-recorder"):
            cmd = ["wf-recorder", "-f", output]
            if audio:
                cmd.append("-a")
            if region:
                x, y, w, h = region
                cmd += ["-g", f"{x},{y} {w}x{h}"]
            if duration:
                # wf-recorder doesn't have -t; use timeout
                cmd = ["timeout", str(duration)] + cmd
            print(f"Recording (wf-recorder) → {output}")
            proc = subprocess.Popen(cmd)
            try:
                proc.wait()
            except KeyboardInterrupt:
                proc.send_signal(signal.SIGINT)
                proc.wait()
            print(f"Saved: {output} ({os.path.getsize(output):,} bytes)")
            return output

    cmd = build_ffmpeg_cmd(output, duration, fps, region, audio, window)
    stop_msg = f" for {duration}s" if duration else " (Ctrl+C to stop)"
    print(f"Recording{stop_msg} → {output}")
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE)
    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.send_signal(signal.SIGINT)
        proc.wait()
    size = os.path.getsize(output) if os.path.exists(output) else 0
    print(f"Saved: {output} ({size:,} bytes)")
    return output


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Record screen to MP4")
    parser.add_argument("output", nargs="?", default="recording.mp4")
    parser.add_argument("--duration", "-t", type=int, default=None)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--audio", "-a", action="store_true")
    parser.add_argument("--region", "-r", type=str, default=None,
                        help="x,y,w,h (e.g. 100,200,800,600)")
    parser.add_argument("--window", "-w", type=str, default=None,
                        help="Window title (Windows only)")
    args = parser.parse_args()

    region = tuple(map(int, args.region.split(","))) if args.region else None
    record_screen(args.output, args.duration, args.fps, region, args.audio, args.window)
```
