---
name: youtube-thumbnail
description: "Generates professional YouTube thumbnails in 11 strategic styles with auto-detection of AI image backends (A1111, ComfyUI, MCP Imagen 4, Gemini API, fal.ai FLUX, OpenAI gpt-image-1) and Pillow compositing. Trigger when the user asks to create, generate, or design a YouTube thumbnail, video cover, channel art, or presentation title slide. Also trigger for batch thumbnail creation or YouTube visual workflow automation."
---

# YouTube Thumbnail Generation Skill (2026 Edition)

## Overview

This skill enables **fully autonomous** generation of professional YouTube thumbnails
in 11 strategic styles from THUMBNAILS.md. Zero user interaction required after the
initial request. The agent auto-selects style, builds a prompt, generates the base
image via the best available AI backend, applies compositing and text via Pillow,
and saves a final **1280×720 PNG** to `/mnt/user-data/outputs/thumbnail.png`.

---

## When to Trigger This Skill

Trigger when the user:
- Says "create a thumbnail", "make a thumbnail", "generate a YouTube thumbnail"
- Provides a video title or topic and needs a visual
- Wants product video covers, presentation title slides, or channel art
- Needs batch thumbnail creation or automation for a YouTube workflow

---

## Architecture: Two-Layer Pipeline
```
[User Request]
      │
      ▼
[Layer 1: AI Image Generation]   ← Base image via best available backend
      │
      ▼
[Layer 2: Pillow Compositing]    ← Resize to 1280×720, effects, text overlay
      │
      ▼
[Output: /mnt/user-data/outputs/thumbnail.png]
```

---

## Backend Priority Table

Auto-detect each backend by testing availability. Use the first one that works.

| # | Backend | Detection Method | Quality | Cost |
|---|---------|-----------------|---------|------|
| 1 | **A1111 Local SD** | `GET localhost:7860/sdapi/v1/samplers` | ★★★★ | Free (own GPU) |
| 2 | **ComfyUI Local** | `GET localhost:8188/history` | ★★★★ | Free (own GPU) |
| 3 | **MCP Imagen 4** (Vertex AI) | `which mcp-imagen-go` + `~/.gemini/settings.json` | ★★★★★ | Vertex AI pricing |
| 4 | **Gemini API** (Nano Banana 2) | `GEMINI_API_KEY` env + `google-genai` installed | ★★★★ | Free quota |
| 5 | **fal.ai FLUX** | `FAL_KEY` env + `fal-client` installed | ★★★★ | $0.03/MP |
| 6 | **OpenAI gpt-image-1** | `OPENAI_API_KEY` env + `openai` installed | ★★★★ | ~$0.04/img |
| 7 | **Pillow-only fallback** | Always available | ★★ | Free |

---

## The 11 Thumbnail Styles

### Style 1: Neo-Minimalism (`style_1_minimalism`)
**Best for:** General niches, standing out in a cluttered feed
**Core idea:** If the feed is loud, go quiet. 50%+ negative space.
**AI prompt pattern:**
`"[subject], minimalist product photography, pure white background, single centered
subject, dramatic soft studio lighting, ultra clean composition, no clutter"`
**Pillow:** White/monochromatic bg, max 2 colors, light serif font bottom-left or none

### Style 2: The Surround (`style_2_surround`)
**Best for:** Comparisons, "I tried X things", hauls
**Core idea:** Subject dead center, objects in organized circle/grid around it.
**AI prompt pattern:**
`"[subject] perfectly centered, multiple [related objects] arranged in organized
circle or grid around center subject, controlled chaos, vibrant, top-down angle"`
**Pillow:** Grid math — center subject 40% canvas, surrounding items equally spaced by angle

### Style 3: Rainbow Ranking (`style_3_rainbow`)
**Best for:** Tier lists, "Best to Worst", reviews
**Core idea:** Color gradient (Red→Blue) conveys hierarchy visually.
**AI prompt pattern:**
`"flat lay of [3-7 items] arranged in ranking order, color gradient from red to
blue across items, product photography style, clean background"`
**Pillow:** Apply gradient color wash per item via `ImageEnhance.Color`, add rank numbers (1,2,3…) in bold white

### Style 4: Educational Whiteboard (`style_4_whiteboard`)
**Best for:** Tutorials, business explainers, complex systems
**Core idea:** Authenticity over polish. Signals "high value, no fluff."
**AI prompt pattern:**
`"hand-drawn diagram on real whiteboard explaining [concept], chalk markers,
rough sketchy educational style, authentic classroom feel, [topic] framework"`
**Pillow:** Reduce saturation to 70% for authenticity, warm color grade, handwritten-style font

### Style 5: Familiar Interface (`style_5_ui_framing`)
**Best for:** Commentary, news, reviews
**Core idea:** Borrow credibility from known platforms (Twitter, Reddit, Amazon).
**AI prompt pattern:**
`"realistic screenshot mockup of [Twitter post / Reddit thread / Amazon listing /
Netflix menu] about [topic], exact platform UI styling, authentic spacing and fonts"`
**Pillow:** Programmatically draw platform UI elements — rounded rectangles, brand colors
(Twitter #1DA1F2, Reddit #FF4500, Amazon #FF9900)

### Style 6: Cinematic Text (`style_6_cinematic`)
**Best for:** High-production storytelling, documentaries
**Core idea:** Text IS a design element — embedded in the world, not floating over it.
**AI prompt pattern:**
`"cinematic movie still about [subject], dramatic chiaroscuro lighting, film grain,
anamorphic lens flare, shallow depth of field, golden hour or moody tones"`
**Pillow:** MAX 3-4 words, large centered bold font, text shadow/glow via layered offset draws

### Style 7: Warped Faces (`style_7_warped`)
**Best for:** Self-improvement, "Harsh Truths", psychology topics
**Core idea:** "Something is wrong" curiosity gap via distortion.
**AI prompt pattern:**
`"double exposure portrait, digital glitch effect, [emotion] face merged with
[abstract concept], surreal digital distortion, moody dark tones, experimental photography"`
**Pillow:** RGB channel shift for glitch (shift R channel +8px), selective blur, minimal/no text

### Style 8: Maximalist Flex (`style_8_maximalist`)
**Best for:** Collectors, tech enthusiasts, hobbyists
**Core idea:** The collection is the star, not the person.
**AI prompt pattern:**
`"aerial flat lay of complete collection of every [item type], perfectly organized
and arranged, every single item visible, product catalog photography style"`
**Pillow:** Dense but organized placement, optional "COMPLETE COLLECTION" text strip top/bottom

### Style 9: Encyclopedia Grid (`style_9_encyclopedia`)
**Best for:** "Every X Explained", deep dives
**Core idea:** Looks informative and "safe" — no drama, just knowledge.
**AI prompt pattern:**
`"flat icon illustration grid of [topic] elements, consistent icon shapes, high
contrast on white background, educational infographic style, no dramatic lighting"`
**Pillow:** Draw equal grid cells with `ImageDraw.rectangle`, flat icon each cell, label below

### Style 10: Candid Fake (`style_10_candid`)
**Best for:** Challenges, travel, lifestyle
**Core idea:** Highly engineered to look like a lucky candid shot.
**AI prompt pattern:**
`"candid authentic moment of [person/scene], natural spontaneous composition but
perfectly framed, golden hour lighting, documentary photography style, physically
possible scene"`
**Pillow:** Minimal processing, subtle vignette at edges only. NO text. NO arrows.

### Style 11: The Anti-Thumbnail (`style_11_anti`)
**Best for:** Productivity, "Quick Tip" videos
**Core idea:** Dark + specific "irritating" number triggers curiosity.
**AI prompt pattern:**
`"dark moody portrait of [subject], direct serious eye contact to camera, dramatic
low-key lighting, minimal background, cinematic single-subject composition"`
**Pillow:** Dark gradient bg (0,0,0)→(30,30,30), specific non-round number ("47 Seconds" not "60"),
large centered font

---

## Auto-Style Selection (when user doesn't specify)
```python
NICHE_TO_STYLE = {
    # Education & Learning
    "education": "style_4_whiteboard",
    "tutorial": "style_4_whiteboard",
    "howto": "style_4_whiteboard",
    "explainer": "style_9_encyclopedia",
    "course": "style_4_whiteboard",

    # Reviews & Rankings
    "review": "style_3_rainbow",
    "comparison": "style_2_surround",
    "tierlist": "style_3_rainbow",
    "ranking": "style_3_rainbow",
    "top10": "style_3_rainbow",

    # News & Commentary
    "news": "style_5_ui_framing",
    "commentary": "style_5_ui_framing",
    "reaction": "style_5_ui_framing",
    "opinion": "style_5_ui_framing",

    # Personal Development
    "productivity": "style_11_anti",
    "psychology": "style_7_warped",
    "selfimprovement": "style_7_warped",
    "motivation": "style_11_anti",

    # Collections & Gear
    "collection": "style_8_maximalist",
    "tech": "style_8_maximalist",
    "gear": "style_8_maximalist",
    "unboxing": "style_2_surround",

    # Lifestyle & Travel
    "travel": "style_10_candid",
    "lifestyle": "style_10_candid",
    "vlog": "style_10_candid",
    "challenge": "style_10_candid",

    # High-Production
    "documentary": "style_6_cinematic",
    "storytelling": "style_6_cinematic",
    "cinematic": "style_6_cinematic",

    # Default
    "general": "style_1_minimalism",
}

def select_style(niche: str, style_override: str = None) -> str:
    if style_override:
        return style_override
    niche_clean = niche.lower().replace(" ", "").replace("-", "")
    for key in NICHE_TO_STYLE:
        if key in niche_clean or niche_clean in key:
            return NICHE_TO_STYLE[key]
    return "style_1_minimalism"
```

---

## Full Python Implementation

When creating a thumbnail, write this complete script to `/home/claude/generate_thumbnail.py`,
then execute it with `python3 generate_thumbnail.py`. All values in CAPS are filled in
by the agent before writing the script.
```python
#!/usr/bin/env python3
"""
YouTube Thumbnail Generator — Auto-generated by Agent
Video: VIDEO_TITLE_PLACEHOLDER
Style: STYLE_PLACEHOLDER
Backend: auto-detected
"""

import os
import sys
import json
import base64
import io
import subprocess
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# ═══════════════════════════════════════════════════════════
# CONFIGURATION — Agent fills these in before writing script
# ═══════════════════════════════════════════════════════════
VIDEO_TITLE  = "FILL_VIDEO_TITLE"
VIDEO_NICHE  = "FILL_NICHE"           # e.g. "tutorial", "review", "travel"
STYLE        = "FILL_STYLE"           # e.g. "style_6_cinematic"
TEXT_OVERLAY = "FILL_TEXT"            # max 4 words; empty string = auto from title
AI_PROMPT    = "FILL_AI_PROMPT"       # full prompt built from style template
OUTPUT_PATH  = "/mnt/user-data/outputs/thumbnail.png"
# ═══════════════════════════════════════════════════════════


# ─────────────────────────────────────────────────────────
# BACKEND DETECTION
# ─────────────────────────────────────────────────────────

def detect_mcp_imagen() -> bool:
    """Check if mcp-imagen-go binary is installed and configured in Gemini CLI."""
    try:
        r = subprocess.run(["which", "mcp-imagen-go"],
                           capture_output=True, text=True, timeout=5)
        if r.returncode != 0:
            return False
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False
    settings_path = os.path.expanduser("~/.gemini/settings.json")
    if not os.path.exists(settings_path):
        return False
    try:
        with open(settings_path) as f:
            settings = json.load(f)
        return "imagen" in settings.get("mcpServers", {})
    except Exception:
        return False


def detect_gemini_api() -> bool:
    """Check if Gemini API key is set and google-genai is installed."""
    if not os.environ.get("GEMINI_API_KEY"):
        return False
    try:
        import google.genai
        return True
    except ImportError:
        return False


def detect_backend() -> str:
    """Auto-detect best available image generation backend."""
    # Priority 1: Local A1111
    try:
        r = requests.get("http://127.0.0.1:7860/sdapi/v1/samplers", timeout=3)
        if r.status_code == 200:
            print("✓ Backend: A1111 Local")
            return "a1111"
    except Exception:
        pass

    # Priority 2: Local ComfyUI
    try:
        r = requests.get("http://127.0.0.1:8188/history", timeout=3)
        if r.status_code == 200:
            print("✓ Backend: ComfyUI Local")
            return "comfyui"
    except Exception:
        pass

    # Priority 3: MCP Imagen 4 (Vertex AI via Gemini CLI)
    if detect_mcp_imagen():
        print("✓ Backend: MCP Imagen 4 (Vertex AI)")
        return "mcp_imagen"

    # Priority 4: Gemini API (Nano Banana 2)
    if detect_gemini_api():
        print("✓ Backend: Gemini API (Nano Banana 2)")
        return "gemini_api"

    # Priority 5: fal.ai FLUX
    if os.environ.get("FAL_KEY"):
        try:
            import fal_client
            print("✓ Backend: fal.ai FLUX")
            return "fal"
        except ImportError:
            pass

    # Priority 6: OpenAI gpt-image-1
    if os.environ.get("OPENAI_API_KEY"):
        try:
            import openai
            print("✓ Backend: OpenAI gpt-image-1")
            return "openai"
        except ImportError:
            pass

    # Priority 7: Pillow-only fallback
    print("⚠ Backend: Pillow-only (no AI available)")
    return "pillow_only"


# ─────────────────────────────────────────────────────────
# IMAGE GENERATION — one function per backend
# ─────────────────────────────────────────────────────────

def gen_a1111(prompt: str) -> Image.Image:
    payload = {
        "prompt": prompt,
        "negative_prompt": "blurry, low quality, text, watermark, ugly, deformed, cropped",
        "width": 1280,
        "height": 720,
        "steps": 25,
        "cfg_scale": 7,
        "sampler_name": "DPM++ 2M Karras",
        "batch_size": 1,
    }
    r = requests.post("http://127.0.0.1:7860/sdapi/v1/txt2img", json=payload, timeout=120)
    r.raise_for_status()
    data = r.json()
    img_bytes = base64.b64decode(data["images"][0])
    return Image.open(io.BytesIO(img_bytes))


def gen_comfyui(prompt: str) -> Image.Image:
    """Simple ComfyUI text-to-image via basic workflow."""
    workflow = {
        "3": {"inputs": {"text": prompt, "clip": ["4", 1]}, "class_type": "CLIPTextEncode"},
        "4": {"inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"}, "class_type": "CheckpointLoaderSimple"},
        "5": {"inputs": {"text": "blurry, ugly, watermark", "clip": ["4", 1]}, "class_type": "CLIPTextEncode"},
        "6": {"inputs": {"width": 1280, "height": 720, "batch_size": 1}, "class_type": "EmptyLatentImage"},
        "7": {"inputs": {"seed": -1, "steps": 25, "cfg": 7, "sampler_name": "dpmpp_2m",
                          "scheduler": "karras", "denoise": 1,
                          "model": ["4", 0], "positive": ["3", 0],
                          "negative": ["5", 0], "latent_image": ["6", 0]},
              "class_type": "KSampler"},
        "8": {"inputs": {"samples": ["7", 0], "vae": ["4", 2]}, "class_type": "VAEDecode"},
        "9": {"inputs": {"images": ["8", 0], "filename_prefix": "thumb"},
              "class_type": "SaveImage"},
    }
    r = requests.post("http://127.0.0.1:8188/prompt",
                      json={"prompt": workflow}, timeout=120)
    r.raise_for_status()
    prompt_id = r.json()["prompt_id"]

    # Poll for result
    import time
    for _ in range(60):
        time.sleep(2)
        hist = requests.get(f"http://127.0.0.1:8188/history/{prompt_id}", timeout=10).json()
        if prompt_id in hist:
            outputs = hist[prompt_id]["outputs"]
            for node_id, node_output in outputs.items():
                if "images" in node_output:
                    img_info = node_output["images"][0]
                    img_r = requests.get(
                        f"http://127.0.0.1:8188/view?filename={img_info['filename']}"
                        f"&subfolder={img_info.get('subfolder','')}&type={img_info['type']}",
                        timeout=30
                    )
                    return Image.open(io.BytesIO(img_r.content))
    raise TimeoutError("ComfyUI generation timed out after 120s")


def gen_mcp_imagen(prompt: str) -> Image.Image:
    """
    Call mcp-imagen-go directly via STDIO (MCP protocol).
    Requires mcp-imagen-go binary in PATH and PROJECT_ID env var.
    Uses Imagen 4 via Vertex AI — highest quality option.
    """
    os.makedirs("/tmp/thumbnail_gen", exist_ok=True)

    mcp_request = json.dumps({
        "jsonrpc": "2.0",
        "method": "tools/call",
        "id": 1,
        "params": {
            "name": "imagen_t2i",
            "arguments": {
                "prompt": prompt,
                "aspect_ratio": "16:9",
                "number_of_images": 1,
                "output_directory": "/tmp/thumbnail_gen",
            }
        }
    })

    # Load PROJECT_ID from settings.json if not in env
    env = os.environ.copy()
    if not env.get("PROJECT_ID"):
        try:
            settings_path = os.path.expanduser("~/.gemini/settings.json")
            with open(settings_path) as f:
                settings = json.load(f)
            mcp_env = settings.get("mcpServers", {}).get("imagen", {}).get("env", {})
            env.update({k: v for k, v in mcp_env.items() if v and "YOUR_" not in v})
        except Exception:
            pass

    proc = subprocess.run(
        ["mcp-imagen-go"],
        input=mcp_request,
        capture_output=True,
        text=True,
        timeout=90,
        env=env
    )

    if proc.returncode != 0:
        raise RuntimeError(f"mcp-imagen-go failed: {proc.stderr[:500]}")

    try:
        response = json.loads(proc.stdout)
    except json.JSONDecodeError:
        # Some versions output multiple JSON lines — take last valid one
        for line in reversed(proc.stdout.strip().split("\n")):
            try:
                response = json.loads(line)
                break
            except Exception:
                continue
        else:
            raise RuntimeError("Could not parse mcp-imagen-go output")

    content = response.get("result", {}).get("content", [])

    for block in content:
        # Inline base64 image
        if block.get("type") == "image" and block.get("data"):
            img_bytes = base64.b64decode(block["data"])
            return Image.open(io.BytesIO(img_bytes))

        # File path returned as text
        if block.get("type") == "text":
            text = block.get("text", "")
            for token in text.split():
                token = token.strip(".,\"'")
                if token.endswith((".png", ".jpg", ".jpeg")) and os.path.exists(token):
                    return Image.open(token)

    # Check output directory for newly created files
    import glob, time
    recent = sorted(glob.glob("/tmp/thumbnail_gen/*.png"), key=os.path.getmtime, reverse=True)
    if recent:
        return Image.open(recent[0])

    raise ValueError("mcp-imagen-go returned no image data")


def gen_gemini_api(prompt: str) -> Image.Image:
    """
    Generate via Gemini API (Nano Banana 2 / gemini-3.1-flash-image-preview).
    Note: aspect ratio is requested in the prompt, not as a parameter.
    """
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    full_prompt = (
        f"{prompt}. "
        "Generate as a wide landscape 16:9 format, high resolution, "
        "professional YouTube thumbnail quality."
    )

    # Try models newest-first
    models = [
        "gemini-3.1-flash-image-preview",
        "gemini-2.5-flash-image-preview",
        "gemini-2.0-flash-exp",
    ]

    for model_id in models:
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=[full_prompt],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"]
                )
            )
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    img = Image.open(io.BytesIO(part.inline_data.data))
                    print(f"  ↳ Used model: {model_id}")
                    return img
        except Exception as e:
            print(f"  ↳ {model_id} failed: {e}")
            continue

    raise ValueError("All Gemini API models failed — check GEMINI_API_KEY and quota")


def gen_fal(prompt: str) -> Image.Image:
    import fal_client

    result = fal_client.subscribe(
        "fal-ai/flux/dev",
        arguments={
            "prompt": prompt,
            "image_size": {"width": 1280, "height": 720},
            "num_inference_steps": 28,
            "num_images": 1,
            "enable_safety_checker": True,
        }
    )
    img_url = result["images"][0]["url"]
    r = requests.get(img_url, timeout=60)
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content))


def gen_openai(prompt: str) -> Image.Image:
    from openai import OpenAI
    client = OpenAI()

    response = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        size="1536x1024",   # closest 16:9 available
        quality="standard",
        n=1,
    )
    img_bytes = base64.b64decode(response.data[0].b64_json)
    img = Image.open(io.BytesIO(img_bytes))
    # gpt-image-1 returns 1536×1024 — resize to exact YouTube spec
    return img.resize((1280, 720), Image.LANCZOS)


def gen_pillow_only(style: str, title: str) -> Image.Image:
    """
    Pure Pillow fallback — generates a styled graphic without any AI.
    Produces a usable thumbnail when no AI backend is available.
    """
    canvas = Image.new("RGB", (1280, 720))
    draw = ImageDraw.Draw(canvas)

    # Style-specific color palettes
    PALETTES = {
        "style_1_minimalism":  [(245,245,245), (220,220,220)],
        "style_6_cinematic":   [(8, 12, 25),   (40, 30, 60)],
        "style_11_anti":       [(5, 5, 8),     (20, 20, 30)],
        "style_4_whiteboard":  [(250,248,240),  (230,225,210)],
        "style_7_warped":      [(10, 5, 20),   (50, 10, 60)],
        "default":             [(15, 20, 40),  (40, 60, 100)],
    }
    colors = PALETTES.get(style, PALETTES["default"])

    # Vertical gradient
    for y in range(720):
        t = y / 719
        r_v = int(colors[0][0] * (1 - t) + colors[1][0] * t)
        g_v = int(colors[0][1] * (1 - t) + colors[1][1] * t)
        b_v = int(colors[0][2] * (1 - t) + colors[1][2] * t)
        draw.line([(0, y), (1280, y)], fill=(r_v, g_v, b_v))

    # Decorative diagonal accent lines
    accent = (80, 120, 200) if colors[0][0] < 50 else (150, 150, 160)
    for i in range(0, 1280, 120):
        draw.line([(i, 0), (i + 400, 720)], fill=accent, width=1)

    return canvas


# ─────────────────────────────────────────────────────────
# STYLE EFFECTS (Pillow post-processing)
# ─────────────────────────────────────────────────────────

def apply_style_effects(img: Image.Image, style: str) -> Image.Image:
    """Apply style-specific color grading and effects."""

    if style == "style_1_minimalism":
        img = ImageEnhance.Color(img).enhance(0.75)
        img = ImageEnhance.Brightness(img).enhance(1.05)

    elif style == "style_3_rainbow":
        img = ImageEnhance.Color(img).enhance(1.4)
        img = ImageEnhance.Contrast(img).enhance(1.1)

    elif style == "style_4_whiteboard":
        img = ImageEnhance.Color(img).enhance(0.65)
        # Warm tone shift
        r, g, b = img.split()
        r = ImageEnhance.Brightness(Image.merge("RGB", (r, r, r))).enhance(1.05).split()[0]
        img = Image.merge("RGB", (r, g, b))

    elif style == "style_6_cinematic":
        img = ImageEnhance.Color(img).enhance(0.85)
        img = ImageEnhance.Contrast(img).enhance(1.3)
        # Slight teal shadow / orange highlight look
        img = _apply_color_grade(img, shadow=(0, 5, 15), highlight=(15, 5, 0))

    elif style == "style_7_warped":
        # RGB channel shift for glitch effect
        r, g, b = img.split()
        r = r.transform(img.size, Image.AFFINE, (1, 0, 8, 0, 1, 0))
        b = b.transform(img.size, Image.AFFINE, (1, 0, -6, 0, 1, 2))
        img = Image.merge("RGB", (r, g, b))
        img = ImageEnhance.Contrast(img).enhance(1.2)

    elif style == "style_9_encyclopedia":
        img = ImageEnhance.Color(img).enhance(0.6)
        img = ImageEnhance.Brightness(img).enhance(1.1)

    elif style == "style_11_anti":
        img = ImageEnhance.Brightness(img).enhance(0.6)
        img = ImageEnhance.Contrast(img).enhance(1.5)

    else:
        # Default: moderate contrast boost
        img = ImageEnhance.Contrast(img).enhance(1.15)

    # Vignette applied to all styles
    img = _apply_vignette(img, strength=0.35)

    return img


def _apply_color_grade(img: Image.Image,
                        shadow=(0, 0, 0),
                        highlight=(0, 0, 0)) -> Image.Image:
    """Subtle shadow/highlight color grade (like LUTs)."""
    r, g, b = img.split()

    def grade_channel(channel, shadow_add, highlight_add):
        lut = []
        for i in range(256):
            t = i / 255.0
            val = i + int(shadow_add * (1 - t)) + int(highlight_add * t)
            lut.append(max(0, min(255, val)))
        return channel.point(lut)

    r = grade_channel(r, shadow[0], highlight[0])
    g = grade_channel(g, shadow[1], highlight[1])
    b = grade_channel(b, shadow[2], highlight[2])
    return Image.merge("RGB", (r, g, b))


def _apply_vignette(img: Image.Image, strength: float = 0.35) -> Image.Image:
    """Add subtle radial vignette to focus the eye toward center."""
    w, h = img.size
    mask = Image.new("L", (w, h), 255)
    draw = ImageDraw.Draw(mask)

    steps = min(w, h) // 2
    for i in range(steps):
        progress = i / steps
        alpha = int(255 * (progress + (1 - progress) * (1 - strength)))
        alpha = max(0, min(255, alpha))
        margin_x = int((1 - progress) * (w // 2))
        margin_y = int((1 - progress) * (h // 2))
        draw.ellipse(
            [margin_x, margin_y, w - margin_x, h - margin_y],
            fill=alpha
        )

    mask = mask.filter(ImageFilter.GaussianBlur(radius=40))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    img = Image.composite(black, img, mask)
    return img


# ─────────────────────────────────────────────────────────
# TEXT OVERLAY
# ─────────────────────────────────────────────────────────

FONT_PATHS = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-Bold.ttf",
]

# Styles where text should be omitted
NO_TEXT_STYLES = {"style_7_warped", "style_10_candid"}


def load_font(size: int):
    for fp in FONT_PATHS:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def add_text_overlay(img: Image.Image, text: str, style: str) -> Image.Image:
    """Add styled text overlay appropriate for each thumbnail style."""

    if not text or style in NO_TEXT_STYLES:
        return img

    # Truncate to 4 words max (per best-practice from THUMBNAILS.md)
    words = text.split()
    if len(words) > 4:
        text = " ".join(words[:4])

    w, h = img.size
    img = img.convert("RGBA")

    if style in ("style_6_cinematic", "style_11_anti"):
        return _text_centered_large(img, text, w, h)

    elif style in ("style_1_minimalism", "style_4_whiteboard"):
        return _text_clean_corner(img, text, w, h, style)

    elif style == "style_11_anti":
        return _text_centered_large(img, text, w, h)

    else:
        return _text_banner_strip(img, text, w, h)


def _text_centered_large(img, text, w, h):
    """Large centered text for cinematic/anti-thumbnail styles."""
    font = load_font(96)
    draw = ImageDraw.Draw(img)

    bbox = draw.textbbox((0, 0), text.upper(), font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x, y = (w - tw) // 2, (h - th) // 2

    # Glow / shadow effect
    for offset in [(6, 6), (-6, 6), (6, -6), (-6, -6)]:
        draw.text((x + offset[0], y + offset[1]), text.upper(),
                  font=font, fill=(0, 0, 0, 180))
    draw.text((x, y), text.upper(), font=font, fill=(255, 255, 255, 255))

    return img.convert("RGB")


def _text_clean_corner(img, text, w, h, style):
    """Clean minimal text for minimalism and whiteboard styles."""
    font = load_font(72)
    draw = ImageDraw.Draw(img)

    text_color = (30, 30, 30, 255) if style == "style_4_whiteboard" else (60, 60, 60, 255)
    bbox = draw.textbbox((0, 0), text, font=font)
    x, y = 60, h - (bbox[3] - bbox[1]) - 60

    # Subtle shadow
    draw.text((x + 2, y + 2), text, font=font, fill=(200, 200, 200, 120))
    draw.text((x, y), text, font=font, fill=text_color)

    return img.convert("RGB")


def _text_banner_strip(img, text, w, h):
    """Semi-transparent banner strip with high-contrast text."""
    font = load_font(82)
    draw_measure = ImageDraw.Draw(img)
    bbox = draw_measure.textbbox((0, 0), text.upper(), font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    padding_x, padding_y = 30, 18
    strip_h = th + padding_y * 2
    strip_y = h - strip_h - 40

    # Semi-transparent background strip
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle(
        [0, strip_y, w, strip_y + strip_h],
        fill=(0, 0, 0, 175)
    )
    img = Image.alpha_composite(img, overlay)

    # Text: shadow then main
    draw = ImageDraw.Draw(img)
    x = (w - tw) // 2
    y = strip_y + padding_y

    draw.text((x + 3, y + 3), text.upper(), font=font, fill=(0, 0, 0, 200))
    draw.text((x, y), text.upper(), font=font, fill=(255, 220, 50, 255))

    return img.convert("RGB")


# ─────────────────────────────────────────────────────────
# AUTO TEXT EXTRACTION
# ─────────────────────────────────────────────────────────

def auto_text(video_title: str, style: str) -> str:
    """Extract best text overlay from video title for given style."""
    if style in NO_TEXT_STYLES:
        return ""
    words = video_title.split()
    # For anti-thumbnail: keep number if present, else use 3 words
    if style == "style_11_anti":
        for word in words:
            if any(c.isdigit() for c in word):
                return word + (" Seconds" if "sec" not in video_title.lower() else "")
        return " ".join(words[:3])
    # General: first 4 impactful words
    stopwords = {"the", "a", "an", "how", "to", "i", "my", "is", "are", "was"}
    filtered = [w for w in words if w.lower() not in stopwords]
    result = filtered[:4] if filtered else words[:4]
    return " ".join(result)


# ─────────────────────────────────────────────────────────
# DEPENDENCY INSTALLER
# ─────────────────────────────────────────────────────────

def ensure_deps(backend: str):
    """Install required packages for the selected backend."""
    deps = ["Pillow", "requests"]

    if backend == "gemini_api":
        deps.append("google-genai")
    elif backend == "fal":
        deps.append("fal-client")
    elif backend == "openai":
        deps.append("openai")

    for dep in deps:
        try:
            if dep == "Pillow":
                import PIL
            elif dep == "requests":
                import requests
            elif dep == "google-genai":
                import google.genai
            elif dep == "fal-client":
                import fal_client
            elif dep == "openai":
                import openai
        except ImportError:
            print(f"Installing {dep}...")
            subprocess.run(
                [sys.executable, "-m", "pip", "install", dep,
                 "--break-system-packages", "-q"],
                check=True
            )


# ─────────────────────────────────────────────────────────
# MAIN ORCHESTRATOR
# ─────────────────────────────────────────────────────────

def main():
    print(f"\n🎨 Thumbnail Generator")
    print(f"   Title : {VIDEO_TITLE}")
    print(f"   Style : {STYLE}")
    print(f"   Output: {OUTPUT_PATH}\n")

    # 1. Detect backend
    backend = detect_backend()

    # 2. Install deps if needed
    ensure_deps(backend)

    # 3. Generate base image
    print(f"→ Generating base image...")
    generators = {
        "a1111":       gen_a1111,
        "comfyui":     gen_comfyui,
        "mcp_imagen":  gen_mcp_imagen,
        "gemini_api":  gen_gemini_api,
        "fal":         gen_fal,
        "openai":      gen_openai,
    }

    if backend == "pillow_only":
        base_img = gen_pillow_only(STYLE, VIDEO_TITLE)
    else:
        try:
            base_img = generators[backend](AI_PROMPT)
        except Exception as e:
            print(f"⚠ {backend} failed: {e}")
            print("  Falling back to Pillow-only...")
            base_img = gen_pillow_only(STYLE, VIDEO_TITLE)

    # 4. Normalize to exact 1280×720
    base_img = base_img.convert("RGB").resize((1280, 720), Image.LANCZOS)
    print(f"✓ Base image ready: {base_img.size}")

    # 5. Apply style effects
    print("→ Applying style effects...")
    base_img = apply_style_effects(base_img, STYLE)

    # 6. Determine text overlay
    text = TEXT_OVERLAY if TEXT_OVERLAY else auto_text(VIDEO_TITLE, STYLE)
    print(f"→ Text overlay: '{text}'" if text else "→ No text overlay (style preference)")

    # 7. Add text
    base_img = add_text_overlay(base_img, text, STYLE)

    # 8. Save
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    base_img.save(OUTPUT_PATH, "PNG", optimize=True)

    size_kb = os.path.getsize(OUTPUT_PATH) // 1024
    print(f"\n✅ Saved: {OUTPUT_PATH} ({size_kb} KB, 1280×720)")


if __name__ == "__main__":
    main()
```

---

## Agent Execution Protocol

When the user asks for a thumbnail, the agent follows these steps:

### Step 1 — Parse
Extract from message:
- `VIDEO_TITLE` — the video title or topic description
- `VIDEO_NICHE` — category (tutorial, review, travel, etc.)
- `STYLE` — if explicitly mentioned; otherwise auto-select
- `TEXT_OVERLAY` — specific text if mentioned (max 4 words); else leave empty

### Step 2 — Select Style
```python
style = select_style(VIDEO_NICHE, style_override=None)
```

### Step 3 — Build AI Prompt
Use the style template from "The 11 Styles" section above.
Append universal quality suffix:
```
", professional YouTube thumbnail, vibrant high contrast, cinematic quality,
sharp focus, award-winning composition"
```

### Step 4 — Fill Script Template
Replace all FILL_ placeholders in the Python script above with actual values.

### Step 5 — Execute
```bash
pip install Pillow requests --break-system-packages -q
python3 /home/claude/generate_thumbnail.py
```

### Step 6 — Verify & Present
```python
assert os.path.exists("/mnt/user-data/outputs/thumbnail.png")
assert os.path.getsize("/mnt/user-data/outputs/thumbnail.png") > 50_000
```
Then call `present_files` tool with the output path.
Briefly tell the user which style was chosen and why (1 sentence).

---

## Style Prompt Templates (Reference Card)
```python
STYLE_PROMPTS = {
    "style_1_minimalism": (
        "{subject}, minimalist product photography, pure white background, "
        "single centered subject, dramatic soft studio lighting, ultra clean"
    ),
    "style_2_surround": (
        "{subject} dead center, multiple {objects} arranged in perfect organized "
        "circle around center, controlled chaos, vibrant, top-down angle"
    ),
    "style_3_rainbow": (
        "flat lay of {items} in ranking order, color gradient red to blue, "
        "product photography, clean background, vivid colors"
    ),
    "style_4_whiteboard": (
        "hand-drawn diagram on real whiteboard explaining {concept}, chalk markers, "
        "rough sketchy authentic educational style, classroom feel"
    ),
    "style_5_ui_framing": (
        "realistic screenshot mockup of {platform} UI about {topic}, "
        "exact platform styling, authentic spacing and fonts, credible interface"
    ),
    "style_6_cinematic": (
        "cinematic movie still about {subject}, dramatic chiaroscuro lighting, "
        "film grain, anamorphic lens flare, shallow depth of field"
    ),
    "style_7_warped": (
        "double exposure portrait, digital glitch effect, {emotion} face merged "
        "with {concept}, surreal distortion, moody dark tones"
    ),
    "style_8_maximalist": (
        "aerial flat lay of complete collection of all {items}, perfectly organized, "
        "every single item visible, product catalog photography"
    ),
    "style_9_encyclopedia": (
        "flat icon illustration grid of {topic} elements, consistent icon shapes, "
        "high contrast on white background, educational infographic style"
    ),
    "style_10_candid": (
        "candid authentic moment of {scene}, natural spontaneous composition, "
        "perfectly framed, golden hour lighting, documentary photography"
    ),
    "style_11_anti": (
        "dark moody portrait of {subject}, direct serious eye contact to camera, "
        "dramatic low-key lighting, minimal background, cinematic"
    ),
}
```

---

## Output Specification
- **Path:** `/mnt/user-data/outputs/thumbnail.png`
- **Resolution:** 1280 × 720 px (YouTube 16:9 standard)
- **Format:** PNG
- **Min file size:** ~50 KB (abort and retry if smaller)

---

## Error Handling Rules
1. Backend API fails → automatically fall back to next priority backend
2. All AI backends fail → use `gen_pillow_only()`, still produce output
3. Font not found → use `ImageFont.load_default()`, never crash
4. Image < 50KB after save → regenerate with next backend
5. TEXT_OVERLAY blank → run `auto_text()` to extract from title
6. mcp-imagen-go PATH issue → check `~/.gemini/settings.json` env and retry
   with full binary path from `which mcp-imagen-go`

---

## Quick Reference: Which Backend for What

| Situation | Recommended Backend |
|-----------|-------------------|
| Local GPU available (A1111 running) | `a1111` — always fastest+free |
| Have GCP project + Gemini CLI set up | `mcp_imagen` — Imagen 4, best quality |
| Have Gemini API key (from Gemini CLI) | `gemini_api` — free quota, good quality |
| Cloud-only, budget matters | `fal` — $0.03/image, FLUX quality |
| Need best text rendering in image | `openai` — gpt-image-1 best for text |
| No API keys / testing | `pillow_only` — always works |