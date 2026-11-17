# Non-English texts

Compiled from practitioner observation of LLM output; treat phrase lists as heuristics, not proof.

No phrase below is evidence on its own. As in the main workflow, what counts is density and co-occurrence across families (stock openers, connector chains, puffery, uniform structure, a tidy summary), with nothing in the text that breaks the pattern. Tier 1 and Tier 2 evidence (chatbot leftovers, placeholders, fabricated citations) works in every language and outweighs everything on this page.

## How the general signs transfer

**Language-independent (use at full strength):**
- Chatbot leakage and addressing the prompter: «Конечно! Вот ваша статья», «Надеюсь, это поможет», "Natürlich! Hier ist…", "¡Claro! Aquí tienes…", "Bien sûr ! Voici…".
- Placeholders, tool residue (`oaicite`, `utm_source=chatgpt.com`), Markdown where it does not render.
- Fabricated or mismatched citations, invented URLs, DOIs and ISBNs. Check them the same way as for English.
- Uniform structure: paragraphs of equal length, each with a topic sentence and a neat wrap-up; no tangents.
- Rule of three, inline-header bold lists, emoji bullets, "balanced" both-sides framing, a summary that restates the body.
- Puffery and significance inflation: everything "plays a key role", is "a testament to", "a rich heritage".
- Generic content where specifics are expected.

**English-specific (do not apply directly):**
- The word list ("delve", "tapestry", "testament", "underscore"). Each language has its own favourites; translating the English list into the target language finds nothing useful.
- Curly quotes: many languages use their own quotation marks as ordinary typography (see below).
- Copula avoidance ("serves as", "stands as") is an English habit. Russian goes the other way and over-uses «является».
- Trailing "-ing" analysis has no direct equivalent. The nearest relatives are participial or «что позволяет…» tails.
- Em-dash overuse depends on the language's dash norms (Russian predicate dash is standard).

**Calques.** LLM text in other languages often reads like fluent translation from English: English sentence rhythm, English connector chains, literal idioms ("play a role", "at the end of the day", "in today's world"). This is a real signal, but it has a false-positive twin: human text translated from English, by a person or by Google/Yandex/DeepL, also shows calques (translationese). Tell them apart by the kind of flaw. Machine-translated human text has literal lexical errors, wrong word senses, odd word order and untranslated idioms, but keeps the original author's specifics and uneven structure. LLM-written text is fluent and clean but generic. Ask whether the text is a translation at all before reading calques as AI evidence.

## Russian

### Stock phrases by function

- **Openers** — «В современном мире…», «В эпоху цифровых технологий…», «В наше время…», «Сегодня сложно представить…», «Многие задаются вопросом…», «Давайте разберёмся». Calques of "In today's fast-paced world" and "Let's dive in".
- **Connector chains** — «Кроме того…», «Более того…», «Помимо этого…», «Также стоит отметить…» opening consecutive paragraphs. LLMs mirror English "Moreover/Furthermore" chaining. *Caveat:* school essays are taught the same connectors.
- **Attention markers** — «важно отметить», «стоит отметить», «следует подчеркнуть», «необходимо учитывать». One per text is ordinary; one per paragraph is a pattern.
- **Puffery** — «играет ключевую роль», «играет важную роль в формировании», «является неотъемлемой частью», «невозможно переоценить», «открывает двери», «богатое наследие», «яркий пример», «настоящая жемчужина», «неповторимая атмосфера», «является свидетельством». Strongest when applied to mundane subjects (a town, a software library, a regional museum).
- **Marketing verbs and adjectives** — «уникальный», «широкий спектр», «комплексный подход», «способствует», «позволяет», «раскрыть потенциал», «погрузиться в мир», «бесшовная интеграция», «цифровой ландшафт». «Способствует» and «позволяет» are the Russian counterparts of "fosters" and "enables"; they appear in clusters.
- **Contrast formula** — «Это не просто X, а Y», «не только X, но и Y». Calque of "not just X, but Y". *Caveat:* «не только… но и» is normal Russian; the signal is the dramatic «это не просто…» form repeated within one text.
- **Filler calques** — «на самом деле» as a filler (from "actually"), «в конечном итоге» used where «в итоге» or nothing fits, «сделать вывод о том, что» (heavy but taught in school), «в рамках», «на данный момент времени».
- **Conclusions** — «Таким образом…», «В заключение…», «Подводя итог…», «В конечном счёте…» followed by a restatement («…играет ключевую роль и заслуживает внимания»). Often closed by an offer: «Если у вас остались вопросы, обращайтесь». The offer is Tier 1 if addressed to a prompter.
- **Equivocation** — «Многое зависит от конкретной ситуации», «У каждого подхода есть свои плюсы и минусы», «С одной стороны… с другой стороны» with no commitment at the end.
- **Direct chatbot Russian (Tier 1)** — «Отличный вопрос!», «Конечно, вот…», «Как языковая модель, я…», «Надеюсь, эта информация была полезной», «Дайте знать, если нужно изменить тон». Quote these; they outweigh every list above.
- **How to weigh the lists** — a single «важно отметить» or «таким образом» means nothing. Three or four families in the same text (an «В современном мире» opener, «играет ключевую роль» puffery, «Кроме того / Более того» chains, a «В заключение» restatement) is a pattern worth reporting.

### Typography and format tells

- **Quotation marks** — Russian text should use «ёлочки», with „лапки“ for nested quotes. LLMs usually keep «ёлочки» consistent, while people typing on a plain keyboard often use straight "…". Perfect «ёлочки» in a casual chat message is a mild hint; in a Word document, a CMS or an edited article it means nothing, because editors and typographers auto-convert. Mixed styles in one text lean human.
- **Dashes** — A spaced long dash is correct Russian for the predicate dash and for parentheticals, so it is not a tell by itself. Look at density and fit: dashes standing in for commas, colons or periods in every paragraph, in a context where the same writer types a hyphen " - " elsewhere.
- **Title Case in headings** — «Как Эффективно Управлять Своим Временем» is unnatural; Russian capitalises only the first word and proper names. This is a calque and a fairly good sign, unless the genre is marketing or a translated title.
- **Bold inline headers in lists** — «**Экономия времени:** автоматизация позволяет…» for every bullet, usually with parallel length and shape.
- **Emoji bullets and section markers** (✅ 🚀 💡) in text that is not a social-media post. Note that Telegram and Instagram copy is a human genre that does this too.
- **English-style commas** — a comma before the final «и» in a list (Oxford comma), or commas placed by English rules. Rare in current models but a good calque marker when present.
- **Not signs either way** — consistent use of «ё» or its absence (most people never type it); «№» versus "N"; non-breaking spaces.

### Grammar and style tells

- **Bland канцелярит with a marketing gloss.** Bureaucratic noun phrases («осуществление мероприятий по повышению эффективности») mixed with enthusiastic adjectives. A human bureaucrat is dull; a human marketer is loud; the LLM blends both in one paragraph.
- **Nominalisation and genitive chains** — «повышение эффективности управления процессами оптимизации». Grammatical, heavy, and constant across the text.
- **«Является» in place of the dash** — «Москва является столицей России» where a human writes «Москва — столица России». One instance is nothing; a text where «является» replaces the copula in most definitions is worth noting. Official and encyclopaedic human prose does the same.
- **Symmetry** — «с одной стороны… с другой стороны», parallel lists of three, paragraphs of equal length, a closing paragraph with the same shape as the opening one.
- **One register throughout** — the same polished, mid-formal tone from first sentence to last, whatever the topic. Humans drift: a formal start, a joke, an irritated aside.
- **No colloquial layer** — no particles («же», «вот», «ну», «ведь», «-то»), no interjections, no rhetorical asides, no sentence fragments, no half-finished thought.
- **Absence of errors is weak evidence.** Plenty of people write correctly, and spellcheckers, Word and editors remove «-тся/-ться» and comma slips. Presence of natural errors counts for more than absence (see Human signals).

### Critical false-positive trap: the school essay and bureaucratic Russian

Russian schools teach template writing. Essays for ОГЭ, ЕГЭ and the итоговое сочинение follow a fixed scheme: thesis, arguments introduced with «Во-первых… Во-вторых…», «Таким образом», a closing summary. Prep-book clichés are real and widely memorised: «Данная проблема актуальна во все времена», «Автор поднимает проблему…», «Позиция автора ясна», «Не могу не согласиться с автором», «Подводя итог, можно сделать вывод о том, что…». Human students produce all of this. A formulaic structure plus «Таким образом» plus connector chains is therefore not evidence in this genre.

What separates a real exam essay from an LLM one:
- **Named literature.** Exam criteria reward concrete arguments from reading, so human essays usually name works, authors and characters («Раскольников у Достоевского», «Печорин»). LLM essays tend to say «произведения классической литературы» or «многие великие писатели» without naming any, or name one famous book with generic plot details.
- **Which clichés.** Human essays use prep-book formulae («Автор поднимает проблему…», «В тексте нет прямого ответа, но…»). LLM essays use puffery that no prep book teaches: «открывает двери в мир знаний», «играет ключевую роль в формировании личности», «яркий пример».
- **Unevenness.** Real student essays have errors (commas, «-тся/-ться», agreement), a weak second argument, a strong first one, a rushed ending, an occasional misquote or misremembered plot. LLM essays are balanced, error-free and equal-length.
- **Personal anchor.** A school, a teacher, a named relative, a real incident, a quirk of the exam prompt. A text that answers the topic exactly but never touches a concrete life is more suspect.
- **Fit with the task.** Check whether the essay follows the exact source text or prompt the student was given; generic essays often drift from it.

Contrast in practice: «Автор поднимает проблему влияния книги на человека. Например, в романе Достоевского "Преступление и наказание" Соня Мармеладова…» is the prep-book pattern, and a human mark. «Литература открывает двери в мир знаний и играет ключевую роль в формировании личности. Произведения классической литературы показывают…» names nothing and is the LLM pattern.

Treat the essay verdict as at best "inconclusive" unless Tier 1/Tier 2 evidence or a clear baseline mismatch exists, and recommend the context-playbooks route (draft history, a conversation about the content).

The same logic applies to **канцелярит written by humans**: official letters, press releases, municipal-site news, corporate «о компании» pages, and SEO copy («купить недорого», keyword stuffing, rewritten text on «Дзен»). They are formulaic, puffed and generic by habit. Judge them by sourcing, specifics and date, not by tone.

### Human signals specific to Russian

- **Colloquial layer** — particles and fillers («ну», «вот», «же», «ведь», «короче», «типа»), «щас», «чё», «ща», «норм», сленг, мат, diminutives, humour that lands badly.
- **Natural errors** — missing commas before «что/который/а», «-тся/-ться», «не» fused or split with verbs, «ихний», wrong case endings, hyphen " - " instead of a dash, double spaces, inconsistent «ё», a Latin letter inside a Cyrillic word, text typed in the wrong keyboard layout.
- **Транслит and mixed script** — «хэндл», «лайкнуть», «dedlain», product names in Latin without declension handling, switches between Russian and English in the same sentence.
- **Local, checkable specifics** — a real district, a named teacher, «наша маршрутка №32», prices in рублей/гривен with actual numbers, dates, references to events that a model would have to know.
- **Opinions that commit.** A plain "по-моему, это бред" is a human mark; LLMs hedge.
- **Non-native Russian** — gender and case slips, aspect mistakes, calques from the writer's first language. This is a human signal and also a reason for caution: it often reads "off" for reasons unrelated to AI.
- **Caveat.** An LLM can be told to write casually, with slang and typos. Faked colloquialism is sparse, evenly sprinkled, and ornamental («Ну, короче, давайте разберёмся…»); genuine colloquial text is consistent with the writer's voice and tied to the situation.

## Humanizing Russian text

For rewrite mode. The pattern numbers are the § numbers in humanize.md; read the English entry for the reasoning and use this section for the Russian form. The general rules carry over: keep every fact, add no invented detail or personal anecdote, match the writer's voice, and leave alone anything inside a quotation, a title or a proper name.

### The patterns in Russian

| № | Pattern | Typical Russian form | How to rewrite |
|---|---|---|---|
| 1 | Не X, а Y | «Это не просто инструмент, а целая философия работы.» «Речь не о скидках. Речь о выборе.» | Say what the thing does: «Инструмент автоматически сверяет счета с заказами.» Keep the contrast only when the reader really believes X. |
| 2 | One-line closers, fragments | «И это главное.» «Просто задумайтесь.» «Никакой воды. Никакой суеты.» | Cut a line that repeats the paragraph. Merge fragments into one sentence with a concrete claim. |
| 3 | Sayings that sound deep | «По сути, всё упирается в доверие.» «В конечном счёте главный вопрос в том, готова ли команда меняться.» | Name the actual condition: «Всё зависит от того, выделит ли руководитель время на переход.» |
| 4 | Staged run-up | «Давайте разберёмся.» «Итак, начнём.» «Честно? Это зависит от нагрузки.» | Delete the run-up and open with the point: «Стоит ли оно своих денег, зависит от нагрузки.» |
| 5 | Arguing with no one | «Я не говорю, что документация не важна.» «Можно было бы подумать, что дело в длине промпта.» | Delete the defence. If it holds a claim, state the claim. Keep an objection the text attributes and answers. |
| 6 | Forced triads | «быстро, удобно и безопасно», «опыт, экспертиза и инновации» | Check that each item adds an idea. Merge items that repeat each other; keep three when there are three. |
| 12 | Stock words | ключевой, неотъемлемый, уникальный, данный, является, осуществлять, играет важную роль, широкий спектр | «данный» → «этот»; «осуществлять» → the plain verb; «широкий спектр услуг» → list the services. Drop «уникальный» unless it is true and shown. |
| 13 | Inflated significance | «стал важной вехой», «оставил неизгладимый след», «перспективы развития», «несмотря на трудности, продолжает развиваться» | Keep the fact, drop the verdict: «Музей открыли в 1989 году.» End on the last concrete fact, with no «Перспективы» section unless real plans exist. |
| 15 | Participle tails (the -ing analogue) | «…открыт в 1989 году, подчёркивая роль региона», «отражая богатую культуру» | Cut the tail, or state what the source supports as its own sentence. |
| 16 | Sales language | «живописный городок, уютно расположившийся в самом сердце долины» | Say what it is: «Городок в долине.» |
| 17 | Borrowed authority | «эксперты отмечают», «по мнению специалистов», «как считают аналитики» | Name the source and what it said, or cut the claim. |
| 18 | Copula avoidance | «является», «представляет собой», «выступает в качестве» | «есть», «это» or the dash: «Москва — столица», «Сервис — платформа», «Он посредник». |
| 19 | Bold labels | «**Экономия времени:** автоматизация позволяет…» on every bullet | Remove the bold. Turn the list into prose when the labels carry nothing. |
| 20 | Decorative headings | «Как Эффективно Управлять Временем», «🚀 Запуск» | Sentence case: «Как эффективно управлять временем». Remove emoji, arrows and rules. |
| 22 | Chatbot residue | «Отличный вопрос!» «Надеюсь, это поможет!» «Если нужно, могу сократить.» | Remove the wrapper and keep the content. |
| 23 | Knowledge-limit hedges | «на момент моих последних данных», «информации немного, однако, вероятно, он…» | Say what the source does not show, or cut the sentence. Delete the guess. |

### Канцелярит and nominalisation

- **Verbal nouns.** Restore the verb and the real subject: «осуществляется проведение проверки» → «проверяем»; «производится оплата» → «платим»; «осуществляется доставка» → «доставляем».
- **Genitive chains.** More than two genitives in a row is a signal to find the verb: «улучшение качества обслуживания клиентов компании» → «компания лучше обслуживает клиентов». Keep a chain that is a fixed term.
- **Connective filler.** «с целью», «в целях» → «чтобы»; «в рамках» → «в» or «при»; «имеет место» → «есть» or «происходит».
- **Impersonal passive.** «Было принято решение» → name the actor when the text gives one («директор решил»). If nobody is named, use a plain active form such as «решили», and never invent the actor.
- **Genre limit.** Official regulations, orders and contracts keep their register. Edit канцелярит only where the text is meant to read as ordinary prose.

### Punctuation in Russian rewrites

- The humanizer's "no em dashes" rule does not apply to grammatical тире. Keep it between subject and predicate («Москва — столица России»), where a predicate is omitted («Я — в магазин»), in dialogue, in ranges («2019–2021»), and before a generalizing word («Лес, река, поле — всё это входит в заповедник»).
- Remove only the dash that acts as a universal connector, where a comma, colon or period fits: «Мы обновили сайт — теперь заказ занимает минуту.» → «Мы обновили сайт: теперь заказ занимает минуту.»
- If the user's sample uses dashes, keep them at about the same rate.
- Keep «ёлочки» if the source uses them, and „лапки“ for nested quotes. The curly-to-straight rule (§21) does not apply.
- Do not replace «ё» with «е» or back, and do not "fix" correct typography such as a spaced dash, «№» or non-breaking spaces. Do not type a hyphen " - " in place of a dash to look human.

### Examples

**1. Promotional blog paragraph**

Before:
> Кофейня «Зерно», открывшаяся в 2019 году, — это не просто место, где можно выпить кофе, а настоящий островок уюта в самом сердце города. Здесь вас ждут свежая выпечка, ароматный кофе и приветливые бариста. Кофейня работает с 8 до 22 часов и играет важную роль в жизни района, подчёркивая его неповторимую атмосферу. Приходите и убедитесь сами!

After:
> Кофейня «Зерно» открылась в 2019 году в центре города. Здесь варят кофе и продают свежую выпечку, гостей встречают приветливые бариста. Кофейня открыта с 8 до 22 часов.

Cut: the contrast, the claim about the district (no checkable fact behind it) and the closing call to action.

**2. School-style paragraph with канцелярит**

Before:
> В настоящее время в нашей школе осуществляется проведение мероприятий по повышению уровня безопасности учащихся. Было принято решение об установке камер видеонаблюдения на всех этажах. Установка будет осуществлена в течение октября. Данные меры являются неотъемлемой частью обеспечения комфортного пребывания детей в учебном заведении.

After:
> Мы повышаем безопасность учеников: в октябре установим камеры видеонаблюдения на всех этажах.

The decision has no named actor in the source, so the rewrite uses the plain «мы». The last sentence only restated the purpose and is cut.

**3. Short business email with chatbot residue**

Before:
> Добрый день, Анна!
>
> Отличный вопрос! Рада сообщить, что отчёт за октябрь готов и является важной частью нашей квартальной отчётности. Согласно данным, выручка составила 4,2 млн рублей, что на 8% выше, чем в сентябре. Надеюсь, это поможет! Если нужно, могу подготовить подробную разбивку по клиентам.
>
> С уважением,
> Мария

After:
> Добрый день, Анна!
>
> Отчёт за октябрь готов, он входит в квартальную отчётность. Выручка составила 4,2 млн рублей, на 8% больше, чем в сентябре.
>
> С уважением,
> Мария

The greeting and sign-off stay. The praise, the hope and the generic offer are chatbot wrapper (§22) and carry no fact.

### Do not fix

- Quotations, titles, names and terms, including calques that are the established term in the field.
- Fixed formulas of business correspondence: «Добрый день», «С уважением», «Прошу рассмотреть».
- Mandatory wording in contracts, regulations, instructions and legal notices.
- Correct typography and spelling (see the punctuation rules above).

## Other languages (brief)

### German

- Stock phrases: «Es ist wichtig zu beachten, dass…», «spielt eine entscheidende Rolle», «In der heutigen schnelllebigen Welt», «Zusammenfassend lässt sich sagen», «Darüber hinaus», «ein breites Spektrum an», «in die Welt von … eintauchen».
- Typography: „deutsche“ quotes are standard; English "…" quotes in a text claiming to be a native German publication are a mild calque. Swiss "ss" for "ß" is regional, not a sign.
- Notes: compound nouns and long sentences are normal German, not a tell. LLM German tends towards an unusually smooth Hochdeutsch with no dialect colour or regional words.
- **Trap:** the school *Erörterung* (linear or dialectic: Einleitung, Hauptteil, Schluss, «Einerseits… andererseits», «Meiner Meinung nach»), and Behördendeutsch.

### Spanish

- Stock phrases: «Es importante destacar que…», «juega un papel crucial/fundamental», «En el mundo actual», «En conclusión», «un abanico de», «sumergirse en», «un testimonio de», «rico patrimonio cultural».
- Notes: «jugar un papel» is itself a calque of "play a role" (the traditional form is «desempeñar un papel») but is common in human Spanish too. «Cabe destacar» is ordinary formal Spanish. LLM output tends towards a neutral, regionless Spanish; real writers show voseo, «vale», «che», «chévere», local slang and punctuation habits.
- **Trap:** the *comentario de texto* and *redacción* taught for Selectividad (EBAU/PAU), with fixed «En primer lugar… En segundo lugar… En conclusión», and administrative prose.

### French

- Stock phrases: «Il est important de noter que…», «joue un rôle crucial/clé», «Dans le monde d'aujourd'hui», «En conclusion», «En somme», «Il convient de souligner», «plonger au cœur de», «riche patrimoine», «un véritable… ».
- Typography: French uses «guillemets» and a non-breaking space before `: ; ! ?`. LLM output often gets the guillemets but is inconsistent with the spaces. Humans on keyboards drop the spaces too, so it is a weak signal in both directions.
- **Trap:** the *dissertation* (thèse, antithèse, synthèse; «Dans un premier temps… Dans un second temps… Pour conclure»), taught as a fixed plan, and French administrative prose.

### Ukrainian

- Stock phrases: «відіграє ключову роль», «варто зазначити», «слід підкреслити», «у сучасному світі», «Підсумовуючи», «Отже» in chains. They are calques of the same English and Russian templates.
- Russian interference: «приймати участь» (for «брати участь»), «являється» (for «є»), «на протязі» (for «протягом»), «в залежності від» (for «залежно від»). Weaker models, machine translation from Russian and many bilingual humans all produce these, so they point away from "polished native text" without pointing to any one source. Current models mostly avoid them.
- Apostrophe style (’, ' or ʼ) is not a sign.
- **Trap:** the school *твір*, structured the same way as the Russian essay, and official *діловий стиль* with its «з метою забезпечення…» clauses.

## Working with a language you can't judge well

- Lower confidence by at least one step, and say in Caveats that language competence is limited. A verdict resting on phrase lists in a language you read less fluently is a Tier 3 verdict with extra uncertainty.
- Lean on language-independent tiers: chatbot artifacts, placeholders, Markdown residue, fabricated citations and uniform structure. Check references the same way you would in English.
- Do not translate the text into English and judge the translation. Translation erases the original's flaws and rhythm, and it adds English-style fluency that looks like LLM text.
- Do not apply the English catalogue's vocabulary list to the translation or to the original.
- Ask for the writer's baseline in that language and the genre, since both change the reading more than any phrase.
- Recommend review by a native speaker who knows the genre, and process steps (drafts, history, a talk with the author) over a style-based verdict.
