# YouTube Data API v3 — Quota Optimization

## Daily Quota: 10,000 units (free tier)

## Quota Cost Table
| Method | Quota Cost | Notes |
|---|---|---|
| search.list | **100 units** | Most expensive — use sparingly |
| videos.list | 1 unit per call | Batch up to 50 IDs per call |
| channels.list | 1 unit per call | Batch up to 50 IDs |
| playlists.list | 1 unit per call | |
| playlistItems.list | 1 unit per call | |
| commentThreads.list | 1 unit per call | |

## Optimization Strategies

### 1. Minimize search.list calls
- One `search.list` = 100 units = 1% of daily quota
- Max 100 searches/day on free tier
- Cache results when possible

### 2. Batch videos.list
```python
# BAD: 50 separate calls = 50 units
for video_id in video_ids:
    get_stats(video_id)  # 1 unit each

# GOOD: 1 call = 1 unit
get_stats(",".join(video_ids[:50]))  # batch all at once
```

### 3. Use `fields` parameter to reduce response size
```python
params = {
    "part": "statistics",
    "id": video_ids,
    "fields": "items(id,statistics(viewCount,likeCount))",  # only what you need
    "key": API_KEY,
}
```

### 4. Cache channel IDs
Channel IDs don't change. Store them after first lookup:
```python
CHANNEL_CACHE = {}  # {"Channel Name": "UCxxxxxxxx"}
```

### 5. Use `publishedAfter` to limit search scope
Instead of sorting by date after fetching, filter at API level:
```python
from datetime import datetime, timedelta
week_ago = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
params["publishedAfter"] = week_ago
```

## Quota Monitoring
```python
# Quota usage is visible at:
# https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
# No programmatic way to check remaining quota via API itself.

# Implement local counter:
quota_used = 0
def tracked_search(*args, **kwargs):
    global quota_used
    quota_used += 100  # search costs 100
    return youtube_search(*args, **kwargs)
```

## Error Handling
```python
from googleapiclient.errors import HttpError

try:
    results = youtube_search(query)
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 403:
        error_body = e.response.json()
        if "quotaExceeded" in str(error_body):
            # Switch to Method A (web_search) as fallback
            results = fallback_web_search(query)
        elif "keyInvalid" in str(error_body):
            raise ValueError("Invalid YouTube API key")
    raise
```