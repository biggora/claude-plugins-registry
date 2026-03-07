# Parsing Examples — Russian YouTube Content

## Example 1: Find top Russian AI channels (Method B)

```python
import requests, os

API_KEY = os.environ.get("YOUTUBE_API_KEY")
BASE = "https://www.googleapis.com/youtube/v3"

queries = ["AI сервисы обзор", "нейросети для работы", "искусственный интеллект обзор"]
all_channels = {}

for q in queries:
    r = requests.get(f"{BASE}/search", params={
        "part": "snippet",
        "q": q,
        "type": "video",
        "maxResults": 20,
        "relevanceLanguage": "ru",
        "order": "viewCount",
        "key": API_KEY,
    })
    for item in r.json().get("items", []):
        ch_id = item["snippet"]["channelId"]
        ch_name = item["snippet"]["channelTitle"]
        if ch_id not in all_channels:
            all_channels[ch_id] = {"name": ch_name, "video_count": 0}
        all_channels[ch_id]["video_count"] += 1

# Get subscriber counts for top channels
top_ids = list(all_channels.keys())[:50]
r2 = requests.get(f"{BASE}/channels", params={
    "part": "statistics",
    "id": ",".join(top_ids),
    "key": API_KEY,
})
for ch in r2.json().get("items", []):
    all_channels[ch["id"]]["subscribers"] = int(
        ch["statistics"].get("subscriberCount", 0)
    )

# Sort by subscribers
ranked = sorted(all_channels.values(), key=lambda x: x.get("subscribers", 0), reverse=True)
for i, ch in enumerate(ranked[:10], 1):
    print(f"{i}. {ch['name']} — {ch.get('subscribers', 0):,} подписчиков")
```

## Example 2: Video Research for Affiliate Review (Method A + D)

```python
# Step 1: Find videos via web_search (no API key)
# web_search("site:youtube.com midjourney обзор 2025 на русском")
# → Returns list of YouTube URLs

# Step 2: Extract video IDs
import re
urls = [
    "https://www.youtube.com/watch?v=ABC123",
    "https://youtu.be/XYZ789",
]

def extract_id(url):
    m = re.search(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})', url)
    return m.group(1) if m else None

video_ids = [extract_id(u) for u in urls if extract_id(u)]

# Step 3: Get transcripts
from youtube_transcript_api import YouTubeTranscriptApi

for vid_id in video_ids:
    try:
        entries = YouTubeTranscriptApi.get_transcript(vid_id, languages=["ru", "en"])
        text = " ".join([e["text"] for e in entries])
        # Now pass to Claude for summarization or keyword extraction
        print(f"Video {vid_id}: {len(text)} chars")
    except Exception as e:
        print(f"Video {vid_id}: {e}")
```

## Example 3: Trending Videos Last 7 Days (Method B)

```python
from datetime import datetime, timedelta

week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"

results = []
for query in ["ChatGPT", "Midjourney", "Stable Diffusion", "Claude AI", "Sora"]:
    r = requests.get(f"{BASE}/search", params={
        "part": "snippet",
        "q": f"{query} обзор OR туториал OR как использовать",
        "type": "video",
        "maxResults": 5,
        "relevanceLanguage": "ru",
        "publishedAfter": week_ago,
        "order": "viewCount",
        "key": API_KEY,
    })
    results.extend(r.json().get("items", []))

# Get stats for all found videos in one batch call (1 quota unit!)
ids = [item["id"]["videoId"] for item in results if item["id"].get("videoId")]
stats_r = requests.get(f"{BASE}/videos", params={
    "part": "statistics,contentDetails",
    "id": ",".join(ids),
    "fields": "items(id,statistics(viewCount,likeCount),contentDetails(duration))",
    "key": API_KEY,
})

stats_map = {
    item["id"]: item 
    for item in stats_r.json().get("items", [])
}

# Combine and sort
combined = []
for item in results:
    vid_id = item["id"].get("videoId")
    if vid_id and vid_id in stats_map:
        combined.append({
            "title": item["snippet"]["title"],
            "channel": item["snippet"]["channelTitle"],
            "url": f"https://youtube.com/watch?v={vid_id}",
            "views": int(stats_map[vid_id]["statistics"].get("viewCount", 0)),
        })

for v in sorted(combined, key=lambda x: x["views"], reverse=True)[:10]:
    print(f"{v['views']:,} просмотров — {v['title']} ({v['channel']})")
```

## Example 4: SerpAPI for Rich Structured Data (Method C)

```python
import requests, os

def search_youtube_serp(query, num=10):
    r = requests.get("https://serpapi.com/search", params={
        "engine": "youtube",
        "search_query": query,
        "api_key": os.environ.get("SERPAPI_KEY"),
        "hl": "ru",
    })
    videos = r.json().get("video_results", [])[:num]
    return [{
        "title": v.get("title"),
        "url": v.get("link"),
        "channel": v.get("channel", {}).get("name"),
        "views": v.get("views"),          # Already parsed: "1.2M views"
        "duration": v.get("length"),       # "12:34"
        "published": v.get("published_date"),  # "3 months ago"
        "description": v.get("description"),
    } for v in videos]

results = search_youtube_serp("Midjourney v7 обзор", num=10)
for v in results:
    print(f"{v['title']} | {v['views']} | {v['channel']}")
```