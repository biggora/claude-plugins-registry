---
name: ai-detector
description: "Judge whether a text was written by an AI (ChatGPT, Claude, Gemini, any LLM) or by a human, and return a calibrated verdict backed by quoted evidence, human counter-signals and honest limits. Use whenever the user asks if something is AI-generated, ChatGPT-written, machine-written or 'written by a bot', wants a text checked for signs of AI writing, disputes an AI-detector score (GPTZero, Turnitin, Originality.ai), suspects a student essay, Wikipedia draft, review, cover letter, article or forum post of being LLM output, or asks how to tell AI text apart. Also trigger on RU requests such as 'это написал ChatGPT?', 'проверь текст на ИИ', 'сгенерировано нейросетью или нет', 'определи, писал ли человек'. Do not use for rewriting text to sound more human or for plagiarism checks against sources."
metadata:
  version: 1.1.0
---

# AI Detector

Decide how likely it is that a text was produced by a large language model, show the evidence, and say plainly what cannot be known. The goal is a verdict a careful human reviewer could check and defend, not a magic percentage.

Two facts shape everything below:

- **Style alone never proves authorship.** Purpose-built detectors stay under 80% accuracy in independent tests, flag non-native English writers at very high rates, and are beaten by light paraphrasing. People judging by "vibe" do about as well as chance. What you *can* do well is find concrete, checkable evidence and weigh it honestly.
- **Signs come in very different strengths.** One leftover chatbot phrase ("As of my last knowledge update…") outweighs fifty instances of "crucial". Count evidence by tier, not by volume.

## Workflow

### 1. Gather the text and its context

Read the whole text (open files or URLs the user points to). Note what affects interpretation, and ask only if a missing fact would change the verdict and you cannot proceed without it:

- **Genre and setting**: school essay, Wikipedia draft, marketing copy, email, forum post, review, academic paper, code comments. Many genres are formulaic by nature.
- **Language and writer**: native or non-native writer, translated text, age/level of the writer.
- **Date**: text demonstrably written before ChatGPT's public launch (30 November 2022) is not LLM output, whatever it sounds like. Archived versions, document metadata or edit history settle this better than any style read. Dates also matter for era-specific signs (see the catalogue).
- **Baseline**: earlier writing by the same person, drafts, version history. A sudden jump in polish or a shift in voice is meaningful; a text compared to nothing is not.
- **Stakes**: grading, hiring, moderation, a Wikipedia deletion. Higher stakes call for more caution in the wording and a process recommendation, not just a verdict.

Very short texts (under ~150 words), lists, and boilerplate rarely support anything beyond "inconclusive".

### 2. Look for Tier 1 evidence: artifacts (near-conclusive)

These are things humans essentially never write and that come from copying a chatbot reply:

- Chatbot self-reference or disclaimers: "As an AI language model", "As of my last knowledge update", "I don't have access to real-time data".
- Text addressed to the person who prompted it: "Certainly! Here is your article", "I hope this helps", "Let me know if you'd like me to adjust the tone", "Feel free to customize".
- Placeholders left unfilled: "[Your Name]", "[insert statistic]", "INSERT_URL", "2025-XX-XX".
- Tool and citation residue: `contentReference[oaicite:0]`, `turn0search0`, `【4†source】` markers, Gemini's `<mark>` highlight tags. Tracking parameters such as `utm_source=chatgpt.com`, `utm_source=openai` or `referrer=grok.com` prove a chatbot found that URL, not necessarily that it wrote the prose.
- Markdown in a place that does not render it: bold `**…**`, `##` headings, `---` dividers or triple-backtick blocks inside wikitext, a plain-text email, or a form field. As of 2026 this is the most common sign of freshly pasted chatbot text.

One clear artifact is enough for "almost certainly AI-generated (at least in part)". Still say which part: someone may have pasted a chatbot paragraph into otherwise human writing.

### 3. Check Tier 2 evidence: content and sourcing problems (strong)

- **Fabricated or mismatched citations**: references that do not exist, dead or invented URLs, DOIs with impossible or placeholder prefixes (e.g. `10.1234/…`), ISBNs with bad checksums, real sources that do not say what is attributed to them, books "by" the wrong author. If you have web access, actually check a couple of them; if not, list what the user should verify and how.
- **Hallucinated specifics**: confident facts, dates, quotations or statistics that are wrong or untraceable; a true fact about a neighbouring person, place or period attached to the wrong subject; conclusions that go beyond what any cited source says.
- **Speculation dressed as a sourcing note**: "details are not widely documented", "based on available information", "maintains a low profile", followed by guesses about what the missing facts "likely" are. Retrieval-enabled chatbots write this when their search came up empty.
- **Generic content where specifics are expected**: an essay about "classic literature" that names no book, a product review with no details of use, a biography with no verifiable events. The text describes a category rather than a thing. Models regress to the most probable phrasing, so the subject becomes at once less specific and more exaggerated.
- **Mismatch with the writer**: a sudden leap in fluency against a known baseline, a vocabulary the writer has never used, polish inconsistent with the setting.

Sourcing problems also happen in sloppy human writing, so they are strong rather than conclusive, but fabricated references in a confident, well-formatted bibliography are a hallmark of LLM output.

### 4. Weigh Tier 3 evidence: style and vocabulary (moderate, cumulative)

Read [references/signs-catalog.md](references/signs-catalog.md) for the full catalogue with examples and caveats. The main families:

- **Vocabulary**: clusters of words LLMs overuse ("delve", "tapestry", "testament to", "pivotal", "underscore", "showcase", "foster", "vibrant", "nestled", "boasts", "intricate", "seamless", "landscape", "realm").
- **Puffery and significance inflation**: everything "plays a pivotal role", "stands as a testament", "leaves a lasting legacy"; promotional tone in neutral contexts.
- **Evasive plain relations**: "serves as" / "stands as" / "boasts" instead of "is" / "has"; "associated with" or "connected to" instead of saying what someone actually did.
- **Formula structures**: "not just X, it's Y" and "not X, but Y"; groups of three adjectives or items by reflex; "In today's fast-paced world" openers; "In conclusion" / "Overall" summaries that restate the body; "Despite its challenges…" paragraphs; trailing "-ing" clauses that editorialize ("…, highlighting its importance").
- **Uniformity**: paragraphs of near-identical length and shape, each with a topic sentence and a tidy wrap-up; balanced "however" pivots; no tangents, no asides, no unevenness.
- **Formatting habits**: bolded inline headers in bullet lists ("**Clear Communication:** …"), Title Case Headings, emoji bullets, liberal em dashes, curly quotes in contexts where the writer types straight ones.
- **Hedge-and-vagueness**: weasel attributions ("experts say", "it is widely regarded"), vague "challenges" and "opportunities", balanced non-conclusions, didactic "It's important to note that…", and (in text from mid-2026 on) corrective framings like "should be treated as X rather than Y" or "does not by itself establish…".

Signs drift with model generations. "Delve" peaked in 2023–24; newer models are often tuned to avoid em dashes and boldface; ChatGPT, Claude, Gemini and Grok each have their own habits. So the *absence* of the classic tells is weak evidence of human authorship, and the catalogue's era notes matter when the text is dated.

For non-English text, read [references/non-english.md](references/non-english.md): every language has its own LLM clichés (for Russian: "играет ключевую роль", "важно отметить", "является неотъемлемой частью", "в современном мире", "таким образом").

Treat each Tier 3 sign as weak on its own. What matters is **density and co-occurrence**: many families present at once, throughout the text, with nothing that breaks the pattern.

### 5. Collect human signals (counter-evidence)

Actively look for these before deciding, because detection that only looks for AI signs will always find some:

- Specific, checkable, idiosyncratic details: exact numbers, names, places, product models, dates, personal mishaps.
- Natural errors LLMs rarely produce: typos, inconsistent capitalization, run-on sentences, non-native grammar patterns (missing articles, wrong agreement, calques from the writer's first language).
- Uneven structure: digressions, abrupt endings, a real question left open, humor that lands awkwardly, slang and in-group references.
- A clear personal stance or opinion the text commits to, rather than balanced "on the other hand" framing.
- Plain, slightly clumsy human syntax: "there is a", "it has", "used" rather than "utilized", "died" rather than "passed away", flat superlatives ("the only", "one of the best"), hedges like "perhaps" or "very", wordy bits like "in order to" and "the fact that".
- Consistency with the claimed author's known voice, especially writing from before 2022.

Human signals do not cancel artifacts, but they do counter Tier 3 style signs. Also keep in mind that people now run their own writing through AI editors (Grammarly, "improve this" prompts), so a human draft can carry a light AI gloss; "AI-assisted" is a legitimate verdict.

### 6. Watch for false-positive traps

These kinds of human text look "AI-like" to tools and to tired readers. When the text fits one, lower your confidence and say why:

- Non-native English writing (detectors flag it at very high rates; its errors are actually a human signal).
- Formulaic genres taught by template: school essays (especially Russian "сочинение" structure), five-paragraph essays, grant boilerplate, legal and corporate prose, press releases, SEO copy written to a checklist.
- Text written by people who read a lot of AI output and have absorbed its vocabulary.
- Well-known pre-2022 texts (classic literature, historic documents) that detectors notoriously misclassify.

Some features feel like AI but are not reliable signs at all: perfect grammar, formal or "fancy" prose, a "bland" or "robotic" feel, a single transition word like "Additionally", missing sources, or a mix of casual and formal register. LLM style is a specific set of habits (positive, generic, formulaic), not general polish. Do not cite these as evidence.

Never treat an AI-detector score, or asking a chatbot "did you write this?", as evidence. Both are documented sources of false accusations. If the user brings a detector score, explain what it does and does not mean (see [references/detection-limits.md](references/detection-limits.md)).

### 7. Decide and report

Pick one verdict from this scale; the label goes in the user's language:

| Verdict | When to use |
|---|---|
| **Almost certainly AI-generated** | At least one Tier 1 artifact, or fabricated sources plus dense Tier 3 signs |
| **Likely AI-generated** | Dense Tier 3 signs across many families, Tier 2 problems, few or no human signals |
| **Possibly AI-assisted / mixed** | Human core with AI-polished passages, or a strong pattern break between sections |
| **Inconclusive** | Too short, formulaic genre, signals point both ways |
| **Likely human-written** | Clear human signals, few or isolated AI-style signs that have innocent explanations |

Reserve "almost certainly human" for external proof (pre-2022 publication, verified drafts, edit history). Avoid numeric probabilities like "87% AI"; they imply a precision nobody has. A coarse confidence word (low / medium / high) is honest.

Write the report in the language the user wrote in, using this structure:

```markdown
## Verdict: <verdict> (confidence: <low|medium|high>)

<2–3 sentences: the bottom line and the single most important reason.>

### Evidence of AI generation
- **<sign name>** (<tier>) — "<short quote from the text>" — <why it matters>
- ...

### Evidence of human writing
- **<signal>** — "<short quote>" — <why it matters>
- (or: "None found" — say so explicitly)

### Caveats
- <genre/language/length/baseline limits that apply to this text>

### How to confirm
- <concrete next steps fitting the context: check these citations, compare with earlier work, ask the author about X, look at edit history>
```

Quote the text for every sign. A claim like "uses typical AI vocabulary" without a quote is not evidence the user can check. Keep the report proportionate: a three-line forum post does not need fifteen bullets.

Quotes must be verbatim: copy the fragment character for character, including punctuation, typos, capitalization and repeated marks ("??" stays "??", a misspelling stays misspelled). Shorten with "…" rather than rewording, and never put a paraphrase or a reconstructed ending inside quotation marks. A misquote undermines the whole report, because the user will check it against the text and, worse, a "corrected" quote erases the very human errors you may be citing as evidence. Before sending, re-read each quoted fragment against the source.

## Context playbooks

When the setting is academic (teachers, graders), Wikipedia editing, hiring, publishing or moderation, read [references/context-playbooks.md](references/context-playbooks.md) for what to recommend next. The short version: never let a style verdict alone decide a grade, a firing or a ban; recommend the process that produces real evidence (a conversation with the author about the content, drafts and history, source verification), and for Wikipedia point to the relevant community guidance.

## Reference files

- [references/signs-catalog.md](references/signs-catalog.md) — full catalogue of AI-writing signs by category, with examples, why they happen, and false-positive caveats. Read when weighing Tier 1–3 evidence.
- [references/detection-limits.md](references/detection-limits.md) — how AI detectors work, measured accuracy, bias against non-native writers, evasion, watermarking, and how to talk about a detector score.
- [references/non-english.md](references/non-english.md) — LLM clichés in Russian and other languages, and how the general signs transfer.
- [references/context-playbooks.md](references/context-playbooks.md) — next steps for teachers, Wikipedia reviewers, editors, recruiters and moderators.
