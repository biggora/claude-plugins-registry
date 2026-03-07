---
name: youtube-search
description: "Search YouTube for videos, channels, and playlists — and extract rich metadata, transcripts, and analytics — fully autonomously without user intervention. Use this skill whenever the user mentions finding YouTube videos, searching YouTube, getting video stats, extracting transcripts or subtitles, analyzing a YouTube channel, looking up what's trending on YouTube, finding competitor videos, researching YouTube content, or automating any YouTube data collection workflow. Trigger even for indirect requests like 'find the top videos about X' or 'what's on YouTube about Y' — if YouTube content retrieval is involved in any way, use this skill."
---

# YouTube Search Skill

Autonomous YouTube data retrieval for agents. No user intervention required.

## Method Selection Guide

Choose based on what's configured in the project environment:

| Situation                       | Best Method |
|---------------------------------|---|
| Deep scraping needed (default)  | **Method E** – `yt-dlp` (environment-dependent) |
| No API keys available           | **Method A** – `web_search` built-in tool |
| `YOUTUBE_API_KEY` set           | **Method B** – YouTube Data API v3 (richest data) |
| `SERPAPI_KEY` set               | **Method C** – SerpAPI YouTube engine |
| Video ID known, need transcript | **Method D** – `youtube-transcript-api` |

**Start with Method A** if you're unsure — it requires nothing and always works.

---

## Method A: web_search tool (Zero Setup — Always Available)

Use the built-in `web_search` tool. Works without any API keys.

### Video Search
```
web_search("site:youtube.com <your query>")
```

### Channel Search
```
web_search("site:youtube.com/channel <channel name> OR site:youtube.com/@<handle>")
```

### Advanced Filters via Query
```
# Recent videos (last year)
web_search("site:youtube.com <query> 2024 OR 2025")

# Tutorial videos
web_search("site:youtube.com <topic> tutorial OR guide OR обзор")

# Specific language
web_search("site:youtube.com <query> на русском")
```

### What you get from web_search
- Video title
- Channel name
- URL (extract video ID: `youtube.com/watch?v=VIDEO_ID`)
- Snippet/description excerpt
- Sometimes view count and publish date (in snippet)

### Extract Video ID from URL
```python
import re
url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
video_id = re.search(r'v=([^&]+)', url).group(1)
# or from youtu.be links:
video_id = re.search(r'youtu\.be/([^?]+)', url).group(1)
```

**Limitation:** No structured JSON, metadata is text-parsed. For richer data, use Method B.

---

## Method B: YouTube Data API v3 (Recommended for Production)

**Requires:** `YOUTUBE_API_KEY` environment variable (free, 10,000 units/day quota).  
Get key: https://console.cloud.google.com → Enable "YouTube Data API v3" → Create API key.

### Search Videos
```python
import requests, os

API_KEY = os.environ.get("YOUTUBE_API_KEY")
BASE = "https://www.googleapis.com/youtube/v3"

def youtube_search(query, max_results=10, order="relevance", 
                   video_duration=None, published_after=None, lang=None):
    """
    order: relevance | date | viewCount | rating | title
    video_duration: short (<4min) | medium (4-20min) | long (>20min)
    published_after: ISO 8601 e.g. "2024-01-01T00:00:00Z"
    lang: ISO 639-1 e.g. "ru", "en"
    """
    params = {
        "part": "snippet",
        "q": query,
        "maxResults": max_results,
        "type": "video",
        "order": order,
        "key": API_KEY,
    }
    if video_duration:
        params["videoDuration"] = video_duration
    if published_after:
        params["publishedAfter"] = published_after
    if lang:
        params["relevanceLanguage"] = lang

    r = requests.get(f"{BASE}/search", params=params)
    r.raise_for_status()
    items = r.json().get("items", [])
    
    return [{
        "video_id": item["id"]["videoId"],
        "title": item["snippet"]["title"],
        "channel": item["snippet"]["channelTitle"],
        "channel_id": item["snippet"]["channelId"],
        "description": item["snippet"]["description"],
        "published_at": item["snippet"]["publishedAt"],
        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
        "url": f"https://youtube.com/watch?v={item['id']['videoId']}"
    } for item in items if item["id"].get("videoId")]
```

### Get Video Statistics (views, likes, duration)
```python
def get_video_stats(video_ids: list):
    """Pass list of video IDs, get stats back. Costs 1 quota unit per call."""
    ids = ",".join(video_ids[:50])  # max 50 per request
    params = {
        "part": "statistics,contentDetails,snippet",
        "id": ids,
        "key": API_KEY,
    }
    r = requests.get(f"{BASE}/videos", params=params)
    r.raise_for_status()
    
    results = []
    for item in r.json().get("items", []):
        stats = item.get("statistics", {})
        content = item.get("contentDetails", {})
        results.append({
            "video_id": item["id"],
            "title": item["snippet"]["title"],
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)),
            "comments": int(stats.get("commentCount", 0)),
            "duration_iso": content.get("duration"),  # e.g. "PT5M30S"
            "tags": item["snippet"].get("tags", []),
        })
    return results
```

### Parse ISO 8601 Duration
```python
import re
def parse_duration(iso_duration):
    """Convert PT5M30S → 330 seconds"""
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration)
    if not match: return 0
    h, m, s = [int(x or 0) for x in match.groups()]
    return h * 3600 + m * 60 + s
```

### Channel Search & Stats
```python
def search_channel(channel_name, max_results=5):
    params = {
        "part": "snippet",
        "q": channel_name,
        "type": "channel",
        "maxResults": max_results,
        "key": API_KEY,
    }
    r = requests.get(f"{BASE}/search", params=params)
    channel_ids = [item["id"]["channelId"] for item in r.json().get("items", [])]
    
    # Get channel stats
    params2 = {"part": "statistics,snippet", "id": ",".join(channel_ids), "key": API_KEY}
    r2 = requests.get(f"{BASE}/channels", params=params2)
    return [{
        "channel_id": ch["id"],
        "name": ch["snippet"]["title"],
        "subscribers": int(ch["statistics"].get("subscriberCount", 0)),
        "total_views": int(ch["statistics"].get("viewCount", 0)),
        "video_count": int(ch["statistics"].get("videoCount", 0)),
        "url": f"https://youtube.com/channel/{ch['id']}"
    } for ch in r2.json().get("items", [])]
```

### Quota Costs (10,000 units/day free)
| Operation | Cost |
|---|---|
| search.list | 100 units |
| videos.list (stats) | 1 unit |
| channels.list | 1 unit |
| playlists.list | 1 unit |

**Tip:** Search = 100 units. Get stats for 50 videos = 1 unit. Always batch `videos.list` calls.

---

## Method C: SerpAPI (Structured Scraping, No Quota Issues)

**Requires:** `SERPAPI_KEY` environment variable.  
Free tier: 100 searches/month. Paid plans available.

```python
import requests, os

def serpapi_youtube_search(query, max_results=10, lang="ru"):
    params = {
        "engine": "youtube",
        "search_query": query,
        "api_key": os.environ.get("SERPAPI_KEY"),
        "hl": lang,  # interface language
    }
    r = requests.get("https://serpapi.com/search", params=params)
    r.raise_for_status()
    
    results = []
    for item in r.json().get("video_results", [])[:max_results]:
        results.append({
            "title": item.get("title"),
            "video_id": item.get("id") or item.get("link", "").split("v=")[-1],
            "url": item.get("link"),
            "channel": item.get("channel", {}).get("name"),
            "views": item.get("views"),
            "duration": item.get("length"),
            "published": item.get("published_date"),
            "description": item.get("description"),
            "thumbnail": item.get("thumbnail", {}).get("static"),
        })
    return results
```

**Advantage over YouTube API:** Returns views, duration, publish date directly from search — no extra API calls needed.

---

## Method D: youtube-transcript-api (Transcripts by Video ID)

**Requires:** `pip install youtube-transcript-api --break-system-packages`  
No API key needed.

```python
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

def get_transcript(video_id, languages=["ru", "en"]):
    """
    Returns full transcript as string.
    languages: preference order, falls back to auto-generated.
    """
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try preferred languages first
        try:
            transcript = transcript_list.find_transcript(languages)
        except NoTranscriptFound:
            # Fall back to any available
            transcript = transcript_list.find_generated_transcript(
                transcript_list._generated_transcripts.keys()
            )
        
        entries = transcript.fetch()
        full_text = " ".join([e["text"] for e in entries])
        return {
            "video_id": video_id,
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "text": full_text,
            "entries": entries  # list of {text, start, duration}
        }
    except TranscriptsDisabled:
        return {"error": "Transcripts disabled for this video"}
    except Exception as e:
        return {"error": str(e)}

def get_available_languages(video_id):
    """List all available transcript languages for a video."""
    tl = YouTubeTranscriptApi.list_transcripts(video_id)
    return [{"code": t.language_code, "name": t.language, "generated": t.is_generated} 
            for t in tl]
```

**Use case:** After finding video IDs via Method A or B, extract full text content for analysis, summarization, or content research.

---

## Method E: yt-dlp (Deep Metadata + Transcripts)

**Requires:** `pip install yt-dlp --break-system-packages`  
No API key. May be blocked in sandboxed environments — test first.

```python
import yt_dlp, json

def ytdlp_search(query, max_results=10):
    """Search YouTube with yt-dlp. Returns rich metadata."""
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        results = ydl.extract_info(f"ytsearch{max_results}:{query}", download=False)
    
    return [{
        "title": v.get("title"),
        "video_id": v.get("id"),
        "url": f"https://youtube.com/watch?v={v.get('id')}",
        "duration": v.get("duration"),
        "view_count": v.get("view_count"),
        "channel": v.get("channel"),
        "upload_date": v.get("upload_date"),
    } for v in results.get("entries", []) if v]

def ytdlp_get_video_info(video_url):
    """Get full metadata for a single video."""
    ydl_opts = {"quiet": True, "no_warnings": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
    return info

def ytdlp_get_subtitles(video_url, lang="ru"):
    """Download and return subtitle text."""
    import tempfile, os
    with tempfile.TemporaryDirectory() as tmpdir:
        ydl_opts = {
            "quiet": True,
            "writesubtitles": True,
            "writeautomaticsub": True,
            "subtitleslangs": [lang, "en"],
            "skip_download": True,
            "outtmpl": f"{tmpdir}/%(id)s.%(ext)s",
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        
        for f in os.listdir(tmpdir):
            if f.endswith(".vtt") or f.endswith(".srt"):
                return open(os.path.join(tmpdir, f)).read()
    return None
```

**Note:** yt-dlp makes direct requests to YouTube — may be blocked in restricted network environments. Always test with a quick `yt-dlp --version` call first.

---

## Recommended Workflow for Automation Projects

### Pattern 1: Competitor/Topic Research
```python
# 1. Search for videos
results = youtube_search("AI сервисы обзор", max_results=20, 
                         order="viewCount", lang="ru")

# 2. Enrich with stats
video_ids = [v["video_id"] for v in results]
stats = get_video_stats(video_ids)

# 3. Get transcripts for top videos
top_videos = sorted(stats, key=lambda x: x["views"], reverse=True)[:5]
for v in top_videos:
    transcript = get_transcript(v["video_id"], languages=["ru"])
    # analyze, summarize, extract keywords...
```

### Pattern 2: Zero-Config Content Discovery (web_search only)
```python
# No setup required - use built-in web_search tool
# web_search("site:youtube.com AI сервисы обзор 2025")
# Parse results, extract video IDs, then use transcript API if needed
```

### Pattern 3: Channel Monitoring
```python
# Find channel
channels = search_channel("название канала")
channel_id = channels[0]["channel_id"]

# Get latest videos from channel
params = {
    "part": "snippet",
    "channelId": channel_id,
    "order": "date",
    "maxResults": 10,
    "type": "video",
    "key": API_KEY,
}
r = requests.get(f"{BASE}/search", params=params)
```

---

## Environment Setup Checklist

```bash
# Required for Method B (YouTube Data API)
export YOUTUBE_API_KEY="AIza..."

# Required for Method C (SerpAPI)
export SERPAPI_KEY="..."

# Required for Methods D & E (Python libraries)
pip install youtube-transcript-api yt-dlp --break-system-packages
```

---

## See Also
- `references/youtube-api-quota.md` — Quota optimization strategies
- `references/parsing-examples.md` — Real-world parsing examples for Russian-language content