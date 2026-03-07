# Design Patterns for Screen Recording Videos

## UI Component Library (Pillow)

### Rounded Rectangle
```python
def rounded_rect(draw, x, y, w, h, r, fill=None, outline=None, width=1):
    draw.rectangle([x+r, y, x+w-r, y+h], fill=fill)
    draw.rectangle([x, y+r, x+w, y+h-r], fill=fill)
    draw.ellipse([x, y, x+2*r, y+2*r], fill=fill)
    draw.ellipse([x+w-2*r, y, x+w, y+2*r], fill=fill)
    draw.ellipse([x, y+h-2*r, x+2*r, y+h], fill=fill)
    draw.ellipse([x+w-2*r, y+h-2*r, x+w, y+h], fill=fill)
    if outline:
        draw.arc([x, y, x+2*r, y+2*r], 180, 270, fill=outline, width=width)
        draw.arc([x+w-2*r, y, x+w, y+2*r], 270, 360, fill=outline, width=width)
        draw.arc([x, y+h-2*r, x+2*r, y+h], 90, 180, fill=outline, width=width)
        draw.arc([x+w-2*r, y+h-2*r, x+w, y+h], 0, 90, fill=outline, width=width)
        draw.line([x+r, y, x+w-r, y], fill=outline, width=width)
        draw.line([x+r, y+h, x+w-r, y+h], fill=outline, width=width)
        draw.line([x, y+r, x, y+h-r], fill=outline, width=width)
        draw.line([x+w, y+r, x+w, y+h-r], fill=outline, width=width)
```

### Notification Toast
```python
def draw_toast(draw, message, t, appear_at=0, dismiss_at=3, icon="✓", color=(60,200,100)):
    p = ease(max(0, t - appear_at), 0.4)
    if t > dismiss_at:
        p = 1 - ease(t - dismiss_at, 0.3)
    if p <= 0:
        return
    x, y = 900, int(30 + (1-p) * -80)
    draw.rectangle([x, y, x+340, y+60], fill=(30, 40, 30), 
                   outline=color, width=2)
    draw.text((x+15, y+18), f"{icon} {message}", fill=color)
```

### Metric Card
```python
def draw_metric(draw, x, y, label, value, unit="", trend=None):
    draw.rectangle([x, y, x+220, y+110], fill=(20, 25, 55), 
                   outline=(60, 80, 160), width=1)
    draw.text((x+12, y+10), label, fill=(140, 140, 180))
    draw.text((x+12, y+45), str(value), fill=(255, 255, 255))
    if unit:
        draw.text((x+12+len(str(value))*18, y+55), unit, fill=(140, 140, 180))
    if trend == "up":
        draw.text((x+180, y+10), "↑", fill=(60, 200, 100))
    elif trend == "down":
        draw.text((x+180, y+10), "↓", fill=(255, 80, 80))
```

### Simple Bar Chart
```python
def draw_bar_chart(draw, data, x, y, w, h, t, animate=True):
    """data = [(label, value), ...]"""
    max_val = max(v for _, v in data)
    bar_w = w // len(data) - 10
    
    for i, (label, val) in enumerate(data):
        p = ease(t, 1.0) if animate else 1.0
        bar_h = int((val / max_val) * h * p)
        bx = x + i * (bar_w + 10)
        # Bar
        draw.rectangle([bx, y+h-bar_h, bx+bar_w, y+h], fill=(60, 120, 255))
        # Label
        draw.text((bx, y+h+8), label, fill=(140, 140, 180))
        # Value
        if p > 0.7:
            draw.text((bx, y+h-bar_h-24), str(val), fill=(240, 240, 255))
```

## Transition Patterns

### Fade between scenes
```python
def cross_fade(draw_a, draw_b, t, fade_start, fade_duration, img_size):
    if t < fade_start:
        draw_a(...)
    elif t < fade_start + fade_duration:
        p = ease(t - fade_start, fade_duration)
        # Render both on separate images and blend
        img_a = render_scene_a(t)
        img_b = render_scene_b(t - fade_start)
        return Image.blend(img_a, img_b, p)
    else:
        draw_b(...)
```

### Slide transition
```python
def slide_in(draw, content_fn, t, direction="left", duration=0.5):
    p = ease(t, duration)
    if direction == "left":
        offset_x = int((1 - p) * 1280)
        # Draw content shifted right, moving left
        # Use PIL paste with offset
    elif direction == "up":
        offset_y = int((1 - p) * 720)
```

## Narration Script Patterns

### Per-scene narration timing
```python
SCENES = [
    {"id": "intro",   "duration": 4, "narration": "Welcome to our demo."},
    {"id": "feature", "duration": 6, "narration": "Our system detects issues automatically."},
]

def build_full_narration(scenes):
    """Concatenate all narrations for single TTS call"""
    # Add natural pauses between scenes
    parts = []
    for s in scenes:
        parts.append(s["narration"])
        parts.append("...")  # pause
    return " ".join(parts)
```

### Voice settings
```python
engine = pyttsx3.init()

# Speed: 100=slow, 150=normal, 200=fast
engine.setProperty('rate', 140)

# Volume: 0.0-1.0
engine.setProperty('volume', 0.9)

# List available voices (usually 1-2 with espeak)
voices = engine.getProperty('voices')
for v in voices:
    print(v.id, v.name, v.languages)
# Set voice by ID
engine.setProperty('voice', voices[0].id)
```

## File Size Optimization

```python
# For web delivery: compress output
subprocess.run([
    'ffmpeg', '-i', 'output.mp4',
    '-c:v', 'libx264', '-crf', '28',     # 23=good, 28=smaller, 35=small
    '-preset', 'slow',                    # slow=better compression
    '-c:a', 'aac', '-b:a', '96k',
    'output_compressed.mp4', '-y', '-loglevel', 'quiet'
])

# For GIF (social media / documentation)
subprocess.run([
    'ffmpeg', '-i', 'output.mp4',
    '-vf', 'fps=10,scale=960:-1:flags=lanczos',
    '-loop', '0',
    'demo.gif', '-y', '-loglevel', 'quiet'
])
```

## Checklist Before Rendering

- [ ] All scenes have `draw_fn` implemented
- [ ] `total_duration = sum(s["duration"] for s in SCENES)` is correct
- [ ] `make_frame` returns `np.array(img)` (not PIL Image)
- [ ] Audio `.with_duration(total_duration)` called
- [ ] Output path is in `/home/claude/` first, then copied to `/mnt/user-data/outputs/`
- [ ] `apt-get install -y espeak-ng` was run if pyttsx3 is used