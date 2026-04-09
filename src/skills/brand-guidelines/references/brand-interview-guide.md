# Brand Interview Guide

Detailed question bank, follow-up trees, and smart defaults for the brand interview process.

## Interview Approach

- Present questions in batches per stage, not one at a time
- If user says "skip" or "default", apply industry-appropriate defaults
- If user gives partial answers, acknowledge what was provided and fill the rest with defaults
- Always confirm generated/defaulted values before proceeding

---

## Stage 1: Brand Identity

### Questions
```
1. What is your brand name?
2. Do you have a tagline or slogan? (optional)
3. What industry or domain are you in?
4. Describe your brand personality in 3-5 adjectives
   (examples: bold, friendly, minimal, luxurious, playful, professional, innovative, trustworthy)
```

### Follow-ups
- If user says "modern": "Modern can mean different things — do you lean more toward clean/minimal (like Apple) or futuristic/cutting-edge (like a tech startup)?"
- If user says "professional": "Professional as in corporate/formal (think law firm) or professional as in competent/reliable (think SaaS product)?"
- If only 1-2 adjectives given: suggest 2-3 complementary options based on industry

---

## Stage 2: Color Palette

### Questions
```
1. Primary brand color (hex code, or describe it, e.g. "deep blue", "warm orange")
2. Secondary color (for dark backgrounds, headings, or supporting elements)
3. Accent color(s) for CTAs, highlights, interactive elements
4. Do you need light and dark mode backgrounds? (defaults: #FFFFFF / #0F172A)
5. Semantic colors — or just use standard defaults? (green=success, yellow=warning, red=error, blue=info)
```

### Follow-ups
- If user provides brand name but no colors: "I can suggest a palette based on your brand personality. Want me to generate 2-3 options?"
- If user gives only primary: "I'll derive secondary and accent colors that complement your primary. Shall I suggest options?"
- If color described in words: map to hex suggestions and confirm

### Personality-to-Palette Algorithm

When generating palette suggestions, use personality adjectives to guide hue, saturation, and lightness:

| Adjective | Hue Direction | Saturation | Notes |
|-----------|---------------|------------|-------|
| bold | Red, deep blue, black | High | Strong contrast |
| friendly | Yellow, orange, teal | Medium-high | Warm, inviting |
| minimal | Gray, slate, muted blue | Low-medium | Desaturated |
| luxurious | Gold, deep purple, black | Medium | Rich, dark |
| playful | Pink, bright green, purple | High | Vibrant, varied |
| professional | Navy, charcoal, steel blue | Medium | Conservative |
| innovative | Electric blue, violet, teal | High | Future-forward |
| trustworthy | Blue, green, slate | Medium | Stable, calming |
| warm | Amber, terracotta, coral | Medium-high | Earth tones |
| elegant | Black, cream, rose gold | Low-medium | Refined |
| energetic | Orange, red, yellow-green | High | Dynamic |
| calm | Sage green, sky blue, lavender | Low | Soft, muted |

### Palette Generation Process

1. Take the dominant personality adjective
2. Select base hue from the table above
3. Generate primary at 50-60% saturation, 40-50% lightness
4. Derive secondary by shifting hue 180-210 degrees or darkening primary
5. Derive accent by shifting hue 30-60 degrees with increased saturation
6. Always generate 2-3 options for user to choose from

---

## Stage 3: Typography

### Questions
```
1. Heading font (e.g. Inter, Poppins, Playfair Display — must be on Google Fonts for web)
2. Body text font (can be the same as heading or a complementary pairing)
3. Monospace font for code/technical content? (optional, default: JetBrains Mono)
4. Preferred font weights? (default: 400, 500, 600, 700)
```

### Follow-ups
- If user has no preference: "Based on your brand personality, I'd recommend [font pair]. Want me to suggest 2-3 options?"
- If user names a non-Google-Fonts font: "That font isn't on Google Fonts, so it won't load automatically in browsers without it installed. Want to use it anyway (with a fallback), or pick an alternative?"

### Font Pairing Recommendations by Personality

| Personality | Heading Font | Body Font | Rationale |
|------------|-------------|-----------|-----------|
| Bold / Modern | Inter, DM Sans | Inter, DM Sans | Clean geometric sans |
| Friendly / Warm | Nunito, Quicksand | Nunito Sans, Open Sans | Rounded, approachable |
| Professional / Formal | Playfair Display | Source Sans 3 | Serif authority + sans readability |
| Luxurious / Elegant | Cormorant Garamond, Libre Baskerville | Lato, Raleway | Classic serif + refined sans |
| Playful / Creative | Fredoka, Baloo 2 | Nunito Sans, Poppins | Fun display + clean body |
| Minimal / Clean | Space Grotesk, Outfit | Space Grotesk, Outfit | Geometric, unadorned |
| Tech / Innovative | JetBrains Mono, IBM Plex Sans | IBM Plex Sans, Inter | Technical precision |
| Traditional / Trust | Merriweather, Lora | Source Serif 4, Noto Serif | Classic readability |
| Energetic / Dynamic | Montserrat, Rubik | Rubik, Open Sans | Strong + versatile |

### Type Scale Defaults

```
H1: 3rem (48px)    — Page titles
H2: 2.25rem (36px) — Section titles
H3: 1.875rem (30px) — Subsections
H4: 1.5rem (24px)  — Card titles
H5: 1.25rem (20px) — Labels
Body: 1rem (16px)   — Main text
Small: 0.875rem (14px) — Secondary text
Caption: 0.75rem (12px) — Metadata
```

---

## Stage 4: Logo & Imagery

### Questions
```
1. Do you have a logo file? If so, what's the file path?
   (supports SVG, PNG, JPG — SVG preferred for quality)
2. What's the minimum display size for the logo?
   (default: 32px height)
3. How much clear space should surround the logo?
   (default: "1x the logo height on all sides")
4. What should never be done to the logo?
   (defaults: stretch, rotate, recolor, add shadows/effects, place on busy backgrounds)
5. Photography / illustration style? (e.g. lifestyle, flat illustration, 3D renders)
6. Icon style? (outlined, filled, duotone)
```

### Follow-ups
- If no logo: "No problem — I'll create a placeholder section. You can add the logo later."
- If user provides a file path: verify it exists, determine format, prepare for base64 embedding

---

## Stage 5: Voice & Tone

### Questions
```
1. How would you describe your communication style?
   (formal, casual, technical, friendly, authoritative, empathetic)
2. Any specific words or phrases your brand always uses?
3. Any words or phrases to avoid?
4. Can you provide an example sentence as if writing:
   a) A marketing headline
   b) A customer support reply
   c) A technical description
```

### Follow-ups
- If user says "friendly but professional": "Great — think of it as 'a knowledgeable colleague explaining something over coffee'. Would that capture it?"
- If user skips: generate defaults based on industry + personality adjectives

### Defaults by Industry

| Industry | Default Style | Do Words | Don't Words |
|----------|--------------|----------|-------------|
| Technology | Direct, clear | build, ship, scale, seamless | synergy, leverage, disrupt |
| Healthcare | Empathetic, reassuring | care, support, wellness | guarantee, cure, cheap |
| Finance | Authoritative, transparent | secure, grow, protect | risk-free, guaranteed returns |
| E-commerce | Persuasive, enthusiastic | discover, save, exclusive | buy now (overused), limited time only |
| Education | Encouraging, clear | learn, explore, master | easy, simple (can be patronizing) |
| Creative | Expressive, inspiring | create, craft, imagine | basic, generic, template |

---

## Stage 6: Spacing & Layout

### Questions
```
1. Base spacing unit (default: 8px — industry standard, works well with 4px grid)
2. Custom spacing scale? (default: 4, 8, 12, 16, 24, 32, 48, 64)
3. Border radius style:
   - Sharp (0-2px) — corporate, serious
   - Moderate (4-8px) — balanced, modern
   - Rounded (12-16px) — friendly, soft
   - Pill (9999px) — playful, bold
4. Shadow/elevation preference:
   - None — flat design
   - Subtle — light depth
   - Pronounced — material design style
```

### Defaults by Personality
- Minimal: 8px base, 4px radius, no shadows
- Friendly: 8px base, 12px radius, subtle shadows
- Bold: 8px base, 8px radius, pronounced shadows
- Elegant: 8px base, 2px radius, subtle shadows
- Playful: 8px base, 16px+ radius, medium shadows

---

## Complete Interview Example

### Tech SaaS Startup

```
Brand name: Flowbase
Tagline: Build faster, ship smarter
Industry: Technology / SaaS
Personality: innovative, clean, trustworthy

Colors:
- Primary: #2563EB (Vivid Blue)
- Secondary: #0F172A (Dark Navy)
- Accent: #10B981 (Emerald Green)
- Background light: #FFFFFF
- Background dark: #0F172A
- Semantic: defaults

Typography:
- Heading: Inter (600, 700)
- Body: Inter (400, 500)
- Mono: JetBrains Mono

Logo: /assets/flowbase-logo.svg
Min size: 24px height
Clear space: 1.5x height
Prohibited: stretch, rotate, recolor, add gradients

Voice: Direct and helpful — a smart colleague, not a robot
Do: "Here's how to...", "You can...", "Let's..."
Don't: "Please be advised that...", "Per our records..."

Spacing: 8px base, moderate radius (8px), subtle shadows
```

### Luxury Fashion Brand

```
Brand name: Maison Élise
Tagline: Timeless elegance, modern craft
Industry: Fashion / Luxury
Personality: elegant, refined, exclusive

Colors:
- Primary: #1C1917 (Rich Black)
- Secondary: #78716C (Warm Stone)
- Accent: #B8860B (Dark Gold)
- Background light: #FAFAF9
- Background dark: #1C1917
- Semantic: defaults

Typography:
- Heading: Cormorant Garamond (500, 700)
- Body: Lato (300, 400)
- Mono: none

Logo: /brand/elise-monogram.svg
Min size: 40px height
Clear space: 2x height
Prohibited: change colors, add effects, use on patterned backgrounds

Voice: Refined and understated — suggest rather than sell
Do: "Discover", "Curated", "Artisan"
Don't: "Cheap", "Deal", "Hurry"

Spacing: 8px base, sharp radius (2px), no shadows
```
