# PYKLR logo assets

Vectorized from the original `Pyklr_-_Logo_Color.png` provided in the brand kit. All SVGs use the exact brand colors sampled from the source PNG.

## Brand colors

| Token | Hex | Use |
|-------|-----|-----|
| Green | `#67BF69` | Primary brand color, paddle/ball, wordmark |
| Blue | `#4493CC` | Triangle backdrop, tagline, app icon background |
| Lime | `#A8E66A` | Dark-mode primary accent (substitute for green on black backgrounds) |
| Lime-dark | `#0A1F08` | Text on lime buttons |
| Green-dark | `#4FA547` | Hover/pressed states, text on green tints |
| Green-light | `#EAF5E5` | Light-mode tint surfaces |
| Blue-light | `#E4F0F8` | Light-mode tint surfaces |

---

## Files

### Primary full logo (lockup: icon + wordmark + tagline)

| File | When to use |
|------|-------------|
| `pyklr-logo-color.svg` | **Default.** Use everywhere brand color is allowed: marketing site, splash screens, email headers, social profiles, business cards |
| `pyklr-logo-color.png` | Same as above, when SVG isn't supported (PowerPoint, some legacy CMSes) |
| `pyklr-logo-green.svg` / `.png` | Single-color green. Use on white backgrounds where simplicity matters |
| `pyklr-logo-black.svg` / `.png` | Single-color black. Use for B&W print, embroidery, legal documents |
| `pyklr-logo-white.svg` / `.png` | Single-color white. Use only on solid dark backgrounds (≥80% black) |

### Mark only (no wordmark)

| File | When to use |
|------|-------------|
| `pyklr-mark.svg` | Header lockup beside a separate wordmark, favicon source, small-scale uses where the full logo doesn't fit |
| `pyklr-mark.png` | 512×512 raster |

### Wordmark only (no icon)

| File | When to use |
|------|-------------|
| `pyklr-wordmark.svg` | Letterhead, big block letters in marketing copy, paired with the mark elsewhere in a layout |
| `pyklr-wordmark.png` | Raster fallback |

### App icons

| File | When to use |
|------|-------------|
| `pyklr-app-icon.svg` | iOS App Store master (1024×1024 square) — paddle on solid blue |
| `pyklr-app-icon-rounded.svg` | Android Play Store, PWA manifest, marketing previews (1024×1024 rounded square, ~22% radius) |
| `pyklr-app-icon-{48,72,96,144,180,192,512}.png` | Pre-exported sizes for `app.json` / `manifest.json` / favicon |

### Developer assets

| File | When to use |
|------|-------------|
| `pyklr-logo-paths.ts` | TypeScript module exporting `PYKLR_MARK_PATH` and `PYKLR_WORDMARK_PATH` as string constants. Import into a React Native component using `react-native-svg` to render the logo inline without an asset file. |

---

## React Native usage

### Inline SVG (recommended)

```typescript
import Svg, { Path } from 'react-native-svg';
import { PYKLR_MARK_PATH, PYKLR_MARK_VIEWBOX, PYKLR_COLORS } from '@/assets/logos/pyklr-logo-paths';

export function PyklrLogo({ size = 48, color = PYKLR_COLORS.green }) {
  return (
    <Svg viewBox={PYKLR_MARK_VIEWBOX} width={size} height={size * 1.42}>
      <Path d={PYKLR_MARK_PATH} fill={color} />
    </Svg>
  );
}

// Usage
<PyklrLogo size={64} />                                  // light mode
<PyklrLogo size={64} color={PYKLR_COLORS.lime} />        // dark mode
<PyklrLogo size={32} color="#FFFFFF" />                  // on blue backgrounds
```

### App icon for Expo

In `app.json`:

```json
{
  "expo": {
    "icon": "./assets/logos/pyklr-app-icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/logos/pyklr-app-icon-rounded.png",
        "backgroundColor": "#4493CC"
      }
    },
    "ios": {
      "icon": "./assets/logos/pyklr-app-icon.png"
    }
  }
}
```

### Splash screen

Use the rounded variant centered on a blue background:

```json
{
  "expo": {
    "splash": {
      "image": "./assets/logos/pyklr-app-icon.png",
      "backgroundColor": "#4493CC",
      "resizeMode": "contain"
    }
  }
}
```

---

## Web usage

### As a favicon

```html
<link rel="icon" type="image/svg+xml" href="/assets/logos/pyklr-mark.svg" />
<link rel="apple-touch-icon" href="/assets/logos/pyklr-app-icon-180.png" />
<link rel="icon" sizes="192x192" href="/assets/logos/pyklr-app-icon-192.png" />
```

### As a header logo

```html
<a href="/" aria-label="PYKLR home">
  <img src="/assets/logos/pyklr-logo-color.svg" alt="PYKLR" height="48" />
</a>
```

### Embedded inline (for styling control)

The full-color SVG embeds the Sink font as a base64 data URL so the tagline renders consistently across browsers. The file is ~187KB because of the embedded font. If you need a smaller file and don't need the tagline editable, use `pyklr-logo-green.svg` and add the tagline as separate HTML text.

---

## Clearspace and minimum sizing

- **Clearspace:** maintain at least 1× the height of the "P" in PYKLR on all sides
- **Minimum digital size:** 32px height for the mark, 80px height for the full lockup
- **Minimum print size:** 0.5" / 13mm height for the mark, 1.25" / 32mm for the full lockup

## Don'ts

- Don't change the colors except to substitute green for lime in dark mode
- Don't add drop shadows, glows, or strokes
- Don't rotate or skew
- Don't crop the lockup
- Don't put the green wordmark on green or yellow backgrounds (insufficient contrast)
- Don't put the white version on backgrounds lighter than 60% black
- Don't use only the wordmark without ever showing the mark somewhere in the same context (the mark is the brand recognition asset)

---

*All assets generated 2026-05-12 from `Pyklr_-_Logo_Color.png`. To regenerate, re-run the trace pipeline in `scripts/vectorize-logo.py` against an updated source PNG.*
