# Hover Hook: matched cover and opening

## Source and what was actually checked

[The New Thumbnail Trick For More Views — vidIQ](https://www.youtube.com/watch?v=XqrMMgQMUdk)
(7:03), reviewed on 2026-11-07. `agy`/Gemini first analyzed retrieved English
YouTube auto-captions. In a user-authorized follow-up, `agy 1.5.3` ran with
`--mode=plan --dangerously-skip-permissions`, reported reading the downloaded MP4
through `read_file`, and cross-checked the captions. That run returned `SUCCESS`
with no denied actions. Visual examples were also checked in sampled video
frames. This demonstrates a local-media route, not guaranteed direct YouTube URL
ingestion. Auto-captions and model observations still require verification.
The one-off permission flag is an execution record, not a default requirement
or an instruction to change global permission settings.

Timestamped source findings:

| Time | Tutorial instruction or finding |
| --- | --- |
| 1:12–2:28 | The cover matches the opening; text stays present as the scene moves. Faceless object demonstrations can work too. |
| 2:45–3:45 | Compose before filming, leave room for words, add graphics in the editor, then export the composited first frame. Check readability at thumbnail size. |
| 3:52–4:36 | Start meaningful action immediately and plan the following 15 seconds; a seamless transition into a generic greeting is insufficient. |
| 4:47–6:16 | Five old-video comparisons had mixed results: one first-frame win, another leaning that way while still running, and three original-thumbnail wins. These are watch-time-share results, not a universal CTR increase. |
| 6:18–6:51 | Test an old video's first frame only if it is a strong cover; graphics added only to the cover disappear when playback begins. |

The procedure and cooking examples below are this skill's implementation of
those principles. The source does not demonstrate an AI animation service.

## Define the deliverable before generating

Choose the applicable route:

| Inputs | Work to perform |
| --- | --- |
| New video, not filmed | Design the shared opening composition, filming setup, text/graphics, and first action; deliver a production plan. |
| Editable footage/master | Composite the real opening, export its first frame, and inspect a short motion preview. |
| Already-published video | Inspect the existing first frame and opening. Prepare a thumbnail candidate only if it works without pretending the published frames changed. |
| Only a topic or AI image | Deliver a labeled concept and a shot/motion plan. Actual footage or an explicitly authorized video-generation/editing step is still needed. |

Use the requested title, audience, language, dish, footage, and output directory.
Specify a few parallel fields in the production plan: viewer promise, starting
composition, exact optional text, first visible action, next 15 seconds, inputs
still needed, and checks. Do not invent a dish/result absent from the video.

## Design and render a shared opening

1. Choose one clear visual promise that also reads as a still. For a cooking
   channel, a finished dish, visible texture, or an anticipated cut/pull can work.
   Leave room for text only if text is useful; no text is a valid choice.
2. Establish the opening pose/layout and camera crop. The first action must be
   visually understandable while muted. Keep the real dish, props, hands, and
   background continuous rather than switching to an unrelated shot at playback.
3. In an editor, apply the chosen titles, graphics, crop, and grade to the
   opening video itself. Preserve their position and appearance when motion
   starts; time later changes deliberately. There is no source-mandated duration
   for holding text. Do not apply effects or auto-generated title text solely to
   the exported still using the static generator.
4. Export the thumbnail from the first displayed frame of that finished opening.
   Use a frame export, not a screenshot containing editor controls. Keep the
   source master; write new outputs without overwriting it.
5. Review the following 15 seconds as a hook: show the promised result/action and
   lead into the recipe rather than a logo, greeting, or subscription request.

Cooking adaptation, not a quotation from the tutorial:

> Opening still: actual baked pasta in its serving dish, a fork poised at the
> edge, and optional short text already in the timeline. Motion: the fork lifts
> a serving and shows the texture; the next shots explain the cooking payoff.

For `agy`-generated concepts, follow
[the Gemini CLI skill](../../../.agents/skills/gemini-cli/SKILL.md). Use the
native signed-in Google image tool if that is the requested route. Inspect its
actual file and dimensions; prompts and CLI prose do not prove 16:9. Plan how
the concept will be reproduced in footage or matched by authorized editing.
Do not silently purchase API generation or switch providers.

## Local export recipe for an already-composited opening

These commands use installed FFmpeg; they do not add titles or create motion.
`edited-opening.mp4` must already contain the intended opening and graphics.
Choose an unused output directory. Run from the directory containing that file:

```powershell
$source = (Resolve-Path -LiteralPath './edited-opening.mp4').Path
$outDir = Join-Path (Get-Location) 'hover-hook-output'
New-Item -ItemType Directory -Path $outDir -ErrorAction Stop | Out-Null
$thumbnail = Join-Path $outDir 'thumbnail.png'
$preview = Join-Path $outDir 'hover-preview.mp4'
$framing = 'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1'
ffmpeg -hide_banner -loglevel error -n -i $source -vf $framing -frames:v 1 $thumbnail
if ($LASTEXITCODE -ne 0) { throw 'Thumbnail export failed.' }
ffmpeg -hide_banner -loglevel error -n -i $source -t 15 -an -vf $framing -c:v libx264 -crf 18 -pix_fmt yuv420p $preview
if ($LASTEXITCODE -ne 0) { throw 'Opening preview export failed.' }
```

The same framing is applied to both outputs without stretching. This recipe
center-crops; inspect edges for clipped food, hands, or words. If a different
crop/padding is needed, change it consistently for both outputs. The muted MP4
is a local review artifact; it is not a separate YouTube thumbnail upload. It
does not modify or publish the source video. Short sources produce shorter
previews: report the measured duration rather than promising 15 seconds.

## Verify the pair

- Decode the PNG and confirm its actual width/height (target 1280×720), then
  inspect the MP4's dimensions and duration. Example with installed `ffprobe`:

  ```powershell
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json $thumbnail
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of json $preview
  ```

- Compare the cover with the first displayed video frame at the same scale.
  Check subject, camera crop, titles, graphics, colors, and safe margins.
  Account for normal compression differences; do not demand byte-identical PNG
  and encoded video pixels. The still must come from the actual intended start,
  not a more attractive later frame mislabeled as frame zero.
- Play the muted opening and inspect when motion begins and whether titles
  vanish, positions jump, or a black frame/logo interrupts the transition.
  Check that the first action and subsequent recipe hook deliver the promise.
- Inspect a small feed-size rendering as well as full size. If the static cover
  is weak, motion does not excuse it. A file-size threshold does not establish
  visual quality; do not re-generate just because a valid PNG is small.
- Report absolute paths, actual dimensions/duration, and any missing footage or
  incomplete checks. Return a plan/concept as such, never as a completed pair.

## YouTube playback and test limits

A custom cover is still an image. The moving effect depends on playback and
viewer settings. [Inline playback](https://support.google.com/youtube/answer/7640367?hl=en)
can play video muted while browsing; the separate
[three-second preview](https://support.google.com/youtube/answer/7074781?hl=en)
can use an automatically selected segment from the first half. Do not promise
that every surface starts at the first frame or lets the creator upload a
separate hover clip. A local transition check proves only the authored pair.

For existing uploads, preserve the original cover as a comparison candidate.
Offer an experiment only when the frame is a good cover on its own; do not bulk
replace thumbnails or publish changes without the user's task authorizing it.
Treat watch-time share, CTR, and early retention as distinct metrics. The
[YouTube Test & Compare announcement](https://support.google.com/youtube/thread/279488115?hl=en)
describes selection by watch-time share; neither the tutorial's examples nor
small or unfinished tests prove a guaranteed improvement for another channel.
