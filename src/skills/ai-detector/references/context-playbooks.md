# Context playbooks: what to recommend next

Sources: Wikipedia, "Wikipedia:Signs of AI writing" and "Artificial intelligence content detection" (CC BY-SA 4.0, paraphrased), and the Wiki Education module "Detection of AI-generated text". Items from outside these are marked `[outside source]`; most of the advice for non-Wikipedia settings is general practice, so those sections carry that tag once at the top.

The same rule runs through every section: a style verdict is a reason to look closer, never grounds for a grade, a firing, a rejection or a ban. The documented harms (UC Davis 2023, Texas A&M-Commerce 2023, Gizmodo 2024; see detection-limits.md) all came from acting on a flag alone. Recommend whatever produces real evidence: a conversation with the author, drafts and history, and source checks.

## Teachers and graders

`[outside source]` for the process advice below.

**At stake:** a misconduct finding or a lowered grade for a student who may have done nothing wrong, and a lasting loss of trust.

**Evidence that matters most:**
- A baseline: the student's earlier in-class or handwritten work, and earlier assignments. A sudden jump in polish is meaningful; a text compared to nothing is not.
- Whether the student can discuss the content: their sources, a specific book or argument, why they chose it.
- Draft history (Google Docs or Word version history), which shows how the text actually grew.
- Checkable errors: references that do not exist, quotations that are not in the cited book.

**What to recommend:**
- A short, non-accusatory conversation. Ask them to walk through their argument, sources and drafting process. A student who wrote it can usually explain it; one who pasted it often cannot.
- Treat an unusual jump in polish as a reason to talk, not to punish.
- Note the false-positive traps: template-taught school essays (including Russian "сочинение" formulas), non-native writers (61.3% false positive rate in Liang et al., 2023), neurodivergent writers.
- Over time, suggest process-based assessment: outlines, drafts, in-class writing, oral follow-ups.

**What not to do:**
- Do not grade or accuse on style or on a detector percentage alone, and do not ask a chatbot whether it wrote the text (Texas A&M-Commerce).
- Do not treat missing AI signs as proof of honesty either.

**Example recommendation:** "The essay shows a few stock phrases but nothing conclusive, so don't treat it as misconduct yet; ask the student to explain why they picked these two sources, and compare it with their in-class writing and the document's version history."

## Wikipedia editors and reviewers

**At stake:** unverifiable or fabricated content entering a reference work, and, on the other side, driving away good-faith newcomers with false accusations.

**Evidence that matters most:**
- Verifiability. Do the cited sources exist, and does each one say what the sentence claims? Text that goes beyond what the sources say is a synthesis problem. The Wiki Education module centres on this step because a detector cannot show whether false content got in.
- Objective artifacts: leftover chatbot communication, `oaicite` or similar markup, `utm_source=chatgpt.com` in URLs (shows the tool touched the URL, not that it wrote the prose), invalid DOIs and ISBNs, DOIs that resolve to unrelated papers.
- Edit history and authorship age. Text from before 30 November 2022 is safely not LLM output; Who Wrote That and WikiBlame show when text was added.

**What to recommend:**
- Treat signs as pointers to substantive problems; fix or flag the problem (unsupported claim, bad source), not just the surface wording. Cosmetic cleanup alone can make detection harder.
- Ask the author to explain a suspicious edit or source. A human can usually supply the real source, the passage or a plausible typo explanation.
- G15 speedy deletion is for the most objective signs only (for example leftover chatbot communication or nonexistent references).
- For AfC drafts, the page advises declining those that contain "submission statements" aimed at reviewers. `[outside source]` For other drafts with sourcing problems, decline too, and leave specific feedback on which claims or references failed.
- Point to WikiProject AI Cleanup and the "Wikipedia:Signs of AI writing" page for the full field guide.

**What not to do:**
- A detector percentage is not valid ground for G15, and remaining style signs alone are not enough for deletion.
- Do not accuse newcomers on a vibe: the page warns that false accusations drive them away.
- Do not clean only the surface (strip bold, fix markup) and call the problem solved.

**Example recommendation:** "Two of the five references do not exist and one does not mention the quoted claim, so decline the draft and tell the author which sources failed the check; if the DOI errors persist, ask them to explain where they got the citations."

## Editors, publishers and clients buying content

`[outside source]` for the contract and workflow advice below.

**At stake:** paying for work that breaks a contract or disclosure term, publishing fabricated facts or quotes, and unfairly dropping a writer on the strength of a detector (Gizmodo, June 2024: freelancers reportedly lost work after wrong labels).

**Evidence that matters most:**
- Accuracy: do the quotes, statistics and sources check out? Fabricated references and wrong specifics are the harm that matters here.
- Specifics versus category talk: does the piece name real people, places and details, or only describe a topic in general terms?
- The writer's process materials: outline, notes, interview recordings, earlier drafts.

**What to recommend:**
- Check what the contract or guidelines say about AI use. AI use may be allowed; the real questions are disclosure and accuracy.
- Ask for drafts, outlines and research notes, and fact-check quotes and claims independently.
- Judge the piece on quality and accuracy problems you can name, and give the writer a chance to respond.
- For future work, set an explicit disclosure rule. The Wikipedia article mentions a 2024 AI transparency statement, proposed by Kimberly Acquaviva (University of Virginia School of Nursing), that creators can use to disclose AI use.

**What not to do:**
- Do not withhold payment or end the relationship on a detector score alone.
- Do not assume undisclosed AI use is the same as dishonesty if the contract was silent.

**Example recommendation:** "I can't tell who wrote it, but three quotes are not traceable; ask the writer for their sources and notes, correct anything unverified before publishing, and add an AI-disclosure line to your next brief."

## Recruiters and hiring

`[outside source]` for the hiring advice below.

**At stake:** rejecting a qualified candidate over a formulaic document, and screening out non-native speakers for writing that merely looks predictable.

**Evidence that matters most:**
- Cover letters and application answers are a formulaic genre by design, so style similarity means little.
- Whether the content is specific: real projects, numbers, the actual employer.
- The candidate's live performance: interview answers and a work sample.

**What to recommend:**
- Assume AI-polished letters are common and often legitimate (a candidate editing their own draft). The question is whether the person can do the job.
- Evaluate through a structured interview and a work sample done in your setting, not through the text of the application.
- Remember non-native candidates face the highest detector false positive rates (61.3% in Liang et al., 2023).

**What not to do:**
- Do not reject or rank candidates on a detector score or a "sounds like ChatGPT" feeling.
- Do not penalise generic wording that a template-based letter would produce for anyone.

**Example recommendation:** "The letter is generic but that is normal for the genre, so I would not hold it against them; test the skills in a short work sample and ask about the one concrete project they mention."

## Moderators and community managers

`[outside source]` except where noted.

**At stake:** wrongly banning a real member, or missing coordinated spam because you focused on prose style.

**Evidence that matters most:**
- Behaviour over text: many near-identical posts, generic replies that could fit any thread, account age, posting velocity, links to the same destination, karma-farming patterns.
- Human signals: specific, personal, on-thread replies, typos, slang, in-group references, a stance the author sticks to.
- Leftover artifacts in the post (placeholders, chatbot phrases, Markdown in a plain-text field) are strong; they show a paste, not who is behind the account.

**What to recommend:**
- Check behaviour first and act on the rule that was actually broken: spam, self-promotion, mass posting, ban evasion.
- Look at the account's history and whether its pace of posting could be human.
- Keep the post's wording out of the decision unless a rule bans it. The Wikipedia signs page makes a similar point about permissions gaming: rapid AI-style additions alone are not evidence of it, so the evidence must be of the conduct itself.
- If a rule does cover AI-generated content, apply it to clear artifacts and unverifiable claims, and say what was found.

**What not to do:**
- Do not ban or remove on "this feels like AI".
- Do not treat a long, tidy post from a new account as proof of a bot.

**Example recommendation:** "Remove the 14 near-identical product replies under the spam rule, citing the account's posting pace and repeated link; the individual posts' wording is not what you act on."

## Self-check (the user wants their own text to not look AI-written)

**At stake:** an honest writer worrying about a false flag, versus someone trying to pass off AI text where the rules forbid it.

**Evidence that matters most:** the Tier 3 patterns actually present in the text (stock vocabulary, "not just X, but Y", tidy closing summaries, trailing "-ing" significance clauses, uniform paragraphs) and how specific the content is.

**What to recommend:**
- List the patterns you found with quotes, and explain that these make text read as generic, not just "AI-like".
- Suggest making the text more specific: real names, numbers, your own experience, a stance, uneven rhythm where you naturally have it.
- If they wrote it themselves, say so: a flag does not prove otherwise, and keeping drafts and version history is the best protection.

**What not to do:**
- Do not help disguise AI text submitted under rules that forbid AI use, and do not suggest tricks to defeat detectors (that is the humanizer problem, not a writing one).
- Do not scrub surface tells while leaving shaky content in place.

**Example recommendation:** "Three phrases ('plays a pivotal role', 'not only X but also Y', a summary paragraph that repeats the body) read as stock language; replace them with the specific example you actually have in mind, and keep your drafts in case anyone asks."
