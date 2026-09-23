"use client";
import { useEffect, useRef } from "react";

// Oversized numerals with a local water ripple: the cursor disturbs a height-map
// wherever it passes, the waves spread and fade, and the text is refracted through
// them on a canvas. At rest the crisp DOM text is shown and the canvas is hidden.
const CELL = 2;        // CSS px per simulation cell
const PAD = 0.08;      // canvas overhang around the text box (fraction of font size)
const DAMPING = 0.975;
const REFRACT = 0.14;  // CSS px of offset per unit of wave slope
const STEPS = 2;       // simulation steps per frame (wave speed)

const fontCache = new Map<string, Promise<string>>();

/** Find the page's @font-face file for a family and inline it as a data URL. */
function covers(range: string, text: string) {
  if (!range.trim()) return true;
  const spans = range.split(",").map((r) => {
    const [a, b] = r.trim().replace(/^U\+/i, "").split("-");
    return [parseInt(a, 16), parseInt(b ?? a, 16)] as const;
  });
  return Array.from(text).every((ch) => { const c = ch.codePointAt(0)!; return spans.some(([a, b]) => c >= a && c <= b); });
}

function fontDataUrl(family: string, weight: string, text: string): Promise<string> {
  const key = `${family}|${weight}|${text}`;
  if (!fontCache.has(key)) {
    fontCache.set(key, (async () => {
      let url = "";
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try { rules = sheet.cssRules; } catch { continue; }
        for (const r of Array.from(rules)) {
          if (!(r instanceof CSSFontFaceRule)) continue;
          const fam = r.style.getPropertyValue("font-family").trim().replace(/^["']|["']$/g, "");
          if (fam !== family || !covers(r.style.getPropertyValue("unicode-range"), text)) continue;
          const w = r.style.getPropertyValue("font-weight");
          const m = r.style.getPropertyValue("src").match(/url\(["']?([^"')]+)["']?\)/);
          if (!m) continue;
          const [lo, hi] = w.split(/\s+/).map(Number);
          const want = Number(weight) || 400;
          const fits = !w || w === weight || (hi ? want >= lo && want <= hi : lo === want);
          if (fits) { url = new URL(m[1], sheet.href || location.href).href; break; }
          if (!url) url = new URL(m[1], sheet.href || location.href).href;
        }
      }
      if (!url) return "";
      const blob = await (await fetch(url)).blob();
      return await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = () => res(""); fr.readAsDataURL(blob); });
    })().catch(() => ""));
  }
  return fontCache.get(key)!;
}

export default function RippleNumerals({ text, style, className }: { text: string; style?: React.CSSProperties; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const textEl = useRef<HTMLParagraphElement>(null);
  const canvasEl = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = wrap.current, p = textEl.current, canvas = canvasEl.current;
    if (!root || !p || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let W = 0, H = 0, GW = 0, GH = 0, scale = 1, padPx = 0;
    let cur = new Float32Array(0), prev = new Float32Array(0);
    let src: ImageData | null = null;
    let colCell = new Int32Array(0), rowCell = new Int32Array(0);
    let raf = 0, active = false, last: { x: number; y: number } | null = null;
    let bx0 = 0, by0 = 0, bx1 = -1, by1 = -1; // active cell bounds

    const build = async () => {
      await document.fonts.ready;
      const cs = getComputedStyle(p);
      const fontSize = parseFloat(cs.fontSize);
      const rect = p.getBoundingClientRect();
      padPx = Math.round(fontSize * PAD);
      const cssW = Math.ceil(rect.width + padPx * 2), cssH = Math.ceil(rect.height + padPx * 2);
      scale = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(cssW * scale); H = Math.round(cssH * scale);
      canvas.width = W; canvas.height = H;
      canvas.style.width = `${cssW}px`; canvas.style.height = `${cssH}px`;
      canvas.style.left = `${rect.left - root.getBoundingClientRect().left - padPx}px`;
      canvas.style.top = `${rect.top - root.getBoundingClientRect().top - padPx}px`;

      // Rasterise the text as an SVG image using the page's own font file, so glyphs
      // (lining numerals), baseline and letter-spacing match the DOM exactly.
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      p.appendChild(probe);
      const baseline = probe.getBoundingClientRect().top - rect.top + padPx;
      probe.remove();
      const family = cs.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
      const fontUrl = await fontDataUrl(family, cs.fontWeight, text);
      const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      const ls = parseFloat(cs.letterSpacing) || 0;
      const dx = Array.from(text).map((_, i) => (i === 0 ? 0 : ls)).join(" ");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${cssW} ${cssH}">` +
        (fontUrl ? `<style>@font-face{font-family:"RippleFont";src:url(${fontUrl});font-weight:${cs.fontWeight};}</style>` : "") +
        `<text x="${padPx}" y="${baseline}" dx="${dx}" fill="${esc(cs.color)}" style="font-family:${fontUrl ? "RippleFont" : esc(cs.fontFamily)};font-size:${cs.fontSize};font-weight:${cs.fontWeight};font-variant-numeric:lining-nums;font-feature-settings:'lnum' 1;white-space:pre">${esc(text)}</text></svg>`;
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await img.decode();
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      src = ctx.getImageData(0, 0, W, H);

      GW = Math.ceil(cssW / CELL) + 2; GH = Math.ceil(cssH / CELL) + 2;
      cur = new Float32Array(GW * GH); prev = new Float32Array(GW * GH);
      colCell = new Int32Array(W); rowCell = new Int32Array(H);
      for (let i = 0; i < W; i++) colCell[i] = Math.min(GW - 2, Math.max(1, Math.floor(i / scale / CELL)));
      for (let j = 0; j < H; j++) rowCell[j] = Math.min(GH - 2, Math.max(1, Math.floor(j / scale / CELL)));
      bx1 = by1 = -1;
      setActive(false);
    };

    const setActive = (on: boolean) => {
      if (on === active) return;
      active = on;
      canvas.style.opacity = on ? "1" : "0";
      p.style.opacity = on ? "0" : "1";
      if (on) ctx.putImageData(src!, 0, 0);
    };

    const disturb = (cx: number, cy: number, strength: number) => {
      const r = 4;
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
        const gx = Math.round(cx + x), gy = Math.round(cy + y);
        if (gx < 1 || gy < 1 || gx >= GW - 1 || gy >= GH - 1) continue;
        const d = Math.hypot(x, y) / r;
        if (d > 1) continue;
        cur[gy * GW + gx] -= strength * (1 - d * d);
      }
      bx0 = bx1 < 0 ? Math.floor(cx - r) : Math.min(bx0, Math.floor(cx - r));
      by0 = by1 < 0 ? Math.floor(cy - r) : Math.min(by0, Math.floor(cy - r));
      bx1 = Math.max(bx1, Math.ceil(cx + r)); by1 = Math.max(by1, Math.ceil(cy + r));
    };

    const step = () => {
      // Grow bounds by one cell (waves travel one cell per step), clamp to grid.
      const x0 = Math.max(1, bx0 - 1), y0 = Math.max(1, by0 - 1);
      const x1 = Math.min(GW - 2, bx1 + 1), y1 = Math.min(GH - 2, by1 + 1);
      let nx0 = GW, ny0 = GH, nx1 = -1, ny1 = -1;
      for (let y = y0; y <= y1; y++) {
        let i = y * GW + x0;
        for (let x = x0; x <= x1; x++, i++) {
          const v = ((cur[i - 1] + cur[i + 1] + cur[i - GW] + cur[i + GW]) * 0.5 - prev[i]) * DAMPING;
          prev[i] = v;
          if (v > 0.4 || v < -0.4) {
            if (x < nx0) nx0 = x; if (x > nx1) nx1 = x;
            if (y < ny0) ny0 = y; if (y > ny1) ny1 = y;
          } else if (v > -0.05 && v < 0.05) prev[i] = 0;
        }
      }
      const t = cur; cur = prev; prev = t;
      const drawn = [x0, y0, x1, y1];
      bx0 = nx0; by0 = ny0; bx1 = nx1; by1 = ny1;
      return drawn;
    };

    const render = (cx0: number, cy0: number, cx1: number, cy1: number) => {
      if (!src) return;
      const px0 = Math.max(0, Math.floor((cx0 - 1) * CELL * scale)), py0 = Math.max(0, Math.floor((cy0 - 1) * CELL * scale));
      const px1 = Math.min(W, Math.ceil((cx1 + 2) * CELL * scale)), py1 = Math.min(H, Math.ceil((cy1 + 2) * CELL * scale));
      const w = px1 - px0, h = py1 - py0;
      if (w <= 0 || h <= 0) return;
      const out = ctx.createImageData(w, h);
      const o = out.data, s = src.data, k = REFRACT * scale;
      for (let y = 0; y < h; y++) {
        const gy = rowCell[py0 + y];
        for (let x = 0; x < w; x++) {
          const gx = colCell[px0 + x];
          const g = gy * GW + gx;
          const dx = (cur[g - 1] - cur[g + 1]) * k;
          const dy = (cur[g - GW] - cur[g + GW]) * k;
          let sx = (px0 + x + dx) | 0, sy = (py0 + y + dy) | 0;
          if (sx < 0) sx = 0; else if (sx >= W) sx = W - 1;
          if (sy < 0) sy = 0; else if (sy >= H) sy = H - 1;
          const si = (sy * W + sx) * 4, oi = (y * w + x) * 4;
          o[oi] = s[si]; o[oi + 1] = s[si + 1]; o[oi + 2] = s[si + 2]; o[oi + 3] = s[si + 3];
        }
      }
      ctx.putImageData(out, px0, py0);
    };

    const tick = () => {
      let rx0 = GW, ry0 = GH, rx1 = -1, ry1 = -1;
      for (let n = 0; n < STEPS && bx1 >= 0; n++) {
        const [a, b, c, d] = step();
        rx0 = Math.min(rx0, a); ry0 = Math.min(ry0, b); rx1 = Math.max(rx1, c); ry1 = Math.max(ry1, d);
      }
      if (rx1 >= 0) render(rx0, ry0, rx1, ry1);
      if (bx1 >= 0) raf = requestAnimationFrame(tick);
      else { raf = 0; cur.fill(0); prev.fill(0); setActive(false); }
    };

    const onMove = (e: PointerEvent) => {
      if (!src) return;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / CELL, y = (e.clientY - r.top) / CELL;
      if (x < 0 || y < 0 || x >= GW || y >= GH) { last = null; return; }
      setActive(true);
      const from = last ?? { x, y };
      const dist = Math.hypot(x - from.x, y - from.y);
      const n = Math.max(1, Math.ceil(dist / 2));
      const strength = Math.min(260, 70 + dist * 12) / n;
      for (let i = 1; i <= n; i++) disturb(from.x + ((x - from.x) * i) / n, from.y + ((y - from.y) * i) / n, strength);
      last = { x, y };
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => { last = null; };

    build();
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = 0; build(); });
    ro.observe(root);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <div ref={wrap} className="relative">
      <p ref={textEl} aria-hidden className={className} style={style}>{text}</p>
      <canvas ref={canvasEl} aria-hidden className="absolute pointer-events-none" style={{ opacity: 0, maxWidth: "none" }} />
    </div>
  );
}
