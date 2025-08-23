import React from "react";
import { css } from "../../styled-system/css";
import { Button } from "./Button";

interface FontDef {
  name: string; // CSS font-family value (as used after load)
  google?: string; // Google Fonts family query segment
  roleHint: string; // Suggested hierarchy usage
  sample?: string; // Optional custom sample text
}

// Curated list (keep reasonable; load on demand only when gallery mounted)
const FONT_DEFS: FontDef[] = [
  // Already included in index.html
  { name: "Cinzel Decorative", roleHint: "Brand Title / Hero" },
  { name: "Cormorant SC", roleHint: "Headings / Body Large" },
  { name: "Uncial Antiqua", roleHint: "Accent / Drop Caps" },
  { name: "MedievalSharp", roleHint: "Playful Accent" },
  // Additional preview fonts
  { name: "Cinzel", google: "Cinzel:wght@400;600;700", roleHint: "Headings (crisper than Decorative)" },
  { name: "EB Garamond", google: "EB+Garamond:ital,wght@0,400;0,500;0,700;1,400", roleHint: "Body Paragraphs" },
  { name: "Cardo", google: "Cardo:wght@400;700", roleHint: "Body (scholarly)" },
  { name: "Alegreya", google: "Alegreya:ital,wght@0,400;0,600;1,400", roleHint: "Body / Long Form" },
  { name: "Alegreya SC", google: "Alegreya+SC:wght@400;600", roleHint: "Small Caps Headings" },
  { name: "Vollkorn", google: "Vollkorn:wght@400;600;700", roleHint: "Body / Subhead" },
  { name: "Spectral", google: "Spectral:ital,wght@0,400;0,600;1,400", roleHint: "Body / UI Labels" },
  { name: "Spectral SC", google: "Spectral+SC:wght@400;600", roleHint: "Small Caps Headings" },
  { name: "Libre Baskerville", google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400", roleHint: "Body / Subhead" },
  { name: "Caudex", google: "Caudex:ital,wght@0,400;0,700;1,400", roleHint: "Body / Display" },
  { name: "Goudy Bookletter 1911", google: "Goudy+Bookletter+1911", roleHint: "Body / Vintage" },
  { name: "IM Fell English", google: "IM+Fell+English:ital@0;1", roleHint: "Accent Italic / Quotes" },
  { name: "IM Fell DW Pica", google: "IM+Fell+DW+Pica:ital@0;1", roleHint: "Accent Italic / Quotes" },
  { name: "Marcellus SC", google: "Marcellus+SC", roleHint: "Refined Small Caps Headings" },
  { name: "Forum", google: "Forum", roleHint: "Display Heading" },
  { name: "Yeseva One", google: "Yeseva+One", roleHint: "Decorative Subhead" },
  { name: "Almendra Display", google: "Almendra+Display", roleHint: "Flourish / Accent" },
  { name: "Pirata One", google: "Pirata+One", roleHint: "Blackletter Accent Only" },
  { name: "Rye", google: "Rye", roleHint: "Woodcut Style Accent" },
];

let fontsInjected = false;

function injectFontLinks() {
  if (fontsInjected) return;
  // Build a combined Google Fonts URL (guard length ~2000 chars); if too long, split.
  const googleFamilies = FONT_DEFS.filter((f): f is FontDef & { google: string } => typeof f.google === "string").map(
    (f) => f.google
  );
  const base = "https://fonts.googleapis.com/css2?display=swap&family=";
  let current = base;
  const urls: string[] = [];
  googleFamilies.forEach((fam, idx) => {
    const test = current + (current === base ? "" : "&family=") + fam;
    if (test.length > 1800) {
      urls.push(current);
      current = base + fam;
    } else {
      current = test;
    }
    if (idx === googleFamilies.length - 1) urls.push(current);
  });
  urls.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
  fontsInjected = true;
}

export function FontGallery(props: { onClose(): void }) {
  React.useEffect(() => {
    injectFontLinks();
  }, []);

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 90,
        overflowY: "auto",
        p: 6,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      })}
      style={{ background: "rgba(12,10,18,0.9)", backdropFilter: "blur(14px)" }}
    >
      <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 })}>
        <h1 className={css({ m: 0, fontSize: "3xl" })}>Font Gallery</h1>
        <Button
          variant="primary"
          onClick={() => {
            props.onClose();
          }}
        >
          Close
        </Button>
      </div>
      <p className={css({ fontSize: "sm", maxW: "3xl", lineHeight: 1.4 })}>
        Preview of candidate medieval / calligraphic fonts. Use this to decide hierarchy assignments. Each block shows
        name, role hint, pangram, numerals & symbols, and an italic / weight sample if available.
      </p>
      <div className={css({ display: "grid", gap: 5, gridTemplateColumns: { base: "1fr", lg: "1fr 1fr" } })}>
        {FONT_DEFS.map((f) => {
          const familyStack = `'${f.name}', 'Cormorant SC', 'Cinzel Decorative', Georgia, serif`;
          return (
            <div
              key={f.name}
              className={css({ p: 4, rounded: "md" })}
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 18px -6px rgba(0,0,0,0.6)",
              }}
            >
              <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 })}>
                <strong style={{ fontFamily: familyStack, fontSize: "1.4rem", letterSpacing: "0.5px" }}>
                  {f.name}
                </strong>
                <span className={css({ fontSize: "xs", color: "gray.300" })}>{f.roleHint}</span>
              </div>
              <div style={{ fontFamily: familyStack }}>
                <p className={css({ m: 0, fontSize: "lg", lineHeight: 1.2 })}>
                  The Quick Brown Fox Jumps Over 13 Sphinx Wizards.
                </p>
                <p className={css({ m: 0, mt: 2, fontSize: "sm", lineHeight: 1.25 })}>
                  0123456789 — !?&;:., “Quotes” (Parentheses) / * # %
                </p>
                <p
                  className={css({ m: 0, mt: 2, fontSize: "sm", lineHeight: 1.3, opacity: 0.85 })}
                  style={{ fontStyle: "italic" }}
                >
                  Italic sample: Arcane melodies breathe life into forgotten runes.
                </p>
                <p className={css({ m: 0, mt: 2, fontSize: "sm", lineHeight: 1.3, fontWeight: "bold", opacity: 0.9 })}>
                  Bold sample: Arcane melodies breathe life into forgotten runes.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
