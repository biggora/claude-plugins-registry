# Detection limits: what detectors can and cannot tell you

Sources: Wikipedia, "Artificial intelligence content detection" and "Wikipedia:Signs of AI writing" (both CC BY-SA 4.0, paraphrased here), and the Wiki Education training module "Detection of AI-generated text". Anything from outside these is marked `[outside source]`.

Read this when the user cites a detector score (GPTZero, Turnitin, Originality.ai, Pangram and the like), asks how reliable detection is, or wants to use a detector result to decide something about a person.

## How detectors work

- **Trained classifiers.** Commercial tools (Turnitin, GPTZero, Originality.AI) are trained to separate human text from model text. The vendors publish few internals.
  - Weakness: they learn the style of the models they saw, so new models, paraphrased text and unusual human prose can break them.
- **Perplexity and burstiness** `[outside source]`. Perplexity measures how predictable the text is to a language model; burstiness measures how much that varies from sentence to sentence. Model output tends to be predictable and even.
  - Weakness: formulaic human writing (legal, technical, template-taught, non-native, heavily edited) is predictable too, a main cause of false positives.
- **Surface-pattern detection.** Looking for repeated words, formulaic transitions, uniform grammar and hallucinations.
  - Weakness: resemblance is not provenance. Polished human prose matches the same patterns. A human reviewer (or you) doing this by eye has the same limit.
- **Stylometry / baseline comparison** `[outside source]`. Compare the text with verified earlier writing by the claimed author.
  - Weakness: it needs a reliable baseline, so it cannot work on a lone anonymous text. When a baseline exists it is the most informative method here.
- **Retrieval** `[outside source]`. Check the text against a store of a vendor's own outputs.
  - Weakness: only works if the vendor kept the outputs, and only for that vendor's model.
- **Watermarking.** The generator embeds a statistical signal at generation time (see Watermarking below).
  - Weakness: needs the vendor's cooperation and the vendor's own detector.

## Measured accuracy

- **Weber-Wulff et al., 2023.** Tested 14 detection tools, including Turnitin and GPTZero.
  - All scored below 80% accuracy and only 5 scored above 70%.
  - The tools leaned toward labelling text as human, and accuracy dropped after paraphrasing.
  - MIT Technology Review likewise reported detectors struggling with lightly rearranged ChatGPT text.
- **Turnitin claims versus a newspaper test.** Turnitin claimed a false positive rate under 1% and stated a 15% false negative rate.
  - The Washington Post later found a 50% false positive rate in its own test, which used a smaller sample.
  - A vendor claim and a small independent test disagree widely, so neither is a number to quote as fact about a particular text.
- **Paraphrase tools, Eye journal, August 2023.** For 20 abstracts paraphrased with GPT-4, Originality.AI had a mean accuracy of 91.3% on the GPT-4 text.
  - After the text was reprocessed with Undetectable.ai, mean accuracy fell to 27.8%.
- **Human readers are not better.** A 2025 study found people's ability to tell LLM text from human text was no better than chance.
  - A 2025 German-thesis study found recognition rates of 57% for AI texts and 64% for human texts.
- **Heavy users do better.** A 2025 preprint found that a subset of annotators who were heavy ChatGPT users for writing identified 90% of AI text with a 3.3% false positive rate; annotators who were not heavy users did only slightly better than chance. Familiarity helps, but gut feeling alone is not a method.
- **Why false negatives matter less to schools.** The Wikipedia article observes that missed AI text rarely leads to accusations, whereas false positives do. That is why the sections below concentrate on false positives.

## Bias and false positives

- **Non-native English writers.** Liang et al., July 2023, tested 7 detectors: essays by non-native English speakers averaged a 61.3% false positive rate.
  - `[outside source]` A likely reason is that limited vocabulary and template-taught structure look "predictable" to a classifier.
- **Demographic gaps.** Common Sense Media, September 2024: AI detectors showed a 20% false positive rate for Black students, 10% for Latino students and 7% for White students.
- **Neurodivergent writers.** The Wikipedia article reports, citing Stanford HAI and a University of Nebraska teaching centre, that detection also appears to discriminate against neurodivergent people. No figure is given.
- **Formulaic genres** `[outside source]`. Legal text, abstracts, boilerplate, simple vocabulary and template-taught essays are low-variance and resemble LLM style.
- **Famous human text gets flagged.** Parts of Janelle Shane's book *You Look Like a Thing and I Love You* were flagged as AI in June 2023. If professionally edited writing trips detectors, a flag is weak evidence for anyone. `[outside source]` The anecdote that historic texts such as the US Constitution get flagged circulates widely but is not in the sources used here.

## Documented harms

- **UC Davis, 2023.** Two students were referred to student judicial affairs after GPTZero and Turnitin flagged their essays.
  - After media coverage and investigation both were cleared.
- **Texas A&M University-Commerce, May 2023.** A professor asked ChatGPT whether students' work was AI-written, it said yes, and he threatened to fail the class.
  - All but one student (who admitted using the software) were cleared.
  - A chatbot's "yes, I wrote this" or "no, I didn't" is not evidence: it is not a detector. Never use it as a check, and never report it as one.
- **Gizmodo, June 2024.** Freelance writers and journalists reportedly lost work after detectors wrongly labelled their writing as AI.
- **Institutions backing away.** In April 2023 Cambridge and other UK Russell Group universities opted out of Turnitin's AI detection over reliability concerns; the University of Texas at Austin followed about six months later. `[outside source]` OpenAI also withdrew its own text classifier, citing low accuracy.

## Evasion

- Paraphrasing, style editing and removing repeated discourse markers can sharply cut detector effectiveness. Dedicated "humanizer" tools exist (the Wikipedia article names Undetectable.ai); see the 91.3% to 27.8% figure above.
- Weber-Wulff et al. found that accuracy dropped after paraphrasing for every tool tested.
- Light human editing of model output `[outside source]` also removes most surface signals.
- **Mixed writing is the hardest case.** Human text lightly polished by an AI editor, AI text edited by a person, and interleaved passages all sit between the two poles.
  - The Wiki Education module notes that Pangram typically gives an intermediate AI probability for such text.
  - An intermediate score hints at mixed writing but cannot reveal the process. It cannot tell harmless copyediting from hallucinations that were hand-edited to evade detection.
  - Content checks (do the sources exist and say this?) are what separate the two.
- No AI markers does not mean human. Newer models are often tuned to avoid classic tells, so a clean text proves little.

## Watermarking

- **Text.** Kirchenbauer et al., 2023, "A Watermark for Large Language Models": an imperceptible statistical watermark can flag text as AI-generated with high accuracy, even after slight paraphrasing. The Wikipedia article lists the open problems: robustness to adversarial changes, and working across different LLMs. Insertion, deletion, substitution, tokenization and homoglyph attacks can weaken it, at a cost in text quality.
- **Images.** Google DeepMind's SynthID (August 2023) embeds an invisible watermark in image pixels.
- **A model reading text cannot detect a statistical watermark.** The signal is in token choice probabilities, not in anything a reader (human or LLM) sees. If the user asks "can you check for the watermark?", say no.
- **No watermark found is not "human".** `[outside source]` Most text from most tools carries no detectable watermark, and a check works only with the vendor's own detector for that vendor's output.

## How to talk about a detector score

A score is the output of a classifier with known, non-trivial error rates. It is a pointer, not a measurement of authorship.

**What it means.**
- The tool judged that this text resembles the text it learned to call "AI".
- Wiki Education reads a high Pangram result as "this probably came straight from an AI tool" and an intermediate one as "possibly mixed".

**What it does not mean.**
- It is not proof, and it does not say how the text was produced or whether the author did anything wrong.
- "78% AI" is not "78% chance this was written by AI". Depending on the tool, the number may be the model's confidence or the share of sentences it judged AI-like `[outside source]`, and tools differ in how they are calibrated.
- Even a well-calibrated figure depends on how common AI text is in the pool being checked `[outside source]`. At Turnitin's claimed under 1% false positive rate, 10,000 human-written essays could still produce up to about 100 false flags (simple arithmetic on the claimed figure).
- A low score does not clear a text: paraphrasing and humanizers defeat detectors.
- The same score means different things for different writers: the 61.3% figure applies to non-native English essays.

**How to combine it with content checks.** Treat the score as a reason to look, then check things that can be verified:
- Do the cited sources exist, and does each say what is claimed?
- Are there hallucinated specifics, or claims nobody can trace?
- Does the text match the writer's earlier work, and can the author explain it?
- Do drafts or edit history show how it grew?

If the content checks are clean, a high score has little left to stand on. If they are bad, the problem is the unreliable content, whoever or whatever wrote it.

**Example answer.** "The 78% is a classifier's output, not the chance the essay is AI. Independent tests found tools like this under 80% accurate, and one study found them flagging 61.3% of non-native English essays as AI when they were human. I would not base a decision on it. Use it as a prompt to check: do the cited books exist, and does the student's earlier in-class writing sound like this? The best next step is to ask them to talk you through the argument and show their drafts."

Never give a numeric "AI probability" of your own for the same reason: nobody has the precision it implies. Use the verdict scale and a low / medium / high confidence word from SKILL.md.
