# Signs of AI Writing: Catalog

A field guide to the features that separate LLM-generated text from human writing, grouped by evidential strength. Adapted from Wikipedia:Signs of AI writing (WikiProject AI Cleanup), CC BY-SA 4.0, https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing, as of October 2026. The source is about encyclopedic writing; signs that only make sense in wikitext are collected at the end.

**Core mechanism.** LLMs regress to the mean: they produce the statistically likeliest, widest-applicability phrasing, and RLHF tuning pushes that toward broadly palatable, positive prose. Rare, specific, nuanced facts get replaced with generic, important-sounding filler, so the subject becomes simultaneously less specific and more exaggerated. Most signs below are symptoms of that blur. Treat them as pointers to real problems (unverified facts, invented sources), not as the problem itself.

Each sign gives: what it looks like, example fragments, why models do it, strength, and false-positive caveats. Eras are approximate, "not hard cutoffs".

## Contents

- [Tier 1 — Artifacts (near-conclusive)](#tier-1--artifacts-near-conclusive)
- [Tier 2 — Content and sourcing (strong)](#tier-2--content-and-sourcing-strong), including [How to verify citations](#how-to-verify-citations)
- [Tier 3 — Style and vocabulary (moderate, cumulative)](#tier-3--style-and-vocabulary-moderate-cumulative)
  - [Vocabulary](#vocabulary) · [Significance and legacy inflation](#significance-and-legacy-inflation) · [Trailing -ing analyses](#trailing--ing-analyses) · [Promotional language](#promotional-language) · [Vague association](#vague-association) · [Vague attributions](#vague-attributions-and-overgeneralized-opinion) · [Challenges-and-prospects formula](#challenges-and-prospects-formula) · [Copula avoidance](#copula-avoidance) · [Negative parallelisms](#negative-parallelisms) · [Rule of three](#rule-of-three) · [Elegant variation](#elegant-variation) · [Hedging disclaimers by era](#hedging-disclaimers-by-era) · [Formatting](#formatting) · [Customer-service voice and summaries](#customer-service-voice-and-summaries)
- [Human signals (counter-evidence)](#human-signals-counter-evidence)
- [Ineffective indicators and false-positive traps](#ineffective-indicators-and-false-positive-traps)
- [Wikipedia-specific signs](#wikipedia-specific-signs)

## Tier 1 — Artifacts (near-conclusive)

Things humans essentially never write, left behind when a chatbot reply is pasted. One clear artifact is enough to say the text, or at least that passage, came from a chatbot. Always state which part is affected.

- **Chatbot leakage (text meant for the prompter)** — conversational lines left in the content: "I hope this helps", "Certainly! Here is a…", "You're absolutely right!", "Would you like me to…", "let me know if…", "verify before publishing", advice on how to use or post the text. Also leaked reasoning ("Claude responded:"-style residue) and instructions to the user. *Strength:* near-conclusive. *Caveat:* a human quoting a chatbot, or an article about chatbots, will contain these lines legitimately; check the context.
- **Unfilled placeholders** — fill-in-the-blank text never filled in: "[Your Name]", "[Article Title 1]", "[Describe the specific section…]", "INSERT_SOURCE_URL_30", "PASTE_YOUTUBE_VIDEO_URL_HERE", placeholder dates such as "2025-XX-XX". *Strength:* near-conclusive. *Caveat:* genuine human templates, mail-merge forms and preloaded drafts also have placeholders; ask whether the document is a template.
- **Markdown in a medium that does not render it** — `**bold**` asterisks, `##` headings, `---` dividers, `[text](url)` links with the order mixed up, and above all text wrapped in triple backticks. Pasted into a plain-text email, form field, wikitext or word processor. *Strength:* strong to near-conclusive, and the most common artifact in fresh AI text as of Oct 2026. *Caveat:* people who write in Markdown on purpose (developers, forum users) produce it too, so the medium and the author's habits matter.
- **Citation and tool tokens** — conversion failures leave internal markers: `contentReference[oaicite:1]`, `oaicite`, `turn0search0`, `【4†source】`. Every chatbot has its own pattern. *Strength:* near-conclusive. *Caveat:* none worth noting beyond a human quoting one.
- **Tracking parameters on URLs** — `utm_source=openai`, `utm_source=chatgpt.com` (ChatGPT), `utm_source=copilot.com` (Copilot), `referrer=grok.com` (Grok). Gemini and Claude use them less. *Strength:* near-conclusive that a tool touched the URL; it does **not** prove the tool wrote the surrounding prose, since people ask chatbots to find citations for text they wrote. Check version history before concluding. *Caveat:* very rare Google-indexed exceptions.
- **Gemini highlight tags** — text pasted from Gemini into a rich-text editor can arrive wrapped in `<mark></mark>`, sometimes with stray bracketed numbers like "[1, 2, 3]". A leftover of Gemini's "double-check response" highlighting. *Strength:* strong for a Gemini paste.
- **Knowledge-cutoff statements** — "As of my last knowledge update in January 2022", "Up to my last training update". Peak 2022–2023, rare now. *Strength:* near-conclusive.
- **Refusal and identity statements** — "As an AI language model…", "I cannot offer medical advice, but I can…", "I'm sorry…", followed by an offer of a nearby alternative. Increasingly rare in newer output. *Strength:* near-conclusive. *Caveat:* same as chatbot leakage.
- **Abrupt cut-offs** — output stops mid-sentence at a token limit, typical of older ChatGPT ("continue generating"). *Strength:* weak. *Caveat:* a malformed copy-paste, a truncated upload or copied (plagiarised) text looks identical.

## Tier 2 — Content and sourcing (strong)

Not conclusive, because sloppy humans also mis-cite and pad. They are strong because they show the text does not rest on real knowledge. Look for several together, and verify rather than assume.

- **Fabricated citations** — references that look right and are not: broken links (several in one new document, none in web archives), DOIs that do not resolve, ISBNs that fail the checksum, a DOI that resolves to an unrelated paper, a cited author who died decades before the supposed publication date. Models generate what a citation *looks like*. *Strength:* strong; fabricated references in a polished bibliography are a hallmark of LLM output. *Caveat:* paywalled or institutional links that fail for you, bot-mangled or truncated URLs, and (2018–2023) an editor bug that inserted irrelevant PubMed IDs.
- **Books cited without pages** — a real, on-topic, widely cited book listed with no page number or link, so the claim cannot be checked; or a page given that does not contain the claim. *Strength:* moderate–strong. *Caveat:* many humans cite lazily.
- **Claims not in the cited source** — a real source attached to a statement it never makes, e.g. a named critic credited with "highlighting the lasting influence". Retrieval-enabled models pin their own synthesis on a real name. *Strength:* strong. *Check:* search the source for the claim.
- **Hallucinated small details** — plausible but wrong dates, names, titles, figures, quotations, and invented sources of otherwise real events. *Strength:* strong when confirmed wrong. *Caveat:* humans misremember; look for confident detail that is untraceable, not just a single slip.
- **Facts from a related context** — details that belong to a neighbouring topic, namesake or sibling entity (the wrong person with a similar name, a related product's specs). Models blend near neighbours. *Strength:* moderate–strong.
- **Unverifiable or vague content** — text describes a category rather than the thing: nothing a reader could check, no names, no numbers, no events. The "fading portrait" effect: specifics were averaged away. *Strength:* moderate–strong when the genre demands specifics (biography, review, report, case study).
- **Over-synthesis** — a source's facts joined into a conclusion the source never draws, or an opinion presented as established. *Strength:* moderate–strong. Often shows up together with trailing -ing analyses (see Tier 3).
- **Source-availability disclaimers with speculation** — a model that could not find sources says details are "limited in the provided search results", "not widely documented", "based on available information", then speculates, e.g. "maintains a low profile" or "keeps personal details private". The claim that nothing is documented is itself invented or speculative. First-person traces ("I've inferred…", "My analysis is based on…") count here too. Common 2024–25. *Strength:* strong. *Caveat:* a human writer may honestly say sources are scarce, but without speculating about the subject's privacy.
- **Canned notability and media-coverage talk** — proves importance by listing source *types* instead of content: "independent coverage", "featured in regional and national media", "trade publications", "active social media presence", "written by a leading expert". The text describes the sources' availability, not what they said; it often echoes notability guidelines, as if the model collapsed the rules and the prose together. Seen more in 2025+ tools; "maintains an active social media presence" was rare before ~2024. *Strength:* moderate–strong. *Caveat:* human press releases cite news clippings too; the tell is the narrow wording plus the focus on source properties.
- **Style shift against the author's baseline** — flawless grammar, new vocabulary or a different voice compared with the same person's other writing, especially writing from before November 2022. A long-time AI user will track the style of the model they used at that time (a 2023 edit looks 2023-ish). *Strength:* moderate. *Caveat:* people improve, use editors, or write differently in different settings; needs a real baseline.

### How to verify citations

1. **DOI**: open `https://doi.org/<DOI>`. Does it resolve, and to the claimed title, authors, year and journal? Placeholder-looking prefixes such as `10.1234/` are suspicious.
2. **ISBN**: check the 10- or 13-digit checksum, then look the number up. Does it match the claimed title and author?
3. **Dead link**: try the Wayback Machine (archive.org). A link that never existed in any archive, repeated across several references, points to fabrication; a link that was live once points to link rot.
4. **Claim in source**: open the source (or search its full text, for books by the cited page) and look for the specific claim, quotation or number.
5. **Author and date sanity**: did this person write on this topic, and were they alive and active in that year?
6. If you cannot check from here, tell the user exactly which items to check and how. Ask the author for the source passage; a human can usually supply it.

## Tier 3 — Style and vocabulary (moderate, cumulative)

None of these proves anything alone: LLMs learned from human writing, and every feature below also appears in editorials, blogs, press releases and fan fiction. Weigh **density and co-occurrence**. Signs stack, and where there is one there are usually others. They carry more weight where humans rarely add flourish (short comments, terse summaries).

### Vocabulary

Words overused since 2022: *additionally* (sentence-initial), *align with*, *boasts* (for "has"), *bolstered*, *crucial*, *deep dive*, *delve*, *emphasizing*, *enduring*, *enhance*, *fostering*, *garner*, *highlight* (verb), *interplay*, *intricate/intricacies*, *landscape* (abstract), *meticulous(ly)*, *pivotal*, *robust*, *showcase*, *tapestry* (abstract), *testament*, *underscore* (verb), *valuable*, *vibrant*, *key*. Models favor these because they sound weighty in any context.

*Strength:* one word, weak; many such words, many times, in text from after 2022, one of the strongest style tells. *Caveats:* read literally. A synonym of a listed word is not evidence (only the listed words are overused); check the sense ("underscore" as a character, musical underscore, a literal "landscape").

Which words dominate depends on the model and period:

| Period (model family) | Typical words |
|---|---|
| 2023 to mid-2024 (GPT-4) | *additionally, boasts, bolstered, crucial, delve, emphasizing, enduring, garner, intricate, interplay, key, landscape, meticulously, pivotal, underscore, tapestry, testament, valuable, vibrant.* "Delve" peaked in 2023–early 2024, then fell sharply in 2025. |
| Mid-2024 to mid-2025 (GPT-4o) | *align with, bolstered, crucial, emphasizing, enhance, enduring, fostering, highlighting, pivotal, showcasing, underscore, vibrant.* |
| Mid-2025 to mid-2026 (GPT-5) | *emphasizing, enhance, highlighting, showcasing,* plus the canned notability and media-coverage phrasing (see Tier 2). |
| Mid-2026 onward (lower confidence) | *challenge, clearer, dependable, echoed, foster, leverage, matters, multifaceted, practical, prioritize, quietly, steady, universally.* Output reported as shorter sentences, more periods and commas, around a strict 8–20 word limit. This list and the sentence-length claim rest on a single review; use them only as supporting evidence. |
| Grok | Idiosyncratic "scientific" words (*causal, empirical, correlate*), still heavy *underscore* in 2026; very long, context-heavy output. |

Models differ in idiolect: ChatGPT and Grok add more broader context than Gemini or Claude, which are more concise. Absence of one family's words does not clear a text from another model.

### Significance and legacy inflation

Arbitrary facts tied to a grander theme: "marking a pivotal moment", "part of a broader movement", "evolving landscape", "indelible mark", "a testament to", "stands as", "setting the stage for". Training data describes notable things in inflated terms and RLHF rewards positivity.
- Variants: situating a subject amid "debates" and "public discussions"; applying it to mundane topics (place-name origins, population figures); a hedge admitting limited importance and then asserting importance anyway ("Though it saw only limited use, it contributes to…"); for species, inflated ecosystem ties or "conservation efforts" that do not exist.
- *Strength:* moderate–strong in density. *Caveat:* tourism and PR copy is full of it; the tell is the same inflation regardless of subject.

### Trailing -ing analyses

A participle clause tacked on to assert significance: "…, highlighting its cultural relevance", "…, contributing to the region's growth", "…, reflecting the rich culture". Models add it to sound analytical; it is usually unsourced opinion or synthesis. Watch: *highlighting, underscoring, emphasizing, ensuring, reflecting, symbolizing, contributing to, fostering, encompassing, enhancing*, "valuable insights", *align/resonate with*. It also appears in paraphrases, where each variant ends with one.
- *Strength:* moderate–strong when repeated, and very common. *Caveat:* occasional use is normal in human prose.

### Promotional language

Travel-guide or press-release register where none was intended: "boasts a", "vibrant", "rich", "nestled", "in the heart of", "natural beauty", "groundbreaking", "renowned", "commitment to", "diverse array", "showcasing", "exemplifies". Persists when the model is told to be neutral, and appears in rewrites (a summary can claim "removed promotional tone" while adding some).
- Subtypes: cultural-heritage reminders; brochure prose ("From its scenic landscapes to its historical landmarks…"); corporate tone for people and firms ("aligns with the goals of…", "emphasized commitment to sustainability").
- Older models (GPT-4) are blatantly positive and use superlatives; newer ones are subtler and avoid "the best".
- *Strength:* moderate. *Caveat:* not all promotion is AI; the tell is the same stock phrases across unrelated topics.

### Vague association

Avoids stating the plain relation: "associated with", "connected to", "in connection with", "particularly associated with" instead of "was CEO of" or "taught music". Often stacked with promotional words and AI vocabulary, sometimes repeated within one passage.
- *Strength:* moderate–strong; one of the most common current signs as of Oct 2026. *Caveat:* sometimes the relation really is loose.

### Vague attributions and overgeneralized opinion

Anonymous authorities and inflated consensus: "Industry reports", "Observers have cited", "Experts argue", "Some critics argue", "several publications" when one or two are cited, "reviewers" when one is cited, "such as" before a list as if non-exhaustive, "modern researchers treat…".
- *Strength:* moderate. *Caveat:* common in sloppy human journalism and opinion writing. Check whether the named sources exist and say it.

### Challenges-and-prospects formula

An outline-like block: "Despite its [achievement], [subject] faces challenges… Despite these challenges, it continues to thrive", ending on a vague positive verdict or speculation about initiatives that "could enhance" the subject, often under a "Future Outlook" heading.
- *Strength:* moderate–strong. *Caveat:* the formula is the sign, not the mere mention of challenges.

### Copula avoidance

"Serves as", "stands as", "marks", "functions as", "operates as", "represents a", and marketing verbs "features", "boasts", "maintains", "offers" in place of plain "is" and "has". One study found over a 10% drop in "is/are" in academic writing in 2023; AI copyedits "improve" sentences the same way. Newer output is more elaborate: "ventured into politics as a candidate" for "was a candidate". A related lead pattern: "X refers to…", treating the title as a word.
- *Strength:* moderate. *Caveats:* do not confuse with present perfect ("has been featured"); lead sentences naturally use "is", so exclude them.

### Negative parallelisms

Three kinds, all "correcting" a misconception nobody held:
- **"Not just X, but Y"** — "not only… but also…", "isn't just a tool, it's a platform", "doesn't just undermine X, it…". May span two sentences. *Strength:* moderate–strong; stereotypically AI. *Caveat:* common in human "myths busted" and listicle writing.
- **"Not X, but Y" / "no X, no Y, just Z"** — "It's not a mirror but a portal", "Not a career, not a body of work, just…". Frequent in arguments, rebuttals, art and literature analysis. *Strength:* moderate–strong.
- **"Y rather than X"** — "prioritizing A rather than B", "acts as an interface rather than introducing a new tool". Particularly common in recent output, and the backbone of the mid-2026 corrective disclaimers below. *Strength:* moderate.

### Rule of three

Triplets of adjectives, phrases or items used to make shallow analysis look complete: "tiles, metals, and plastics", "mythological image, magical weapons, and spirit of resistance". Habitual, not purposeful.
- *Strength:* weak–moderate alone; stronger where humans would not bother (a one-line comment, an edit note). *Caveat:* triples are a standard rhetorical device and people use them deliberately.

### Elegant variation

Unusually high lexical diversity: the same referent gets a new label every sentence ("socialist realism" becomes "Soviet artistic constraints", then "state-imposed norms"). Older models with repetition penalties did this; mostly a 2023–24 trait.
- *Strength:* weak–moderate, era-limited. *Caveats:* it fades when a user pastes together separately generated pieces; non-native writers schooled to avoid repetition do it too.

### Hedging disclaimers by era

Disclaimers that advise or correct an imagined reader. The form changes with the period, so date the text first. (The 2024–25 source-availability form is in Tier 2.)
- **2023–24, didactic** — "It's important to note…", "It is crucial to differentiate…", "It's important to remember…", often on safety, controversy or jurisdiction. Resembles GPT-4 partial refusals. *Strength:* moderate, era-dependent. *Caveat:* teachers and style guides write "it is important to note" too.
- **Mid-2026 onward, corrective framings** — "should be treated as X rather than Y", "does not by itself establish…", "does not establish that…", "should not be confused with…". Reported as extremely rare before mid-2026 (around the July 2026 model release), and often paired with editorializing about why a distinction "matters". *Strength:* strong for text dated mid-2026 or later; for earlier text, probably human. The "should not be confused with" form is the least reliable.

### Formatting

- **Overused boldface** — mechanical bolding of phrases or every instance of a term, "key takeaways" style, inherited from READMEs, listicles and slide decks. *Strength:* moderate. *Caveat:* newer apps may suppress it, so absence means little.
- **Inline-header vertical lists** — bullet or number, a bold header, a colon, then a sentence: "**Durability:** Unlike roasted meats…". Pasted text may keep bare bullet characters (•, -, –, #, emoji) or literal numbering. *Strength:* moderate–strong. *Caveat:* people bold "Keep"/"Delete" in votes; that is a different thing.
- **Title Case headings** — all main words capitalized ("Impact of Technology and Digitalization") where sentence case is expected. *Strength:* weak–moderate.
- **Emoji as formatting** — emoji before headings or bullets, especially in comments and user-facing posts. Mostly 2025 and earlier, rarer now. *Strength:* moderate when present. *Caveat:* common in human social-media writing.
- **Small tables** — a few rows and two or three columns where prose would do; comparison tables inserted into narrative; pasted Markdown tables garble. *Strength:* weak–moderate.
- **Curly quotes and apostrophes** — ChatGPT and DeepSeek typically emit them, sometimes mixed with straight ones; Gemini and Claude typically do not. *Strength:* weak. *Caveat:* Word autocorrect, macOS and iOS defaults, LanguageTool, Chicago-style publishers and citation tools all produce them.
- **Em dashes** — dashes where commas, parentheses or colons fit, a "punched-up" sales feel, often spaced. Heavy 2022–2025. *Strength:* weak–moderate alone, useful in combination. *Era note:* GPT-5.1 was tuned to suppress them (Nov 2025); by July 2026 only Claude was reported above professional-writer rates. From Sept 2026 the newest models avoid them, and uniformly low punctuation variety (more commas and periods than even human text) is emerging as a sign in its own right; that last claim is not well sourced, so use it lightly. Do not read an absence of dashes as human.
- **Headings containing only other headings** — a section with no text of its own, only subsections. *Strength:* weak–moderate.

### Customer-service voice and summaries

- **Clerk voice** — "I carefully reviewed…", apologies for "any inconvenience", "If there are specific issues, point them out and I will try to resolve them", "I hope this message finds you well", "Dear Editorial Team… I am writing to…". *Strength:* moderate. Related: downplaying AI use ("this reflects my own thoughts") or answering a suspicion by demanding the critic "name exactly what is wrong". *Caveat:* formal business letters are formulaic by nature.
- **"In conclusion", "Overall", section summaries** — a closing section or paragraph that restates what was just said; meta lines like "In this section, we will discuss…". Typical of older models. *Strength:* weak–moderate. *Caveat:* school essays are taught this way.

## Human signals (counter-evidence)

Look for these deliberately. Style signs alone never settle anything, and these push the other way.

- **Predates 30 November 2022** (ChatGPT's public launch). AI authorship is safely ruled out for text demonstrably written earlier; older text sometimes shows "AI signs" by coincidence. Use publication dates, archived copies, document metadata or version history. *Strength:* decisive when proven.
- **Author can explain their choices** — asked about a typo, a wrong link or a strange phrase, a human can usually give the real source, the passage or the reason. Do not conclude from a suspicious URL alone.
- **Human-leaning syntax** — more frequent in human than AI encyclopedic text, because models steer to a "formal, neutral" tone and sidestep them:
  - plain "is/has" phrases ("there is a", "it has a");
  - plain words over stiff synonyms: wrote/authored, moved/relocated, used/utilized, tried/attempted, died/passed away;
  - superlatives and definitive statements: "one of the best", "is the only", "was the first";
  - qualifiers and intensifiers: "very", "perhaps", "tends to";
  - isolated wordy constructions: "as a result of", "in order to", "the fact that".
- **Consistent pre-LLM style** — the same habits (heavy boldface, lists, punctuation quirks) in the person's older writing and the current text. The reverse of a style shift.
- **Typos and slips** `[general]` — misspellings, inconsistent capitalization, missed words, run-on sentences. LLMs rarely make them unprompted, though they can be asked to.
- **Non-native grammar patterns** `[general]` — missing or wrong articles, wrong agreement, calques from the writer's first language. A strong human signal, and also a false-positive trap for detectors.
- **Idiosyncratic specifics** `[general]` — exact numbers, names, places, models, dates, personal mishaps that can be checked and that no averaging process would pick.
- **Digressions and unevenness** `[general]` — tangents, asides, abrupt endings, an open question, jokes that land awkwardly, in-group slang.
- **Committed opinions** `[general]` — a stance defended without the reflexive "on the other hand".

## Ineffective indicators and false-positive traps

**Do not count these as evidence** (some point the other way):
- **Perfect grammar** — many writers are skilled or professional.
- **Mixed casual and formal register**, or "clinical yet emotional" tone — technical people, young writers, neurodivergent writers, playful writers, or several authors on one document.
- **"Bland" or "robotic" feel** — LLM text has specific traits (positive, verbose, formulaic); a vibe is not a trait.
- **Fancy, academic or formal prose** — the link is to particular words, not formality in general.
- **Isolated transition words** (*Additionally, Consequently, Notably*) — only a few are overused, and humans use them in essays.
- **Unsourced content** — most human writing is unsourced, and chatbots with web access now supply citations (possibly wrong ones).
- **Bizarre or correct wikitext** — odd tags and broken markup come from extensions, translation tools and editor glitches; correct markup is normal with previews.

**Human look-alikes.** People also produce: promotional PR wording; press-release lists of coverage; em dashes; curly quotes (Word, Mac/iOS, Chicago style, LanguageTool); "Legacy" and "Recognition" sections; "not X but Y" in myth-busting pieces; "In conclusion" endings; bold in vote comments; templates with placeholders; links that fail only from certain networks; bot-mangled or truncated URLs; copied citations with old dates; non-native writers who avoid repeating words. Writers who read a lot of AI output also absorb its vocabulary, and human style is slowly converging toward LLM style, though unevenly.

**Limits of the signs.**
- Absence of classic tells is weak evidence of human authorship. Newer models are instructed to avoid boldface and em dashes, and models differ: what marks GPT output does not mark Claude or Gemini output.
- Dating can overrule style: pre-Dec 2022 text is human; mid-2026 corrective disclaimers dated earlier are probably human.
- Human accuracy at spotting AI text is poor, close to chance in several studies. Heavy ChatGPT-for-writing users do far better. Guard against confirmation bias, and remember false accusations are costly.
- Fixing surface tells without checking substance only makes detection harder; the real question is whether the facts and sources hold up.

## Wikipedia-specific signs

Use this appendix when the input is wikitext, a Wikipedia draft, an edit history, or talk-page text. Most carry moderate weight and lose force outside Wikipedia. On Wikipedia itself, only the most objective signs justify deletion; a detector score never does.

**Page structure and markup**
- **Title heading** — the article title repeated as a top heading (the model assumes no title exists). *Moderate.*
- **Skipped heading levels** — starting at level 3 with no level 2; hand-formatted pages rarely do this. *Moderate.*
- **Too many level-1 headings** — likely Markdown `#` translated to wikitext. *Moderate.*
- **Title Case headings and "X and Y" headings** — see Formatting; "Awards and recognition" (or "Recognition") is far more common in AI articles than human ones, even promotional ones. *Moderate.*
- **Nonexistent categories and templates** — pages in categories that do not exist, or calling templates that do not exist. *Strong.*
- **Placeholder dates in citations** — "2025-XX-XX", "2022-11-XX" in date or access-date fields. *Strong.*
- **Infobox placeholder comments** — "Add if available with citation", instructions to upload images. *Moderate.* Check the template first, as many ship boilerplate comments.
- **List or broad titles treated as proper nouns** — a lead that defines the title as a real entity: "X refers to the geographic area…", "The 'List of songs about Mexico' is a curated compilation…". *Moderate.*

**References**
- **Reference mechanics** — wrong reuse syntax repeated after every full stop, `<sup>[3]</sup>` pseudo-footnotes, the "↩" return arrow, irrelevant sources, trailing offers such as "Would you like help formatting…?" under a References heading. *Moderate.*
- **Named references declared but unused, or used but undefined** — and malformed escaped quotes in ref names (`name=\"x\"`). *Moderate.* Undefined refs can come from copy-paste between articles.
- **Outdated access dates** — access dates that look too old for the edit date. *Weak, historical.* Copied citations carry old dates legitimately; newer chatbots rarely do this.

**Submissions and drafts**
- **Submission statements** — notes to reviewers inside a draft ("Reviewer note: all references are independent, reliable…") or AI disclosures asserting compliance. *Strong.*
- **Pre-placed review or maintenance templates** — a content-free "declined" Articles for Creation header inserted by the creator is a strong indicator; nonsensical maintenance, short-description or date templates on a brand-new page. *Strong.*
- **Canned user pages** — "Welcome To My User Page!", "About Me", "My Interests", "Let's Connect!", with emoji, bold, bullet lists or stray Markdown asterisks. *Moderate.*
- **Mass edits for permissions** — many unconstructive edits on unrelated topics to reach a permission threshold. *Moderate, one direction only:* rapid AI-style editing is not itself evidence of gaming, but if gaming is found, the bulk text may be AI.

**Edit summaries** (formulaic procedural self-description; humans cite a specific rule briefly, or write "ce")
- **Canned assurances** — "ensured that… adheres to", "improved neutrality and sourcing", "encyclopedic tone", "clarity, flow", "compliance with Manual of Style". *Strong when stacked and varied.*
- **"Preserved/retained/avoided" statements** — "Revised [section] to improve [neutrality] while preserving [thing]". Reflects a prompt that said to keep something. Watch: *preserved, retained, avoided, ensured, aimed to.* *Moderate–strong.*
- **Overemphasis on citations** — "added sourced content", "added verified information" instead of describing the content. *Moderate–strong.*
- **Overemphasis on parameter, template and markup names** — itemized infobox parameters, "inline citations", "internal links". *Moderate.*
- **References to AfC reviewer feedback** — "Addressed reviewer feedback by improving sourcing, formatting, and neutrality". *Moderate.*
- **Chatbot preamble, bold Markdown or leftovers** — "Concise edit summary:" in bold, older first-person summaries with emoji or lists. *Strong.* It is unlikely someone uses AI for a trivial summary but not for the larger task.

**Talk pages and discussion**
- **Misquoted or invented policy**, made-up shortcuts, bare "WP". *Moderate–strong.*
- **Maintenance banners transcluded** whenever one is mentioned. *Moderate.*
- **Long comments split into titled sections or subheadings**, in Markdown or plain text. *Moderate.*
- **Deflection** — downplaying AI use, asking critics to specify what is wrong, calling concerns "unsubstantiated speculation", urging focus on content. *Moderate.*
- **Clerk voice** — see Customer-service voice. *Moderate.*
