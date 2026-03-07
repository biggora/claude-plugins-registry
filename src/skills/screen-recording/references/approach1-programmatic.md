# Approach 1: Programmatic Video Generation

Full offline pipeline. No browser, no display server needed.

## Full Working Template

```python
#!/usr/bin/env python3
"""
Autonomous Product Demo Video Generator
Usage: python3 generate_demo.py
Output: /mnt/user-data/outputs/demo.mp4
"""

from moviepy import VideoClip, AudioFileClip
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import pyttsx3, subprocess, os, shutil

# ── CONFIG ─────────────────────────────────────────────────────────────────────
WIDTH, HEIGHT = 1280, 720
FPS = 24
OUTPUT_PATH = "/home/claude/demo.mp4"
FINAL_OUTPUT = "/mnt/user-data/outputs/demo.mp4"

# Color palette (dark tech theme)
C = {
    "bg":       (12, 12, 32),
    "header":   (20, 20, 55),
    "accent":   (60, 120, 255),
    "accent2":  (100, 220, 180),
    "text":     (240, 240, 255),
    "subtext":  (140, 140, 190),
    "success":  (60, 200, 100),
    "warning":  (255, 180, 40),
    "card":     (25, 28, 60),
}

# ── SCENES ─────────────────────────────────────────────────────────────────────
SCENES = [
    {
        "id": "intro",
        "duration": 4,
        "narration": "Welcome to our product. This demonstration will walk you through the key features.",
    },
    {
        "id": "feature_1",
        "duration": 5,
        "narration": "First, our automated detection system identifies issues in real time.",
    },
    {
        "id": "feature_2", 
        "duration": 5,
        "narration": "Then, our correction engine applies fixes automatically, saving hours of manual work.",
    },
    {
        "id": "outro",
        "duration": 4,
        "narration": "Get started today and transform your workflow. Thank you for watching.",
    },
]

TOTAL_DURATION = sum(s["duration"] for s in SCENES)

# ── HELPERS ────────────────────────────────────────────────────────────────────
def ease(t, d):
    """Smooth ease-in-out, 0→1 over duration d"""
    x = max(0, min(1, t / d))
    return x * x * (3 - 2 * x)

def draw_header(draw, title, subtitle=""):
    draw.rectangle([0, 0, WIDTH, 72], fill=C["header"])
    draw.text((32, 16), title, fill=C["text"])
    if subtitle:
        draw.text((32, 46), subtitle, fill=C["subtext"])
    # Header accent line
    draw.rectangle([0, 72, WIDTH, 75], fill=C["accent"])

def draw_progress_bar(draw, t, duration, y=680, label=""):
    p = ease(t, duration)
    draw.rectangle([80, y, WIDTH-80, y+12], outline=C["subtext"], width=1)
    if p > 0:
        draw.rectangle([80, y, int(80 + (WIDTH-160) * p), y+12], fill=C["accent"])
    if label:
        draw.text((80, y - 22), label, fill=C["subtext"])

def draw_card(draw, x, y, w, h, title, content_lines, highlight=False):
    color = C["accent"] if highlight else C["card"]
    draw.rectangle([x, y, x+w, y+h], fill=color if highlight else C["card"], 
                   outline=C["accent"] if highlight else C["subtext"], width=1)
    draw.text((x+16, y+14), title, fill=C["text"])
    for i, line in enumerate(content_lines):
        draw.text((x+16, y+44+i*26), line, fill=C["subtext"])

# ── SCENE DRAW FUNCTIONS ───────────────────────────────────────────────────────
def draw_intro(draw, t, d):
    # Animated title appearance
    alpha_title = ease(t, 1.0)
    alpha_sub = ease(max(0, t - 0.5), 1.0)
    
    draw_header(draw, "Product Demo", "Automated Video — No Human Required")
    
    # Big title
    title = "Welcome to Our Product"
    x = int(WIDTH/2 - len(title)*12)
    y = int(200 + (1 - alpha_title) * 60)
    draw.text((x, y), title, fill=(
        int(255 * alpha_title), int(255 * alpha_title), int(255 * alpha_title)))
    
    # Subtitle
    sub = "Transforming workflows with AI automation"
    x2 = int(WIDTH/2 - len(sub)*7)
    draw.text((x2, 310), sub, fill=(
        int(180 * alpha_sub), int(180 * alpha_sub), int(220 * alpha_sub)))
    
    # Animated dots
    for i in range(3):
        dot_t = (t * 2 + i * 0.4) % 1.5
        r = int(4 + 4 * ease(dot_t, 0.3))
        cx = WIDTH//2 - 30 + i * 30
        draw.ellipse([cx-r, 470-r, cx+r, 470+r], fill=C["accent"])
    
    draw_progress_bar(draw, t, d, label="Loading demo...")


def draw_feature_1(draw, t, d):
    draw_header(draw, "Feature 1: Automated Detection", "Real-time issue identification")
    
    # Animated list items appearing one by one
    items = [
        ("✓", "Scans 10,000+ items per second"),
        ("✓", "98.7% detection accuracy"),
        ("✓", "Zero false positives guaranteed"),
        ("✓", "Works with any input format"),
    ]
    for i, (icon, text) in enumerate(items):
        appear_t = max(0, t - i * 0.8)
        alpha = ease(appear_t, 0.5)
        if alpha > 0:
            y = 180 + i * 80
            # Card background
            draw.rectangle([80, y, 900, y+60], 
                         fill=(int(25*alpha), int(28*alpha), int(60*alpha)),
                         outline=(int(60*alpha), int(120*alpha), int(255*alpha)), width=1)
            draw.text((110, y+18), f"{icon} {text}", 
                     fill=(int(240*alpha), int(240*alpha), int(255*alpha)))
    
    # Animated counter
    count = int(ease(t, d) * 10847)
    draw.text((950, 250), f"{count:,}", fill=C["accent2"])
    draw.text((950, 290), "items processed", fill=C["subtext"])
    
    draw_progress_bar(draw, t, d, label="Detecting...")


def draw_feature_2(draw, t, d):
    draw_header(draw, "Feature 2: Automated Correction", "One-click fix for all detected issues")
    
    # Before/After comparison
    mid = WIDTH // 2
    
    # Before panel
    before_alpha = max(0, 1 - ease(t, 1.5) * 0.3)
    draw.rectangle([60, 150, mid-20, 580], fill=C["card"], outline=C["warning"], width=2)
    draw.text((80, 165), "BEFORE", fill=C["warning"])
    issues = ["❌ Extra fingers detected", "❌ Proportion mismatch", "❌ Anatomy anomaly", "❌ 3 more issues..."]
    for i, issue in enumerate(issues):
        draw.text((80, 210 + i * 50), issue, fill=(200, 180, 100))
    
    # Animated arrow
    arrow_p = ease(max(0, t - 0.5), 1.0)
    ax = int(mid - 40 + 80 * arrow_p)
    if arrow_p > 0.1:
        draw.text((ax, 340), "→", fill=C["accent"])
    
    # After panel (appears after animation)
    after_alpha = ease(max(0, t - 1.5), 1.0)
    if after_alpha > 0:
        draw.rectangle([mid+20, 150, WIDTH-60, 580], fill=C["card"], 
                      outline=(int(60*after_alpha), int(200*after_alpha), int(100*after_alpha)), width=2)
        draw.text((mid+40, 165), "AFTER", fill=C["success"])
        fixes = ["✅ Fingers corrected", "✅ Proportions normalized", "✅ Anatomy verified", "✅ All issues resolved"]
        for i, fix in enumerate(fixes):
            fix_alpha = ease(max(0, t - 1.5 - i*0.3), 0.4)
            draw.text((mid+40, 210 + i * 50), fix, 
                     fill=(int(60*fix_alpha), int(200*fix_alpha), int(100*fix_alpha)))
    
    draw_progress_bar(draw, t, d, label="Correcting...")


def draw_outro(draw, t, d):
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=C["bg"])
    draw_header(draw, "Get Started Today")
    
    p = ease(t, 2.0)
    
    # CTA
    draw.text((WIDTH//2 - 200, 250), "Ready to transform your workflow?", fill=C["text"])
    
    # Stats cards
    stats = [("10x", "Faster"), ("99%", "Accurate"), ("0", "Manual Work")]
    for i, (val, label) in enumerate(stats):
        card_p = ease(max(0, t - 0.5 - i * 0.3), 0.5)
        if card_p > 0:
            x = 100 + i * 380
            draw.rectangle([x, 360, x+320, 500], fill=C["card"],
                         outline=C["accent"], width=int(1 + card_p))
            draw.text((x + 120, 390), val, fill=C["accent2"])
            draw.text((x + 120, 440), label, fill=C["subtext"])
    
    # Final tagline
    if t > 2:
        final_p = ease(t - 2, 1.5)
        draw.text((WIDTH//2 - 180, 560), "Start your free trial now →",
                 fill=(int(60*final_p), int(120*final_p), int(255*final_p)))

DRAW_FUNCTIONS = {
    "intro": draw_intro,
    "feature_1": draw_feature_1,
    "feature_2": draw_feature_2,
    "outro": draw_outro,
}

# ── MAIN PIPELINE ──────────────────────────────────────────────────────────────
def generate_video():
    print("📝 Step 1: Generating TTS narration...")
    narration_text = " ".join(s["narration"] for s in SCENES)
    engine = pyttsx3.init()
    engine.setProperty('rate', 140)
    engine.save_to_file(narration_text, '/tmp/narration.wav')
    engine.runAndWait()
    subprocess.run(['ffmpeg', '-i', '/tmp/narration.wav', '-c:a', 'libmp3lame',
                    '-b:a', '128k', '/tmp/narration.mp3', '-y', '-loglevel', 'quiet'])
    print(f"   ✅ Narration: {os.path.getsize('/tmp/narration.mp3'):,} bytes")

    print("🎬 Step 2: Rendering video frames...")
    # Build timeline
    timeline = []
    elapsed = 0
    for scene in SCENES:
        timeline.append((elapsed, elapsed + scene["duration"], scene["id"]))
        elapsed += scene["duration"]

    def make_frame(t):
        img = Image.new('RGB', (WIDTH, HEIGHT), C["bg"])
        draw = ImageDraw.Draw(img)
        for start, end, scene_id in timeline:
            if start <= t < end:
                DRAW_FUNCTIONS[scene_id](draw, t - start, end - start)
                break
        return np.array(img)

    clip = VideoClip(make_frame, duration=TOTAL_DURATION)
    print(f"   ✅ Clip: {TOTAL_DURATION}s at {FPS}fps")

    print("🎵 Step 3: Combining video + audio...")
    audio = AudioFileClip('/tmp/narration.mp3').with_duration(TOTAL_DURATION)
    final = clip.with_audio(audio)
    final.write_videofile(OUTPUT_PATH, fps=FPS, logger=None)
    size = os.path.getsize(OUTPUT_PATH)
    print(f"   ✅ Video: {size:,} bytes ({size//1024} KB)")

    print("📦 Step 4: Copying to outputs...")
    os.makedirs(os.path.dirname(FINAL_OUTPUT), exist_ok=True)
    shutil.copy(OUTPUT_PATH, FINAL_OUTPUT)
    print(f"   ✅ Saved to: {FINAL_OUTPUT}")
    
    return FINAL_OUTPUT

if __name__ == "__main__":
    result = generate_video()
    print(f"\n🎉 Done! Video ready at: {result}")
```

## Tips for Customization

### Adding a logo/watermark
```python
# Load image and paste onto frame
logo = Image.open("/path/to/logo.png").convert("RGBA")
logo = logo.resize((120, 60))
img.paste(logo, (WIDTH - 140, 20), logo)
```

### Screen mockup (fake browser window)
```python
def draw_browser_mockup(draw, x, y, w, h, url="https://yourapp.com"):
    # Chrome bar
    draw.rectangle([x, y, x+w, y+40], fill=(50, 50, 60))
    draw.ellipse([x+10, y+12, x+26, y+28], fill=(255, 80, 80))
    draw.ellipse([x+32, y+12, x+48, y+28], fill=(255, 180, 40))
    draw.ellipse([x+54, y+12, x+70, y+28], fill=(60, 200, 80))
    # URL bar
    draw.rectangle([x+90, y+8, x+w-20, y+32], fill=(35, 35, 45))
    draw.text((x+100, y+14), url, fill=(180, 180, 200))
    # Content area
    draw.rectangle([x, y+40, x+w, y+h], fill=(240, 242, 250))
```

### Animated typing effect
```python
def typing_effect(draw, text, x, y, t, speed=20, color=(240,240,255)):
    """Shows text appearing character by character"""
    chars_shown = int(t * speed)
    visible = text[:chars_shown]
    draw.text((x, y), visible, fill=color)
    # Blinking cursor
    if chars_shown < len(text) and int(t * 4) % 2 == 0:
        cursor_x = x + chars_shown * 12
        draw.text((cursor_x, y), "▌", fill=color)
```