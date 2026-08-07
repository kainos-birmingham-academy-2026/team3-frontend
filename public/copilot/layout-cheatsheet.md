# Layout cheat-sheet — Kainos PowerPoint master v2 (48 layouts)

**Auto-derived from the bundled `references/templates/kainos-pptx-master.pptx` (SharePoint `Powerpoint master template v2.potx`, last refreshed 2026-06-22).** Regenerate this file whenever the template date-check (see `SKILL.md` Step 2) refreshes the master — the layout count, names, and `idx` numbers below come straight from that file, so a stale cheat-sheet sends the build to the wrong slot.

- **`L<n>` = `slideLayout<n>.xml`** — the number is the real layout-part number, so `L41` is `ppt/slideLayouts/slideLayout41.xml`.
- Canvas: **13.33" × 7.5"** (16:9). Positions are inches from top-left, taken from each placeholder's `<a:off>`. Most placeholders inherit their **size** from the master, so only position + font size are listed.
- `idx` matches the placeholder `idx` attribute — use it to map content to the right slot.
- Character budgets are not listed per-slot; treat big-font slots (48pt+) as single-line/short and **verify visually**.

## Quick index

| L# | Layout name | Placeholders | Media |
|----|-------------|--------------|-------|
| L1 | Title Slide | 5 | img |
| L2 | 1_Title Slide | 2 | — |
| L3 | Title | 3 | — |
| L4 | 2_Title Slide | 5 | — |
| L5 | Agenda slide | 13 | — |
| L6 | List and image | 3 | img |
| L7 | Illustration and 2 heading | 6 | img |
| L8 | 3 column content | 8 | img |
| L9 | 1_Timeline | 12 | — |
| L10 | Image and content | 3 | img |
| L11 | Right hand side image | 3 | img |
| L12 | Timeline | 13 | — |
| L13 | Speaker slide | 10 | img |
| L14 | 3 column no image | 4 | — |
| L15 | Large illustration breaker slide | 2 | img |
| L16 | Large image breaker slide | 2 | img |
| L17 | One column text | 2 | — |
| L18 | Two column text | 2 | — |
| L19 | Gradient image and text | 3 | img |
| L20 | Image right hand side gradient | 2 | img |
| L21 | Image left hand side | 2 | img |
| L22 | Image right hand side | 2 | img |
| L23 | 1_Image and content | 3 | img |
| L24 | Title and Content | 3 | — |
| L25 | 1_One column text | 2 | — |
| L26 | Agenda | 3 | — |
| L27 | Full image introduction | 3 | img |
| L28 | 3 statement | 7 | — |
| L29 | Half image overlay | 3 | img |
| L30 | 3 icon | 10 | img |
| L31 | 6 icon | 19 | img |
| L32 | Split image with title and content | 4 | img |
| L33 | Image and 3 column text | 8 | img |
| L34 | Six icons and text | 14 | img |
| L35 | Large icons and text | 13 | img |
| L36 | Image left text right | 4 | img |
| L37 | Logos and text | 17 | img |
| L38 | Feature image and title | 2 | img |
| L39 | Large image | 1 | img |
| L40 | Table and text | 3 | table |
| L41 | Chart and text | 3 | chart |
| L42 | Large table | 5 | img,table |
| L43 | Case study with icons | 16 | img |
| L44 | Flux breaker | 2 | — |
| L45 | Breaker slide | 4 | — |
| L46 | Section divider | 4 | — |
| L47 | Quote | 4 | — |
| L48 | Closing slide | 0 | — |

## Data layouts (Excel-sourced) — exact slots

- **L41 — Chart and text** → chart placeholder `idx=18`, caption body `idx=13`, title `idx=0`. **Default for an Excel-sourced slide.**
- **L40 — Table and text** → table placeholder `idx=15`, caption body `idx=13`, title `idx=0`.
- **L42 — Large table** → full-width table `idx=15`, title `idx=0`.

## Per-layout placeholder map

Each row: `idx` · role(type) · position (in). Slots are listed **left-to-right, top-to-bottom by position** — for multi-element layouts (timeline, agenda, icon grids) this reading order is what you must follow when assigning content, NOT the `idx` order (see the timeline rule in `SKILL.md`).

### L1 — Title Slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 0 | title | (0.61, 2.27) | 48pt |
| 1 | subtitle | (0.61, 4.98) | 24pt |
| 15 | text | (0.61, 5.61) | 20pt |
| 13 | text | (0.61, 6.36) | 20pt |
| 14 | PICTURE | (4.01, 0.78) | 14pt |

### L2 — 1_Title Slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.67, 2.08) | 54pt |
| 11 | text | (0.67, 5.86) | 18pt |

### L3 — Title

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 12 | text | (0.67, 3.35) | 60pt |
| 10 | text | (10.1, 0.28) | 18pt |
| 11 | text | (10.1, 0.72) | 18pt |

### L4 — 2_Title Slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.67, 2.78) | 60pt |
| 0 | title | (1.67, 1.23) | — |
| 1 | subtitle | (1.67, 3.94) | — |
| 12 | text | (9.67, 6.49) | 24pt |
| 11 | text | (10.06, 6.0) | 24pt |

### L5 — Agenda slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.67, 3.15) | 60pt |
| 11 | text | (7.72, 1.57) | 20pt |
| 12 | text | (7.72, 2.37) | 20pt |
| 13 | text | (7.72, 3.15) | 20pt |
| 14 | text | (7.72, 3.97) | 20pt |
| 15 | text | (7.72, 4.76) | 20pt |
| 16 | text | (7.72, 5.57) | 20pt |
| 17 | text | (8.43, 1.57) | 24pt |
| 18 | text | (8.43, 2.37) | 24pt |
| 19 | text | (8.43, 3.11) | 24pt |
| 20 | text | (8.43, 3.95) | 24pt |
| 21 | text | (8.43, 4.74) | 24pt |
| 22 | text | (8.43, 5.58) | 24pt |

### L6 — List and image

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 0 | title | (0.44, 0.4) | 36pt |
| 13 | text | (0.44, 1.32) | 24pt |
| 37 | PICTURE | (6.67, 0.0) | — |

### L7 — Illustration and 2 heading

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.66, 5.16) | 54pt |
| 10 | PICTURE | (1.18, 1.0) | — |
| 12 | text | (6.67, 1.19) | 24pt |
| 14 | text | (6.67, 1.77) | 20pt |
| 13 | text | (6.67, 3.82) | 24pt |
| 15 | text | (6.67, 4.33) | 20pt |

### L8 — 3 column content

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.67, 0.86) | 54pt |
| 16 | text | (0.83, 4.36) | 20pt |
| 13 | text | (1.26, 3.52) | 24pt |
| 17 | text | (4.76, 4.36) | 20pt |
| 14 | text | (5.18, 3.52) | 24pt |
| 18 | text | (8.72, 4.36) | 20pt |
| 15 | text | (9.13, 3.52) | 24pt |
| 12 | PICTURE | (9.24, 0.56) | — |

### L9 — 1_Timeline

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 12 | text | (0.56, 4.17) | 18pt |
| 13 | text | (0.56, 4.64) | 18pt |
| 10 | text | (0.67, 5.62) | 48pt |
| 11 | text | (0.67, 6.55) | 24pt |
| 14 | text | (2.68, 1.15) | 18pt |
| 15 | text | (2.68, 1.63) | 18pt |
| 16 | text | (4.85, 4.17) | 18pt |
| 17 | text | (4.85, 4.64) | 18pt |
| 18 | text | (7.24, 1.15) | 18pt |
| 19 | text | (7.24, 1.63) | 18pt |
| 20 | text | (9.74, 4.17) | 18pt |
| 21 | text | (9.74, 4.64) | 18pt |

### L10 — Image and content

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.66, 0.81) | 54pt |
| 17 | PICTURE | (0.66, 3.07) | — |
| 16 | text | (6.67, 3.07) | 20pt |

### L11 — Right hand side image

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.66, 0.81) | 54pt |
| 16 | text | (0.66, 3.07) | 20pt |
| 17 | PICTURE | (6.67, 0.35) | — |

### L12 — Timeline

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.67, 0.86) | 54pt |
| 16 | text | (0.68, 2.48) | 20pt |
| 17 | text | (0.68, 2.97) | 28pt |
| 18 | text | (0.68, 3.56) | 20pt |
| 22 | text | (3.73, 2.97) | 20pt |
| 23 | text | (3.73, 3.46) | 28pt |
| 24 | text | (3.73, 4.05) | 20pt |
| 19 | text | (6.71, 2.48) | 20pt |
| 20 | text | (6.71, 2.97) | 28pt |
| 21 | text | (6.71, 3.56) | 20pt |
| 25 | text | (9.71, 2.97) | 20pt |
| 26 | text | (9.71, 3.46) | 28pt |
| 27 | text | (9.71, 4.05) | 20pt |

### L13 — Speaker slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.66, 2.92) | 54pt |
| 12 | PICTURE | (6.69, 0.84) | — |
| 13 | PICTURE | (6.69, 2.92) | — |
| 14 | PICTURE | (6.69, 4.89) | — |
| 15 | text | (8.62, 1.58) | 18pt |
| 18 | text | (8.62, 2.16) | 28pt |
| 16 | text | (8.62, 3.59) | 18pt |
| 19 | text | (8.62, 4.18) | 28pt |
| 17 | text | (8.62, 5.61) | 18pt |
| 20 | text | (8.62, 6.19) | 28pt |

### L14 — 3 column no image

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.66, 0.81) | 54pt |
| 18 | text | (0.68, 2.53) | 20pt |
| 19 | text | (4.73, 2.53) | 20pt |
| 20 | text | (8.78, 2.53) | 20pt |

### L15 — Large illustration breaker slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.66, 4.15) | 54pt |
| 12 | PICTURE | (6.69, 1.26) | — |

### L16 — Large image breaker slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | PICTURE | (0.0, 0.35) | — |
| 11 | text | (0.66, 5.2) | 54pt |

### L17 — One column text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 0 | title | (0.44, 0.4) | 36pt |
| 13 | text | (0.44, 1.32) | 24pt |

### L18 — Two column text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 0 | title | (0.44, 0.4) | 36pt |
| 13 | text | (0.44, 1.32) | 24pt |

### L19 — Gradient image and text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 12 | PICTURE | (0.67, 1.39) | — |
| 10 | text | (0.67, 6.11) | 48pt |
| 11 | text | (7.39, 1.39) | 18pt |

### L20 — Image right hand side gradient

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.67, 3.25) | 60pt |
| 11 | PICTURE | (6.67, 0.0) | — |

### L21 — Image left hand side

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | PICTURE | (-0.0, 0.0) | — |
| 10 | text | (7.0, 3.53) | 60pt |

### L22 — Image right hand side

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.34, 3.75) | 60pt |
| 11 | PICTURE | (6.68, 0.0) | — |

### L23 — 1_Image and content

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.34, 0.46) | 48pt |
| 12 | text | (0.34, 2.22) | 20pt |
| 11 | PICTURE | (6.67, 0.0) | — |

### L24 — Title and Content

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.65, 3.5) | 24pt |
| 10 | text | (0.65, 4.29) | 60pt |
| 12 | text | (7.0, 0.46) | 20pt |

### L25 — 1_One column text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.67, 3.75) | 48pt |
| 12 | text | (6.67, 0.56) | 24pt |

### L26 — Agenda

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.67, 3.75) | 60pt |
| 11 | text | (6.97, 0.46) | 20pt |
| 12 | text | (7.83, 0.46) | 20pt |

### L27 — Full image introduction

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | PICTURE | (0.0, 0.0) | — |
| 11 | text | (0.76, 4.08) | 34pt |
| 12 | text | (0.76, 4.97) | 24pt |

### L28 — 3 statement

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.67, 1.84) | 36pt |
| 14 | text | (0.7, 4.05) | 20pt |
| 11 | text | (1.72, 3.21) | 24pt |
| 15 | text | (4.93, 4.05) | 20pt |
| 12 | text | (6.14, 3.21) | 24pt |
| 16 | text | (9.15, 4.05) | 20pt |
| 13 | text | (10.35, 3.21) | 24pt |

### L29 — Half image overlay

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 11 | text | (0.76, 4.08) | 34pt |
| 12 | text | (0.76, 4.99) | 24pt |
| 13 | PICTURE | (6.67, 0.0) | — |

### L30 — 3 icon

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.67, 3.25) | 48pt |
| 19 | PICTURE | (5.9, 1.41) | — |
| 20 | PICTURE | (5.9, 3.25) | — |
| 21 | PICTURE | (5.9, 5.08) | — |
| 11 | text | (7.88, 1.41) | 20pt |
| 14 | text | (7.88, 2.0) | 20pt |
| 15 | text | (7.88, 3.35) | 20pt |
| 16 | text | (7.88, 3.95) | 20pt |
| 17 | text | (7.88, 5.2) | 20pt |
| 18 | text | (7.88, 5.8) | 20pt |

### L31 — 6 icon

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.67, 2.23) | 48pt |
| 29 | PICTURE | (4.49, 2.28) | — |
| 30 | PICTURE | (4.49, 3.9) | — |
| 31 | PICTURE | (4.49, 5.58) | — |
| 11 | text | (5.64, 2.23) | 18pt |
| 14 | text | (5.64, 2.76) | 18pt |
| 19 | text | (5.64, 3.86) | 18pt |
| 20 | text | (5.64, 4.39) | 18pt |
| 21 | text | (5.64, 5.55) | 18pt |
| 22 | text | (5.64, 6.08) | 18pt |
| 32 | PICTURE | (8.94, 2.28) | — |
| 33 | PICTURE | (8.94, 3.9) | — |
| 34 | PICTURE | (8.94, 5.58) | — |
| 25 | text | (10.08, 3.86) | 18pt |
| 26 | text | (10.08, 4.39) | 18pt |
| 27 | text | (10.08, 5.5) | 18pt |
| 28 | text | (10.08, 6.02) | 18pt |
| 23 | text | (10.09, 2.23) | 18pt |
| 24 | text | (10.09, 2.76) | 18pt |

### L32 — Split image with title and content

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | PICTURE | (0.0, 0.0) | — |
| 14 | PICTURE | (0.0, 3.78) | — |
| 13 | text | (7.06, 0.6) | 60pt |
| 12 | text | (7.06, 3.84) | 24pt |

### L33 — Image and 3 column text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | PICTURE | (0.0, 0.0) | — |
| 13 | text | (0.67, 4.21) | 48pt |
| 11 | text | (4.32, 4.33) | 20pt |
| 14 | text | (4.32, 4.89) | 20pt |
| 15 | text | (7.18, 4.33) | 20pt |
| 16 | text | (7.18, 4.89) | 20pt |
| 17 | text | (10.04, 4.33) | 20pt |
| 18 | text | (10.04, 4.89) | 20pt |

### L34 — Six icons and text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 0 | title | (0.44, 0.4) | 36pt |
| 13 | text | (0.44, 1.35) | 24pt |
| 52 | PICTURE | (0.44, 2.64) | 8pt |
| 60 | PICTURE | (0.44, 4.12) | 8pt |
| 62 | PICTURE | (0.44, 5.61) | 8pt |
| 44 | text | (1.69, 2.64) | 14pt |
| 59 | text | (1.69, 4.12) | 14pt |
| 61 | text | (1.69, 5.61) | 14pt |
| 64 | PICTURE | (6.99, 2.64) | 8pt |
| 66 | PICTURE | (6.99, 4.12) | 8pt |
| 68 | PICTURE | (6.99, 5.61) | 8pt |
| 63 | text | (8.24, 2.64) | 14pt |
| 65 | text | (8.24, 4.12) | 14pt |
| 67 | text | (8.24, 5.61) | 14pt |

### L35 — Large icons and text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 28 | text | (0.44, 5.97) | 24pt |
| 25 | text | (0.46, 3.09) | 24pt |
| 52 | PICTURE | (1.63, 1.64) | 8pt |
| 55 | PICTURE | (1.63, 4.5) | 8pt |
| 26 | text | (4.78, 3.09) | 24pt |
| 29 | text | (4.78, 5.97) | 24pt |
| 53 | PICTURE | (5.96, 1.64) | 8pt |
| 56 | PICTURE | (5.96, 4.5) | 8pt |
| 27 | text | (9.12, 3.09) | 24pt |
| 30 | text | (9.12, 5.97) | 24pt |
| 54 | PICTURE | (10.29, 1.64) | 8pt |
| 57 | PICTURE | (10.29, 4.49) | 8pt |
| 0 | title | inherit | — |

### L36 — Image left text right

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 37 | PICTURE | (0.0, 0.0) | — |
| 0 | title | (0.44, 0.4) | 36pt |
| 38 | text | (5.84, 0.4) | 28pt |
| 13 | text | (5.84, 2.1) | 24pt |

### L37 — Logos and text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.44, 1.51) | 24pt |
| 25 | PICTURE | (6.8, 1.56) | 20pt |
| 27 | PICTURE | (6.8, 2.61) | 20pt |
| 28 | PICTURE | (6.8, 3.63) | 20pt |
| 29 | PICTURE | (6.8, 4.65) | 20pt |
| 30 | PICTURE | (6.8, 5.68) | 20pt |
| 31 | PICTURE | (8.89, 1.56) | 20pt |
| 32 | PICTURE | (8.89, 2.61) | 20pt |
| 33 | PICTURE | (8.89, 3.63) | 20pt |
| 34 | PICTURE | (8.89, 4.65) | 20pt |
| 35 | PICTURE | (8.89, 5.68) | 20pt |
| 36 | PICTURE | (10.98, 1.56) | 20pt |
| 37 | PICTURE | (10.98, 2.61) | 20pt |
| 38 | PICTURE | (10.98, 3.63) | 20pt |
| 39 | PICTURE | (10.98, 4.65) | 20pt |
| 40 | PICTURE | (10.98, 5.68) | 20pt |
| 0 | title | inherit | — |

### L38 — Feature image and title

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 14 | PICTURE | (0.0, -0.01) | — |
| 0 | title | (9.48, 0.34) | 48pt |

### L39 — Large image

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 37 | PICTURE | (0.0, 0.0) | — |

### L40 — Table and text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.44, 1.51) | 24pt |
| 15 | TABLE | (6.57, 1.51) | 24pt |
| 0 | title | inherit | — |

### L41 — Chart and text

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.44, 1.51) | 24pt |
| 18 | CHART | (6.58, 1.51) | 24pt |
| 0 | title | inherit | — |

### L42 — Large table

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 15 | TABLE | (0.44, 1.26) | 24pt |
| 14 | PICTURE | (0.44, 6.94) | 11pt |
| 17 | slide# | (6.41, 6.96) | — |
| 16 | footer | (6.98, 6.96) | — |
| 0 | title | inherit | — |

### L43 — Case study with icons

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 0 | title | (0.44, 0.4) | — |
| 13 | text | (0.44, 1.16) | 20pt |
| 34 | text | (0.44, 2.15) | 18pt |
| 29 | text | (0.44, 2.58) | 16pt |
| 35 | text | (0.44, 4.5) | 18pt |
| 31 | text | (0.44, 4.92) | 16pt |
| 56 | PICTURE | (7.11, 2.76) | 8pt |
| 57 | PICTURE | (7.11, 3.7) | 8pt |
| 58 | PICTURE | (7.11, 4.64) | 8pt |
| 59 | PICTURE | (7.11, 5.58) | 8pt |
| 36 | text | (7.16, 2.15) | 18pt |
| 26 | text | (7.8, 3.69) | 16pt |
| 27 | text | (7.8, 4.62) | 16pt |
| 28 | text | (7.8, 5.55) | 16pt |
| 14 | text | (7.82, 2.78) | 16pt |
| 25 | PICTURE | (11.0, 0.4) | 14pt |

### L44 — Flux breaker

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 10 | text | (0.67, 5.62) | 48pt |
| 11 | text | (0.67, 6.55) | 24pt |

### L45 — Breaker slide

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.67, 4.88) | 60pt |
| 10 | date | (0.92, 6.95) | — |
| 11 | footer | (4.42, 6.95) | — |
| 12 | slide# | (9.42, 6.95) | — |

### L46 — Section divider

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 13 | text | (0.86, 1.91) | 60pt |
| 12 | text | (0.86, 3.18) | 40pt |
| 11 | slide# | (6.41, 6.96) | — |
| 10 | footer | (6.98, 6.96) | — |

### L47 — Quote

| idx | role | pos (in) | font |
|-----|------|----------|------|
| 12 | text | (0.7, 1.74) | 60pt |
| 38 | text | (0.7, 4.95) | 28pt |
| 11 | slide# | (6.41, 6.96) | — |
| 10 | footer | (6.98, 6.96) | — |

### L48 — Closing slide
Decorative — no placeholders. Use as-is.

## Cross-cutting rules

1. **Reading order ≠ idx order on multi-slot layouts.** Timeline (L9, L12), agenda (L5, L26), icon grids (L30, L31, L34, L35, L37). Sort placeholders by `<a:off>` x (then y) and map content in that visual order — a build-time check in `SKILL.md` enforces it for timelines.
2. **Big-font slots are short.** 60pt headline slots hold ~a dozen characters per line; plan big headlines at a few words and verify visually.
3. **Picture placeholders are aspect-ratio sensitive.** Match the placeholder `<a:ext>` ratio to the image, re-centre via `<a:off>`, never stretch.
4. **Title slots showing `inherit`** take position/size from the master title bar (usually `(0.44, 0.4)` at 36pt).

## How to regenerate

When Step 2 refreshes the master, re-extract this file from the new `references/templates/kainos-pptx-master.pptx`: parse each `slideLayout<n>.xml`'s `<p:cSld name>` and every `<p:ph>` (`type`/`idx` + `<a:off>` + default font size), and update the layout count in the heading and in `SKILL.md`.
