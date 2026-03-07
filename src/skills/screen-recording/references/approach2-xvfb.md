# Approach 2: Virtual Display Recording (Xvfb + FFmpeg x11grab)

Capture a real running application on a virtual screen.

## How It Works

```
Xvfb :99  ←── virtual display (invisible, in RAM)
    ↑
Your app runs here (DISPLAY=:99)
    ↓
FFmpeg x11grab ←── records the virtual display → MP4
```

## Full Working Template

```python
#!/usr/bin/env python3
"""
Virtual Display Screen Recorder
Launches a real app on a virtual display and records it.
"""

import subprocess, os, time, signal, shutil

WIDTH, HEIGHT = 1280, 720
DISPLAY_NUM = ":99"
FPS = 24
DURATION = 30  # seconds to record
OUTPUT = "/home/claude/recording.mp4"


def start_virtual_display():
    """Start Xvfb virtual display"""
    proc = subprocess.Popen([
        "Xvfb", DISPLAY_NUM,
        "-screen", "0", f"{WIDTH}x{HEIGHT}x24",
        "-ac", "-nolisten", "tcp"
    ], stderr=subprocess.DEVNULL)
    time.sleep(1.0)  # wait for display to initialize
    print(f"✅ Virtual display {DISPLAY_NUM} started (PID {proc.pid})")
    return proc


def start_recording(output_path, duration=None):
    """Start FFmpeg recording of virtual display"""
    cmd = [
        "ffmpeg",
        "-f", "x11grab",
        "-video_size", f"{WIDTH}x{HEIGHT}",
        "-framerate", str(FPS),
        "-i", DISPLAY_NUM,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
    ]
    if duration:
        cmd.extend(["-t", str(duration)])
    cmd.extend([output_path, "-y", "-loglevel", "quiet"])
    
    proc = subprocess.Popen(cmd)
    time.sleep(0.5)
    print(f"✅ Recording started → {output_path}")
    return proc


def run_app_on_display(app_command, env_extra=None):
    """Run an application on the virtual display"""
    env = os.environ.copy()
    env["DISPLAY"] = DISPLAY_NUM
    if env_extra:
        env.update(env_extra)
    proc = subprocess.Popen(app_command, env=env, stderr=subprocess.DEVNULL)
    return proc


def record_session(app_fn, duration=30, output=OUTPUT):
    """
    Full recording session:
    1. Start virtual display
    2. Start recording
    3. Run app_fn(display) — your automation code
    4. Stop recording, stop display
    """
    xvfb = start_virtual_display()
    recorder = start_recording(output, duration)
    
    try:
        app_fn(DISPLAY_NUM)
        # Wait remaining time or until done
        time.sleep(duration)
    finally:
        recorder.send_signal(signal.SIGINT)
        recorder.wait()
        xvfb.terminate()
        xvfb.wait()
        print(f"✅ Recording saved: {os.path.getsize(output):,} bytes")
    
    return output


# ── EXAMPLE: Record a Python Tkinter app ─────────────────────────────────────

def my_tkinter_app_script():
    return '''
import tkinter as tk
import time

root = tk.Tk()
root.title("My App Demo")
root.geometry("1280x720")
root.configure(bg="#0c0c20")

label = tk.Label(root, text="Loading...", font=("Arial", 48), 
                 bg="#0c0c20", fg="white")
label.pack(pady=200)

def update():
    texts = ["Detecting issues...", "Processing...", "✅ Complete!", "100% Accurate"]
    for i, t in enumerate(texts):
        root.after(i * 2000, lambda t=t: label.configure(text=t))
    root.after(8000, root.destroy)

root.after(500, update)
root.mainloop()
'''

def run_demo(display):
    # Write app to temp file
    with open('/tmp/demo_app.py', 'w') as f:
        f.write(my_tkinter_app_script())
    
    env = os.environ.copy()
    env["DISPLAY"] = display
    subprocess.Popen(["python3", "/tmp/demo_app.py"], env=env)
    time.sleep(10)  # let app run


# ── EXAMPLE: Record a Chromium browser session ───────────────────────────────

def record_browser(url, duration=20, output=OUTPUT):
    """Record a browser navigating to a URL"""
    xvfb = start_virtual_display()
    recorder = start_recording(output, duration)
    
    env = os.environ.copy()
    env["DISPLAY"] = DISPLAY_NUM
    
    # Launch Chromium in window mode (not headless — we WANT it visible)
    subprocess.Popen([
        "chromium", "--no-sandbox",
        f"--window-size={WIDTH},{HEIGHT}",
        "--window-position=0,0",
        "--start-maximized",
        url
    ], env=env, stderr=subprocess.DEVNULL)
    
    time.sleep(duration)
    recorder.send_signal(signal.SIGINT)
    recorder.wait()
    xvfb.terminate()
    print(f"✅ Browser recording saved: {output}")
    return output


# ── POST-PROCESSING ───────────────────────────────────────────────────────────

def add_narration(video_path, narration_text, output_path):
    """Add TTS narration to a recorded video"""
    import pyttsx3
    
    engine = pyttsx3.init()
    engine.setProperty('rate', 140)
    engine.save_to_file(narration_text, '/tmp/narration.wav')
    engine.runAndWait()
    
    subprocess.run([
        'ffmpeg', '-i', '/tmp/narration.wav', 
        '-c:a', 'libmp3lame', '-b:a', '128k',
        '/tmp/narration.mp3', '-y', '-loglevel', 'quiet'
    ])
    
    subprocess.run([
        'ffmpeg', '-i', video_path, '-i', '/tmp/narration.mp3',
        '-c:v', 'copy', '-c:a', 'aac',
        '-shortest', output_path, '-y', '-loglevel', 'quiet'
    ])
    return output_path


def add_overlay_text(video_path, text, position="bottom", output_path=None):
    """Add text overlay to recorded video using FFmpeg"""
    if not output_path:
        output_path = video_path.replace('.mp4', '_overlay.mp4')
    
    if position == "bottom":
        vf = f"drawtext=text='{text}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-th-20:box=1:boxcolor=black@0.5"
    else:
        vf = f"drawtext=text='{text}':fontcolor=white:fontsize=24:x=20:y=20"
    
    subprocess.run([
        'ffmpeg', '-i', video_path, '-vf', vf,
        output_path, '-y', '-loglevel', 'quiet'
    ])
    return output_path


if __name__ == "__main__":
    result = record_session(run_demo, duration=12, output=OUTPUT)
    # Add narration
    final = add_narration(result, "This is our automated UI demo.", 
                          "/home/claude/final_recording.mp4")
    shutil.copy(final, "/mnt/user-data/outputs/recording.mp4")
    print(f"🎉 Done: /mnt/user-data/outputs/recording.mp4")
```

## When to Use This Approach

✅ When you need to show a REAL running application
✅ When demonstrating web UI (real browser rendering)
✅ When the app has complex visual state hard to reproduce with Pillow

❌ Don't use for simple text/graphic demos (too slow — use Approach 1)
❌ Avoid if network access to the app is needed (may be blocked)

## Important Notes

- Xvfb uses RAM for the framebuffer — 1280x720x24 ≈ 3.5MB per frame
- Always kill both `ffmpeg` and `Xvfb` in a `finally` block to avoid orphan processes
- Use `DISPLAY=:99` not `:0` to avoid conflicts with any host display
- FFmpeg's `-preset ultrafast` is recommended for real-time capture
- For longer recordings (>60s), consider `-crf 28` to reduce file size