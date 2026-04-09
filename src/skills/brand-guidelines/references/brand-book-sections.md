# Brand Book Sections — Content Standards

Guidelines for creating high-quality content in each section of the brand book.

---

## 1. Cover Page

**Purpose**: First impression — establish the brand's visual identity immediately.

**Must include**:
- Brand name in the heading font at large scale
- Tagline if available
- Generation date
- Personality keywords as tags

**Quality markers**:
- Background uses the brand's dark color, text uses the light color
- If logo exists, display it prominently above the brand name
- Clean, spacious layout — less is more on a cover

**Common mistakes**:
- Cluttered with too much information
- Using generic white background instead of brand colors
- Missing date (makes the document feel undated/unofficial)

---

## 2. Table of Contents

**Purpose**: Navigation aid, especially for longer brand books.

**Must include**:
- Numbered sections with anchor links
- Section numbers styled with primary color

**Quality markers**:
- Clickable links that jump to sections
- Clean numbering with leading zeros (01, 02, ...)
- Consistent with the brand's typography hierarchy

---

## 3. Color Palette

**Purpose**: Define every color in the system so anyone can reproduce the brand accurately.

**Must include per color**:
- Visual swatch (large enough to see the color clearly — min 120px height)
- Semantic name (e.g. "Brand Blue", not just "Primary")
- Hex code
- RGB values
- HSL values
- WCAG contrast ratios against white and black backgrounds
- AA/AAA compliance badges

**Must include sections**:
- Primary, secondary, accent colors
- Background colors (light and dark)
- Semantic colors (success, warning, error, info)
- A contrast ratio matrix showing which text/background combinations are accessible

**Quality markers**:
- Every color has a human-readable name, not just a code
- Contrast ratios are calculated and displayed, not left to the reader
- Colors are grouped by function (brand colors, backgrounds, semantic)
- Light and dark mode palettes shown side by side

**Common mistakes**:
- Showing colors without contrast data (accessibility gap)
- Only showing hex — missing RGB/HSL makes cross-platform work harder
- No semantic color names (developers won't know which color to use where)

---

## 4. Typography

**Purpose**: Define the type system so text looks consistent everywhere.

**Must include**:
- Font names with fallback stacks
- Weight specifications (which weights to use for what)
- Size scale (H1 through caption with rem and px values)
- Live specimens at each scale level using the actual font
- Line height recommendation (typically 1.5-1.6 for body, 1.2-1.3 for headings)
- Letter spacing notes if applicable

**Structure**:
```
Font Table:
| Role     | Font            | Weights   | Fallback          |
|----------|-----------------|-----------|-------------------|
| Headings | [heading font]  | 600, 700  | [fallback stack]  |
| Body     | [body font]     | 400, 500  | [fallback stack]  |
| Mono     | [mono font]     | 400       | [fallback stack]  |

Scale Specimens:
H1 (3rem/48px) — "The quick brown fox..."
H2 (2.25rem/36px) — "The quick brown fox..."
...
Body (1rem/16px) — Full paragraph of sample text
```

**Quality markers**:
- Specimens use the actual brand font (loaded via Google Fonts)
- Each specimen shows the font name, weight, and size as a label
- Body text specimen includes a full paragraph to show readability
- Weight demonstrations show the same text at different weights

**Common mistakes**:
- Only listing font names without showing specimens
- Missing fallback stacks (fonts won't load offline)
- Not showing the full type scale in use
- Forgetting monospace font for technical brands

---

## 5. Logo Usage

**Purpose**: Ensure the logo is used correctly and consistently everywhere.

**Must include**:
- Logo display area (centered, generous whitespace)
- Logo on light background variant
- Logo on dark background variant
- Minimum size specification
- Clear space diagram (how much empty space around the logo)
- Do's and Don'ts grid (at least 3 of each)

**Do's (always include)**:
- Use on clean, solid backgrounds
- Maintain original proportions
- Use approved color variants
- Ensure sufficient contrast with background

**Don'ts (always include)**:
- Stretch or distort the logo
- Rotate or flip the logo
- Change brand colors
- Place on busy/patterned backgrounds
- Add drop shadows, outlines, or effects
- Crop or partially hide the logo

**Quality markers**:
- Visual do/don't examples (green border for do, red for don't)
- Clear space shown as a proportional rule ("1x the logo height")
- Multiple background variants demonstrated
- If no logo file provided, clean placeholder with documentation for future use

**Common mistakes**:
- Vague clear space rules ("leave some space" vs "1x height on all sides")
- Missing dark background variant
- Not showing minimum size (logo becomes unreadable below certain sizes)

---

## 6. Voice & Tone

**Purpose**: Ensure written communication sounds like the brand.

**Must include**:
- Overall style description (1-2 sentences)
- Words/phrases to use (displayed as green chips/tags)
- Words/phrases to avoid (displayed as red chips/tags)
- 3 context-specific examples: marketing, customer support, technical/documentation

**Example format**:
```
Context: Marketing Headline
"Build products your users love — in half the time."

Context: Customer Support
"I understand the frustration. Here's how we can fix this together..."

Context: Technical Documentation
"The API accepts a JSON payload with the following fields..."
```

**Quality markers**:
- Examples feel authentic, not generic
- Do/don't words are specific to the brand (not just "be nice")
- Tone adapts by context but stays recognizably the same brand
- Style description uses an analogy ("like a smart colleague", "like a trusted advisor")

**Common mistakes**:
- Too vague ("be professional" — what does that mean?)
- Same tone for all contexts (marketing copy shouldn't sound like docs)
- Only "don't" rules without "do" examples
- Generic examples that could apply to any brand

---

## 7. Spacing & Layout

**Purpose**: Define the spatial rhythm that makes designs feel cohesive.

**Must include**:
- Base unit value (typically 4px or 8px)
- Spacing scale as a visual bar chart (each step shown as a proportional bar)
- Border radius specimens at each size
- Shadow/elevation specimens (if used)

**Visual format**:
- Spacing bars: vertical colored bars of increasing height, labeled with px values
- Radius demo: squares with increasing border-radius, labeled
- Shadow demo: cards with different shadow levels

**Quality markers**:
- Scale values feel intentional (mathematical progression, not random)
- Border radius matches brand personality (sharp = serious, round = friendly)
- Shadow levels are distinct but not overdone
- All values are easily copy-pasteable

**Common mistakes**:
- Spacing scale with too many values (8+ is hard to remember)
- Border radius doesn't match the brand feel
- Shadows too aggressive or inconsistent

---

## 8. Component Examples

**Purpose**: Show how the brand system looks applied to common UI elements.

**Must include**:
- Buttons: primary, secondary, ghost/text variants
- Card component with header, body, and optional footer
- Form input in default and focus states
- Alert/notification in all 4 semantic colors

**Quality markers**:
- Components use CSS custom properties from the brand (not hardcoded colors)
- Hover states and focus states are visible
- Components feel cohesive — they clearly belong to the same design system
- Each component is labeled with its variant name

**Common mistakes**:
- Components use hardcoded colors instead of brand variables
- Missing interactive states (hover, focus)
- Components look generic / not branded

---

## 9. Quick Reference Card

**Purpose**: One-page summary for quick access to key brand values.

**Must include**:
- All color hex codes in a compact list
- Font names and key weights
- Spacing base unit and scale
- Border radius values
- Key voice guidelines (1 sentence)

**Structure**: 2-column grid of compact cards, each covering one category.

**Quality markers**:
- Everything fits in one screen/page
- Values are copy-paste ready (monospace font for codes)
- No explanations — just values (this is a cheat sheet)

**Common mistakes**:
- Too much text (this should be scannable in 5 seconds)
- Missing key values that developers need daily
- Using descriptions instead of raw values
