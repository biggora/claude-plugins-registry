# Python Fallback — Screen Recording without FFmpeg

Use this approach when FFmpeg is not installed. Captures screenshots in a loop using `mss` and assembles them into MP4 with OpenCV.

> **Limitations**: No audio capture, no cursor capture, lower FPS than FFmpeg, larger CPU usage.

## Dependencies

```bash
pip install mss opencv-python numpy
```

## Full Working Template

```python
#!/usr/bin/env python3
"""
Screen recorder using Python only (mss + OpenCV).
No FFmpeg required. Cross-platform: Windows, macOS, Linux.

Limitations:
- No audio capture
- No cursor capture
- Lower FPS (~15-25 depending on resolution and hardware)
"""

import time, os, sys
import numpy as np
import cv2
import mss

def record_screen(output="recording.mp4", duration=30, fps=20,
                  region=None, monitor=1):
    """
    Record the screen using mss + OpenCV.

    Args:
        output: Output file path (.mp4)
        duration: Recording duration in seconds
        fps: Target frames per second (actual may be lower)
        region: Tuple (x, y, w, h) for specific region, or None for full screen
        monitor: Monitor number (1 = primary, 2 = secondary, etc.)
    """
    with mss.mss() as sct:
        # Define capture area
        if region:
            x, y, w, h = region
            capture_area = {"left": x, "top": y, "width": w, "height": h}
        else:
            mon = sct.monitors[monitor]  # monitors[0] is "all monitors"
            capture_area = {
                "left": mon["left"],
                "top": mon["top"],
                "width": mon["width"],
                "height": mon["height"],
            }

        width = capture_area["width"]
        height = capture_area["height"]

        # Setup video writer
        # Try H264 first, fall back to mp4v
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(output, fourcc, fps, (width, height))

        if not writer.isOpened():
            raise RuntimeError(f"Failed to open VideoWriter for {output}")

        print(f"Recording {width}x{height} @ {fps}fps → {output}")
        print(f"Duration: {duration}s (Ctrl+C to stop early)")

        frame_count = 0
        frame_interval = 1.0 / fps
        start_time = time.time()

        try:
            while True:
                frame_start = time.time()
                elapsed = frame_start - start_time

                if elapsed >= duration:
                    break

                # Capture screenshot
                screenshot = sct.grab(capture_area)
                # Convert BGRA → BGR (OpenCV format)
                frame = np.array(screenshot)[:, :, :3]
                # mss returns BGRA, but numpy slice gives BGR which is what OpenCV expects

                writer.write(frame)
                frame_count += 1

                # Frame rate control
                frame_time = time.time() - frame_start
                sleep_time = frame_interval - frame_time
                if sleep_time > 0:
                    time.sleep(sleep_time)

        except KeyboardInterrupt:
            print("\nStopped by user.")

        writer.release()
        actual_duration = time.time() - start_time
        actual_fps = frame_count / actual_duration if actual_duration > 0 else 0
        size = os.path.getsize(output) if os.path.exists(output) else 0

        print(f"Saved: {output}")
        print(f"  Frames: {frame_count}")
        print(f"  Duration: {actual_duration:.1f}s")
        print(f"  Actual FPS: {actual_fps:.1f}")
        print(f"  Size: {size:,} bytes ({size // 1024} KB)")

        return output


def list_monitors():
    """List available monitors and their dimensions."""
    with mss.mss() as sct:
        for i, mon in enumerate(sct.monitors):
            if i == 0:
                print(f"  [0] All monitors combined: {mon['width']}x{mon['height']}")
            else:
                print(f"  [{i}] Monitor {i}: {mon['width']}x{mon['height']} at ({mon['left']}, {mon['top']})")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Record screen (Python only)")
    parser.add_argument("output", nargs="?", default="recording.mp4")
    parser.add_argument("--duration", "-t", type=int, default=30)
    parser.add_argument("--fps", type=int, default=20)
    parser.add_argument("--region", "-r", type=str, default=None,
                        help="x,y,w,h (e.g. 100,200,800,600)")
    parser.add_argument("--monitor", "-m", type=int, default=1,
                        help="Monitor number (default: 1 = primary)")
    parser.add_argument("--list-monitors", action="store_true",
                        help="List available monitors and exit")
    args = parser.parse_args()

    if args.list_monitors:
        list_monitors()
        sys.exit(0)

    region = tuple(map(int, args.region.split(","))) if args.region else None
    record_screen(args.output, args.duration, args.fps, region, args.monitor)
```

## Multi-Monitor Support

```python
with mss.mss() as sct:
    # sct.monitors[0] = virtual screen (all monitors combined)
    # sct.monitors[1] = primary monitor
    # sct.monitors[2] = secondary monitor, etc.

    # Record specific monitor
    mon = sct.monitors[2]  # secondary monitor
    screenshot = sct.grab(mon)

    # Record all monitors as one image
    screenshot = sct.grab(sct.monitors[0])
```

## Performance Tips

### Reduce resolution for higher FPS
```python
# Capture at half resolution, then resize for writing
frame = np.array(sct.grab(capture_area))[:, :, :3]
small = cv2.resize(frame, (width // 2, height // 2))
writer.write(small)
```

### Use JPEG compression for intermediate frames
```python
# For very long recordings, write frames as JPEG to reduce memory/disk
_, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
# Later decode for video assembly
```

### Codec alternatives
```python
# mp4v — most compatible, larger files
fourcc = cv2.VideoWriter_fourcc(*"mp4v")

# XVID — better compression (requires ffmpeg/xvid codec)
fourcc = cv2.VideoWriter_fourcc(*"XVID")
# Output file should be .avi for XVID

# H264 — best compression (may not be available everywhere)
fourcc = cv2.VideoWriter_fourcc(*"avc1")  # macOS
fourcc = cv2.VideoWriter_fourcc(*"H264")  # Linux
```

## Adding Audio After Recording

If you need audio, record video with this script, then merge audio separately:

```python
import subprocess

def add_audio_to_video(video_path, audio_path, output_path):
    """Merge separately-recorded audio into the video."""
    subprocess.run([
        "ffmpeg", "-i", video_path, "-i", audio_path,
        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
        "-shortest", output_path, "-y", "-loglevel", "quiet"
    ], check=True)
```

## Comparison: Python Fallback vs FFmpeg

| Feature | Python (mss+cv2) | FFmpeg Native |
|---------|-------------------|---------------|
| **FPS** | 15-25 (resolution-dependent) | 30-60 |
| **Audio** | No | Yes |
| **Cursor** | No | Yes |
| **CPU Usage** | Higher | Lower |
| **Dependencies** | pip only | System FFmpeg |
| **File Size** | Larger (mp4v codec) | Smaller (H.264) |
| **Setup** | Easier | Requires FFmpeg install |
| **Reliability** | Good | Excellent |
