# Figma Plugin — Deep Ocean UI Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Figma plugin that generates high-fidelity mockups of all Deep Ocean screens and sheets using Prism Light theme on iPhone 16 Plus frames.

**Architecture:** A JSON-spec-driven Figma plugin. Screen layouts are hand-authored in `figma-screens-spec.js` as a `const SPEC` array, inlined into `code.js`. The plugin UI sends a `generate` message; `code.js` walks the spec, creates/replaces Figma pages, and renders each layer (rect/text/ellipse/line) as native Figma nodes.

**Tech Stack:** Figma Plugin API v1, vanilla JS (no bundler), HTML/CSS for UI panel.

## Global Constraints

- Frame size: 430 × 932 px (iPhone 16 Plus)
- Theme: Prism Light — background `#05070F`, surface `#171A27`, accent `#FFE9A6`, text `#FFF8E7`
- All files live in `figma-plugin/` at repo root
- No build step — `code.js` and `ui.html` are plain files Figma loads directly
- Fonts required: Inter (Regular 400), Sora (Bold 700, Regular 400), JetBrains Mono (Regular 400)

---

### Task 1: Plugin scaffold + renderer engine

**Files:**
- Create: `figma-plugin/manifest.json`
- Create: `figma-plugin/ui.html`
- Create: `figma-plugin/code.js`

**Interfaces:**
- Produces: `renderLayer(layer, parent)` — renders one spec layer onto a Figma parent node
- Produces: `hexToRgb(hex)` → `{r, g, b}` (0–1 range)
- Produces: `rgbaToRgb(rgba)` → `{r, g, b, a}` (0–1 range)
- Produces: `FONTS` — array of `{family, style}` objects for `figma.loadFontAsync`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "Deep Ocean UI Generator",
  "id": "com.deepocean.ui-generator",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"]
}
```

- [ ] **Step 2: Create ui.html**

```html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Inter, sans-serif; padding: 16px; background: #05070F; color: #FFF8E7; margin: 0; }
  h3 { margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #FFE9A6; }
  select { width: 100%; padding: 8px; margin-bottom: 12px; background: #171A27; color: #FFF8E7; border: 1px solid rgba(255,233,166,0.22); border-radius: 8px; font-size: 12px; }
  button { width: 100%; padding: 10px; background: #FFE9A6; color: #05070F; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
  button:hover { background: #FFF0C0; }
  #status { margin-top: 10px; font-size: 11px; color: rgba(255,248,231,0.62); min-height: 16px; }
</style>
</head>
<body>
  <h3>Deep Ocean UI Generator</h3>
  <select id="pageSelect">
    <option value="all">All Pages</option>
    <option value="Onboarding">Onboarding</option>
    <option value="Core Screens">Core Screens</option>
    <option value="Sheets &amp; Overlays">Sheets &amp; Overlays</option>
  </select>
  <button id="btn">Generate Screens</button>
  <div id="status"></div>
  <script>
    document.getElementById('btn').addEventListener('click', () => {
      const page = document.getElementById('pageSelect').value;
      document.getElementById('status').textContent = 'Generating…';
      parent.postMessage({ pluginMessage: { type: 'generate', page } }, '*');
    });
    window.onmessage = (e) => {
      const msg = e.data.pluginMessage;
      if (msg && msg.type === 'done') document.getElementById('status').textContent = msg.text;
      if (msg && msg.type === 'error') document.getElementById('status').textContent = '⚠ ' + msg.text;
    };
  </script>
</body>
</html>
```

- [ ] **Step 3: Create code.js with color helpers and renderer**

```js
// ── Color helpers ─────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return {
    r: parseInt(hex.slice(0,2), 16) / 255,
    g: parseInt(hex.slice(2,4), 16) / 255,
    b: parseInt(hex.slice(4,6), 16) / 255
  };
}

function rgbaToRgb(s) {
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return { r: 1, g: 1, b: 1, a: 1 };
  return { r: +m[1]/255, g: +m[2]/255, b: +m[3]/255, a: m[4] !== undefined ? +m[4] : 1 };
}

function parseColor(val) {
  if (!val) return { r: 1, g: 1, b: 1 };
  val = val.trim();
  if (val.startsWith('#')) return hexToRgb(val);
  if (val.startsWith('rgb')) { const c = rgbaToRgb(val); return c; }
  return { r: 1, g: 1, b: 1 };
}

function colorAlpha(val) {
  if (!val) return 1;
  val = val.trim();
  if (val.startsWith('rgba')) { const c = rgbaToRgb(val); return c.a; }
  return 1;
}

// ── Gradient fill builder ─────────────────────────────────────────────────────
function makeGradient(gradientDef, opacity) {
  const colors = gradientDef.gradient;
  const angle = ((gradientDef.angle ?? 180) * Math.PI) / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return {
    type: 'GRADIENT_LINEAR',
    opacity: opacity ?? 1,
    gradientTransform: [[cos, sin, (1 - cos) / 2 - sin / 2], [-sin, cos, sin / 2 + (1 - cos) / 2]],
    gradientStops: colors.map((c, i) => ({
      position: i / (colors.length - 1),
      color: { ...hexToRgb(c), a: 1 }
    }))
  };
}

// ── Layer renderer ────────────────────────────────────────────────────────────
function renderLayer(layer, parent) {
  if (layer.type === 'rect') {
    const node = figma.createRectangle();
    node.name = layer.name || 'rect';
    node.x = layer.x; node.y = layer.y;
    node.resize(layer.w, layer.h);
    if (layer.radius !== undefined) node.cornerRadius = layer.radius;
    if (layer.fill) {
      if (typeof layer.fill === 'string') {
        const col = parseColor(layer.fill);
        const a = colorAlpha(layer.fill);
        node.fills = [{ type: 'SOLID', color: col, opacity: (layer.opacity ?? 1) * a }];
      } else if (layer.fill.gradient) {
        node.fills = [makeGradient(layer.fill, layer.opacity ?? 1)];
      }
    } else {
      node.fills = [];
    }
    if (layer.border) {
      node.strokes = [{ type: 'SOLID', color: parseColor(layer.border.color), opacity: layer.border.opacity ?? 1 }];
      node.strokeWeight = layer.border.width ?? 1;
      node.strokeAlign = 'INSIDE';
    }
    if (layer.opacity !== undefined && !layer.fill) node.opacity = layer.opacity;
    parent.appendChild(node);
    return node;
  }

  if (layer.type === 'ellipse') {
    const node = figma.createEllipse();
    node.name = layer.name || 'ellipse';
    node.x = layer.x; node.y = layer.y;
    node.resize(layer.w, layer.h);
    if (layer.fill) {
      const col = parseColor(typeof layer.fill === 'string' ? layer.fill : '#fff');
      const a = typeof layer.fill === 'string' ? colorAlpha(layer.fill) : 1;
      node.fills = [{ type: 'SOLID', color: col, opacity: (layer.opacity ?? 1) * a }];
    } else { node.fills = []; }
    if (layer.border) {
      node.strokes = [{ type: 'SOLID', color: parseColor(layer.border.color), opacity: layer.border.opacity ?? 1 }];
      node.strokeWeight = layer.border.width ?? 1;
    }
    parent.appendChild(node);
    return node;
  }

  if (layer.type === 'line') {
    const node = figma.createLine();
    node.name = layer.name || 'line';
    node.x = layer.x; node.y = layer.y;
    node.resize(layer.w, 0);
    node.strokes = [{ type: 'SOLID', color: parseColor(layer.color ?? '#FFF8E7'), opacity: layer.opacity ?? 0.12 }];
    node.strokeWeight = layer.h ?? 1;
    parent.appendChild(node);
    return node;
  }

  if (layer.type === 'text') {
    const node = figma.createText();
    node.name = layer.name || 'text';
    node.x = layer.x; node.y = layer.y;
    node.fontName = { family: layer.fontFamily ?? 'Inter', style: layer.fontStyle ?? 'Regular' };
    node.fontSize = layer.fontSize ?? 15;
    node.characters = layer.content ?? '';
    if (layer.w) { node.textAutoResize = 'HEIGHT'; node.resize(layer.w, node.height); }
    const col = parseColor(layer.color ?? '#FFF8E7');
    const a = colorAlpha(layer.color ?? '#FFF8E7');
    node.fills = [{ type: 'SOLID', color: col, opacity: (layer.opacity ?? 1) * a }];
    if (layer.letterSpacing) node.letterSpacing = { value: layer.letterSpacing, unit: 'PIXELS' };
    if (layer.lineHeight) node.lineHeight = { value: layer.lineHeight, unit: 'PIXELS' };
    if (layer.align) node.textAlignHorizontal = layer.align.toUpperCase();
    parent.appendChild(node);
    return node;
  }

  return null;
}

// ── Fonts ─────────────────────────────────────────────────────────────────────
const FONTS = [
  { family: 'Inter', style: 'Regular' },
  { family: 'Sora', style: 'Regular' },
  { family: 'Sora', style: 'Bold' },
];

async function loadFonts() {
  await Promise.all(FONTS.map(f => figma.loadFontAsync(f)));
  // JetBrains Mono may not be available in Figma — fall back silently
  try { await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Regular' }); } catch(_) {}
}

// ── Page builder ──────────────────────────────────────────────────────────────
function getOrCreatePage(name) {
  let page = figma.root.children.find(p => p.name === name);
  if (page) {
    // Remove existing frames to allow idempotent regeneration
    for (const child of [...page.children]) child.remove();
  } else {
    page = figma.createPage();
    page.name = name;
  }
  return page;
}

function buildPage(pageName, screens) {
  const page = getOrCreatePage(pageName);
  let offsetX = 0;
  for (const screen of screens) {
    const frame = figma.createFrame();
    frame.name = screen.name;
    frame.x = offsetX; frame.y = 0;
    frame.resize(screen.width ?? 430, screen.height ?? 932);
    frame.fills = [{ type: 'SOLID', color: hexToRgb(screen.background ?? '#05070F') }];
    frame.clipsContent = true;
    for (const layer of (screen.layers ?? [])) {
      renderLayer(layer, frame);
    }
    page.appendChild(frame);
    offsetX += (screen.width ?? 430) + 80;
  }
  return page;
}

// ── SPEC placeholder (replaced in Task 2–5) ───────────────────────────────────
const SPEC = [];

// ── Main ──────────────────────────────────────────────────────────────────────
figma.showUI(__html__, { width: 260, height: 180 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'generate') return;
  try {
    await loadFonts();
    const pages = msg.page === 'all'
      ? ['Onboarding', 'Core Screens', 'Sheets & Overlays']
      : [msg.page];
    let total = 0;
    for (const pageName of pages) {
      const screens = SPEC.filter(s => s.page === pageName);
      if (screens.length === 0) continue;
      buildPage(pageName, screens);
      total += screens.length;
    }
    figma.ui.postMessage({ type: 'done', text: `✓ ${total} frames generated` });
  } catch (e) {
    figma.ui.postMessage({ type: 'error', text: String(e) });
  }
};
```

- [ ] **Step 4: Verify files exist**

```bash
ls figma-plugin/
# Expected: code.js  manifest.json  ui.html
```

- [ ] **Step 5: Commit**

```bash
git add figma-plugin/
git commit -m "feat(figma-plugin): scaffold renderer engine and plugin shell"
```

---

### Task 2: Spec — Onboarding + Home + Dive

**Files:**
- Modify: `figma-plugin/code.js` — replace `const SPEC = []` with Onboarding, Home, and Dive entries

**Interfaces:**
- Consumes: `renderLayer`, `buildPage` from Task 1
- Produces: 5 Figma frames across 2 pages (Onboarding ×3, Core Screens ×2)

- [ ] **Step 1: Replace SPEC in code.js with Onboarding + Home + Dive entries**

Find `const SPEC = [];` and replace with:

```js
const SPEC = [
  // ── ONBOARDING ────────────────────────────────────────────────────────────
  {
    page: 'Onboarding', name: 'Welcome',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 160 }, opacity: 0.22 },
      { type: 'ellipse', name: 'Glow Orb', x: 115, y: 240, w: 200, h: 200,
        fill: '#FFE9A6', opacity: 0.08 },
      { type: 'text', name: 'App Name', x: 0, y: 340, w: 430,
        content: 'Deep Ocean', fontSize: 44, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'text', name: 'Tagline', x: 40, y: 400, w: 350,
        content: 'Dive deep. Focus fully.\nDiscover your ocean.', fontSize: 17,
        fontFamily: 'Inter', color: '#FFF8E7', opacity: 0.72, align: 'center', lineHeight: 26 },
      { type: 'rect', name: 'CTA Button', x: 40, y: 780, w: 350, h: 56,
        fill: '#FFE9A6', radius: 20 },
      { type: 'text', name: 'CTA Label', x: 40, y: 794, w: 350,
        content: 'Get Started', fontSize: 15, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#05070F', align: 'center', letterSpacing: 1 },
    ]
  },
  {
    page: 'Onboarding', name: 'Permissions',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 160 }, opacity: 0.14 },
      { type: 'ellipse', name: 'Icon Bg', x: 165, y: 220, w: 100, h: 100,
        fill: '#FFE9A6', opacity: 0.1 },
      { type: 'text', name: 'Icon', x: 165, y: 240, w: 100,
        content: '🔔', fontSize: 44, align: 'center' },
      { type: 'text', name: 'Heading', x: 40, y: 360, w: 350,
        content: 'Stay in the flow', fontSize: 26, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'text', name: 'Body', x: 40, y: 404, w: 350,
        content: 'Get a gentle reminder when your dive is complete and streaks are on the line.',
        fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7', opacity: 0.72,
        align: 'center', lineHeight: 24 },
      { type: 'rect', name: 'Allow Button', x: 40, y: 760, w: 350, h: 56,
        fill: '#FFE9A6', radius: 20 },
      { type: 'text', name: 'Allow Label', x: 40, y: 774, w: 350,
        content: 'Allow Notifications', fontSize: 15, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#05070F', align: 'center', letterSpacing: 1 },
      { type: 'text', name: 'Skip', x: 40, y: 834, w: 350,
        content: 'Skip', fontSize: 13, fontFamily: 'Inter',
        color: '#FFF8E7', opacity: 0.48, align: 'center' },
    ]
  },
  {
    page: 'Onboarding', name: 'First Dive',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#E4F8FF', '#6F8DFF', '#10172A'], angle: 180 }, opacity: 0.18 },
      { type: 'text', name: 'Heading', x: 24, y: 100, w: 382,
        content: 'Your first dive', fontSize: 32, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7' },
      { type: 'text', name: 'Sub', x: 24, y: 148, w: 320,
        content: 'How long would you like to focus?', fontSize: 15,
        fontFamily: 'Inter', color: '#FFF8E7', opacity: 0.72 },
      { type: 'rect', name: 'Pill 5min', x: 24, y: 220, w: 80, h: 44,
        fill: 'rgba(255,233,166,0.12)', radius: 22,
        border: { color: '#FFE9A6', opacity: 0.32, width: 1 } },
      { type: 'text', name: 'Pill 5min Label', x: 24, y: 232, w: 80,
        content: '5 min', fontSize: 13, fontFamily: 'Sora', fontStyle: 'Regular',
        color: '#FFE9A6', align: 'center' },
      { type: 'rect', name: 'Pill 10min', x: 116, y: 220, w: 80, h: 44,
        fill: '#FFE9A6', radius: 22 },
      { type: 'text', name: 'Pill 10min Label', x: 116, y: 232, w: 80,
        content: '10 min', fontSize: 13, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#05070F', align: 'center' },
      { type: 'rect', name: 'Pill 20min', x: 208, y: 220, w: 80, h: 44,
        fill: 'rgba(255,233,166,0.12)', radius: 22,
        border: { color: '#FFE9A6', opacity: 0.32, width: 1 } },
      { type: 'text', name: 'Pill 20min Label', x: 208, y: 232, w: 80,
        content: '20 min', fontSize: 13, fontFamily: 'Sora', fontStyle: 'Regular',
        color: '#FFE9A6', align: 'center' },
      { type: 'rect', name: 'Pill 30min', x: 300, y: 220, w: 80, h: 44,
        fill: 'rgba(255,233,166,0.12)', radius: 22,
        border: { color: '#FFE9A6', opacity: 0.32, width: 1 } },
      { type: 'text', name: 'Pill 30min Label', x: 300, y: 232, w: 80,
        content: '30 min', fontSize: 13, fontFamily: 'Sora', fontStyle: 'Regular',
        color: '#FFE9A6', align: 'center' },
      { type: 'rect', name: 'Zone Preview', x: 24, y: 300, w: 382, h: 220,
        fill: { gradient: ['#E4F8FF', '#6F8DFF', '#10172A'], angle: 160 }, radius: 20, opacity: 0.6 },
      { type: 'text', name: 'Zone Label', x: 24, y: 336, w: 382,
        content: 'Surface Zone', fontSize: 13, fontFamily: 'Sora', fontStyle: 'Regular',
        color: '#BFF7FF', align: 'center', letterSpacing: 1 },
      { type: 'text', name: 'Zone Depth', x: 24, y: 360, w: 382,
        content: '0–5m', fontSize: 32, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'rect', name: 'Start CTA', x: 40, y: 760, w: 350, h: 56,
        fill: '#FFE9A6', radius: 20 },
      { type: 'text', name: 'Start Label', x: 40, y: 774, w: 350,
        content: 'Start First Dive', fontSize: 15, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#05070F', align: 'center', letterSpacing: 1 },
    ]
  },

  // ── HOME ──────────────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'Home',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 180 }, opacity: 0.18 },
      // Header
      { type: 'text', name: 'Greeting', x: 24, y: 72, w: 300,
        content: 'Good morning', fontSize: 15, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.72)' },
      { type: 'ellipse', name: 'Bell Button', x: 386, y: 68, w: 32, h: 32,
        fill: 'rgba(255,233,166,0.08)', border: { color: '#FFE9A6', opacity: 0.18, width: 1 } },
      { type: 'text', name: 'Name', x: 24, y: 98, w: 320,
        content: 'Alex', fontSize: 36, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      { type: 'rect', name: 'Rank Badge', x: 24, y: 146, w: 90, h: 22,
        fill: 'rgba(255,233,166,0.12)', radius: 11,
        border: { color: '#FFE9A6', opacity: 0.28, width: 1 } },
      { type: 'text', name: 'Rank Label', x: 32, y: 150, w: 74,
        content: '★  Deep Diver', fontSize: 11, fontFamily: 'Sora', fontStyle: 'Regular',
        color: '#FFE9A6', letterSpacing: 0.5 },
      { type: 'text', name: 'Sub', x: 24, y: 178, w: 300,
        content: 'Ready to dive?', fontSize: 15, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.72)' },
      // Last dive card
      { type: 'rect', name: 'Last Dive Card', x: 16, y: 210, w: 398, h: 88,
        fill: 'rgba(23,26,39,0.34)', radius: 20,
        border: { color: '#FFE9A6', opacity: 0.14, width: 1 } },
      { type: 'text', name: 'Last Dive Label', x: 32, y: 224, w: 200,
        content: 'LAST DIVE', fontSize: 10, fontFamily: 'Sora', fontStyle: 'Regular',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Last Dive Value', x: 32, y: 242, w: 200,
        content: '20 min · Midnight Zone', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'text', name: 'Last Dive Sub', x: 32, y: 264, w: 250,
        content: '3 discoveries · 2h ago', fontSize: 13, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.62)' },
      // Dive CTA
      { type: 'rect', name: 'Dive CTA Card', x: 16, y: 314, w: 398, h: 128,
        fill: 'rgba(255,233,166,0.055)', radius: 20,
        border: { color: '#FFE9A6', opacity: 0.22, width: 1 } },
      { type: 'text', name: 'CTA Label', x: 32, y: 330, w: 200,
        content: 'BEGIN DIVE', fontSize: 11, fontFamily: 'Sora', fontStyle: 'Regular',
        color: 'rgba(255,248,231,0.72)', letterSpacing: 1.5 },
      { type: 'text', name: 'CTA Duration', x: 32, y: 352, w: 120,
        content: '20', fontSize: 44, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFE9A6' },
      { type: 'text', name: 'CTA Min', x: 98, y: 378, w: 60,
        content: 'min', fontSize: 15, fontFamily: 'Inter', color: 'rgba(255,248,231,0.72)' },
      { type: 'text', name: 'CTA Hint', x: 32, y: 408, w: 280,
        content: 'Estimated reach · Midnight Zone', fontSize: 13, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)' },
      // Quick pills
      { type: 'rect', name: 'Pill 5m', x: 16, y: 458, w: 74, h: 36,
        fill: 'rgba(255,233,166,0.08)', radius: 18,
        border: { color: '#FFE9A6', opacity: 0.2, width: 1 } },
      { type: 'text', name: 'Pill 5m Text', x: 16, y: 468, w: 74,
        content: '5m', fontSize: 13, fontFamily: 'Sora', color: '#FFE9A6', align: 'center' },
      { type: 'rect', name: 'Pill 10m', x: 98, y: 458, w: 74, h: 36,
        fill: 'rgba(255,233,166,0.08)', radius: 18,
        border: { color: '#FFE9A6', opacity: 0.2, width: 1 } },
      { type: 'text', name: 'Pill 10m Text', x: 98, y: 468, w: 74,
        content: '10m', fontSize: 13, fontFamily: 'Sora', color: '#FFE9A6', align: 'center' },
      { type: 'rect', name: 'Pill 30m', x: 180, y: 458, w: 74, h: 36,
        fill: 'rgba(255,233,166,0.08)', radius: 18,
        border: { color: '#FFE9A6', opacity: 0.2, width: 1 } },
      { type: 'text', name: 'Pill 30m Text', x: 180, y: 468, w: 74,
        content: '30m', fontSize: 13, fontFamily: 'Sora', color: '#FFE9A6', align: 'center' },
      { type: 'rect', name: 'Pill ∞', x: 262, y: 458, w: 74, h: 36,
        fill: 'rgba(255,233,166,0.08)', radius: 18,
        border: { color: '#FFE9A6', opacity: 0.2, width: 1 } },
      { type: 'text', name: 'Pill ∞ Text', x: 262, y: 468, w: 74,
        content: '∞', fontSize: 13, fontFamily: 'Sora', color: '#FFE9A6', align: 'center' },
      // Stats row
      { type: 'rect', name: 'Stat Card 1', x: 16, y: 514, w: 122, h: 76,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Stat 1 Label', x: 24, y: 526, w: 106,
        content: 'STREAK', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Stat 1 Value', x: 24, y: 546, w: 106,
        content: '7d', fontSize: 24, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFE9A6' },
      { type: 'rect', name: 'Stat Card 2', x: 146, y: 514, w: 122, h: 76,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Stat 2 Label', x: 154, y: 526, w: 106,
        content: 'DIVES', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Stat 2 Value', x: 154, y: 546, w: 106,
        content: '42', fontSize: 24, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      { type: 'rect', name: 'Stat Card 3', x: 276, y: 514, w: 138, h: 76,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Stat 3 Label', x: 284, y: 526, w: 122,
        content: 'LEVEL', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Stat 3 Value', x: 284, y: 546, w: 122,
        content: '8', fontSize: 24, fontFamily: 'Sora', fontStyle: 'Bold', color: '#9FFFD4' },
      // Zone progress card
      { type: 'rect', name: 'Zone Progress Card', x: 16, y: 606, w: 398, h: 88,
        fill: 'rgba(23,26,39,0.34)', radius: 20,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Zone Progress Label', x: 32, y: 620, w: 200,
        content: 'ZONE PROGRESS', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'rect', name: 'Zone Bar Surface', x: 32, y: 644, w: 60, h: 8,
        fill: '#4FC3F7', radius: 4 },
      { type: 'rect', name: 'Zone Bar Twilight', x: 100, y: 644, w: 60, h: 8,
        fill: '#818CF8', radius: 4 },
      { type: 'rect', name: 'Zone Bar Midnight', x: 168, y: 644, w: 60, h: 8,
        fill: 'rgba(59,130,246,0.3)', radius: 4 },
      { type: 'rect', name: 'Zone Bar Abyss', x: 236, y: 644, w: 60, h: 8,
        fill: 'rgba(45,212,191,0.2)', radius: 4 },
      { type: 'rect', name: 'Zone Bar Trench', x: 304, y: 644, w: 60, h: 8,
        fill: 'rgba(244,114,182,0.15)', radius: 4 },
      // Tab bar
      { type: 'rect', name: 'Tab Bar BG', x: 0, y: 849, w: 430, h: 83,
        fill: 'rgba(5,7,15,0.92)', border: { color: 'rgba(255,233,166,0.1)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Tab Home', x: 17, y: 860, w: 64,
        content: '⌂\nHome', fontSize: 10, fontFamily: 'Inter', color: '#FFE9A6', align: 'center' },
      { type: 'text', name: 'Tab Dive', x: 113, y: 860, w: 64,
        content: '◎\nDive', fontSize: 10, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      { type: 'text', name: 'Tab Collection', x: 183, y: 860, w: 64,
        content: '✦\nCollect', fontSize: 10, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      { type: 'text', name: 'Tab Stats', x: 253, y: 860, w: 64,
        content: '▦\nStats', fontSize: 10, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      { type: 'text', name: 'Tab Profile', x: 349, y: 860, w: 64,
        content: '○\nProfile', fontSize: 10, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
    ]
  },

  // ── DIVE ──────────────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'Dive',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Zone BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#E4F8FF', '#6F8DFF', '#10172A'], angle: 180 }, opacity: 0.25 },
      // Zone label row
      { type: 'text', name: 'Zone Label', x: 0, y: 80, w: 430,
        content: 'MIDNIGHT ZONE', fontSize: 11, fontFamily: 'Sora',
        color: '#BFF7FF', align: 'center', letterSpacing: 2 },
      // Progress ring (outer)
      { type: 'ellipse', name: 'Ring Track', x: 55, y: 120, w: 320, h: 320,
        fill: 'rgba(255,233,166,0.04)',
        border: { color: '#FFE9A6', opacity: 0.12, width: 10 } },
      { type: 'ellipse', name: 'Ring Progress', x: 55, y: 120, w: 320, h: 320,
        fill: null,
        border: { color: '#FFE9A6', opacity: 0.9, width: 10 } },
      // Timer inside ring
      { type: 'text', name: 'Timer', x: 55, y: 238, w: 320,
        content: '14:32', fontSize: 44, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'text', name: 'Timer Label', x: 55, y: 294, w: 320,
        content: 'remaining', fontSize: 13, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.62)', align: 'center' },
      // Depth indicator
      { type: 'rect', name: 'Depth Card', x: 115, y: 470, w: 200, h: 72,
        fill: 'rgba(23,26,39,0.34)', radius: 20,
        border: { color: 'rgba(255,233,166,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Depth Label', x: 115, y: 484, w: 200,
        content: 'DEPTH', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', align: 'center', letterSpacing: 1 },
      { type: 'text', name: 'Depth Value', x: 115, y: 504, w: 200,
        content: '−32m', fontSize: 26, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFE9A6', align: 'center' },
      // Music toggle
      { type: 'rect', name: 'Music Toggle', x: 320, y: 254, w: 78, h: 32,
        fill: 'rgba(255,233,166,0.08)', radius: 16,
        border: { color: 'rgba(255,233,166,0.18)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Music Label', x: 320, y: 263, w: 78,
        content: '♪  On', fontSize: 11, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.72)', align: 'center' },
      // Controls
      { type: 'rect', name: 'Pause Button', x: 16, y: 756, w: 254, h: 56,
        fill: 'rgba(23,26,39,0.5)', radius: 20,
        border: { color: 'rgba(255,233,166,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Pause Label', x: 16, y: 770, w: 254,
        content: 'PAUSE', fontSize: 13, fontFamily: 'Sora',
        color: '#FFF8E7', align: 'center', letterSpacing: 1 },
      { type: 'rect', name: 'Stop Button', x: 278, y: 756, w: 136, h: 56,
        fill: 'rgba(255,142,166,0.1)', radius: 20,
        border: { color: 'rgba(255,142,166,0.3)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Stop Label', x: 278, y: 770, w: 136,
        content: 'END DIVE', fontSize: 13, fontFamily: 'Sora',
        color: '#FF8EA6', align: 'center', letterSpacing: 1 },
    ]
  },
];
```

- [ ] **Step 2: Load plugin in Figma desktop to verify Onboarding + Home + Dive render**

In Figma Desktop:
1. Menu → Plugins → Development → Import plugin from manifest
2. Select `figma-plugin/manifest.json`
3. Run plugin → Generate All
4. Expected: 3 pages created, 5 frames total, no JS errors in console

- [ ] **Step 3: Commit**

```bash
git add figma-plugin/code.js
git commit -m "feat(figma-plugin): add Onboarding, Home, Dive screen specs"
```

---

### Task 3: Spec — Collection + Stats + Profile + AI

**Files:**
- Modify: `figma-plugin/code.js` — append entries to `SPEC` array before closing `]`

**Interfaces:**
- Consumes: renderer from Task 1, existing SPEC from Task 2
- Produces: 4 more frames on Core Screens page

- [ ] **Step 1: Append Collection, Stats, Profile, AI entries to SPEC**

Inside `const SPEC = [`, after the Dive entry, add:

```js
  // ── COLLECTION ────────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'Collection',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FFF0B8', '#6BAED6', '#0B1020'], angle: 180 }, opacity: 0.18 },
      // App header
      { type: 'text', name: 'Title', x: 24, y: 72, w: 300,
        content: 'Collection', fontSize: 28, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      { type: 'text', name: 'Subtitle', x: 24, y: 110, w: 300,
        content: '12 of 48 catalogued', fontSize: 13, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.62)' },
      // Zone filter tabs
      { type: 'rect', name: 'Filter Tab Bar', x: 0, y: 140, w: 430, h: 44,
        fill: 'rgba(5,7,15,0.6)' },
      { type: 'rect', name: 'Filter Active', x: 16, y: 148, w: 72, h: 28,
        fill: '#FFE9A6', radius: 14 },
      { type: 'text', name: 'Filter All', x: 16, y: 156, w: 72,
        content: 'All', fontSize: 12, fontFamily: 'Sora', color: '#05070F', align: 'center' },
      { type: 'text', name: 'Filter Surface', x: 96, y: 156, w: 72,
        content: 'Surface', fontSize: 12, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      { type: 'text', name: 'Filter Twilight', x: 176, y: 156, w: 72,
        content: 'Twilight', fontSize: 12, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      { type: 'text', name: 'Filter Midnight', x: 256, y: 156, w: 80,
        content: 'Midnight', fontSize: 12, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      // Creature rows
      { type: 'rect', name: 'Row 1', x: 16, y: 200, w: 398, h: 72,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'ellipse', name: 'Row 1 Icon', x: 28, y: 212, w: 48, h: 48,
        fill: 'rgba(255,233,166,0.12)',
        border: { color: '#FFE9A6', opacity: 0.5, width: 1 } },
      { type: 'text', name: 'Row 1 Icon Text', x: 28, y: 224, w: 48,
        content: '✦', fontSize: 20, color: '#FFE9A6', align: 'center' },
      { type: 'text', name: 'Row 1 Name', x: 88, y: 216, w: 200,
        content: 'Bioluminescent Jellyfish', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'text', name: 'Row 1 Zone', x: 88, y: 238, w: 200,
        content: 'Surface · Common', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)' },
      { type: 'rect', name: 'Row 2', x: 16, y: 280, w: 398, h: 72,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'ellipse', name: 'Row 2 Icon', x: 28, y: 292, w: 48, h: 48,
        fill: 'rgba(255,233,166,0.12)',
        border: { color: '#FFE9A6', opacity: 0.5, width: 1 } },
      { type: 'text', name: 'Row 2 Icon Text', x: 28, y: 304, w: 48,
        content: '✦', fontSize: 20, color: '#FFE9A6', align: 'center' },
      { type: 'text', name: 'Row 2 Name', x: 88, y: 296, w: 200,
        content: 'Midnight Squid', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'text', name: 'Row 2 Zone', x: 88, y: 318, w: 200,
        content: 'Midnight · Uncommon', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)' },
      { type: 'rect', name: 'Row 3 Locked', x: 16, y: 360, w: 398, h: 72,
        fill: 'rgba(23,26,39,0.2)', radius: 16,
        border: { color: 'rgba(191,247,255,0.1)', opacity: 1, width: 1 } },
      { type: 'ellipse', name: 'Row 3 Icon', x: 28, y: 372, w: 48, h: 48,
        fill: 'rgba(23,26,39,0.5)',
        border: { color: 'rgba(191,247,255,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Row 3 Icon Text', x: 28, y: 384, w: 48,
        content: '?', fontSize: 20, color: 'rgba(255,248,231,0.24)', align: 'center' },
      { type: 'text', name: 'Row 3 Name', x: 88, y: 376, w: 200,
        content: '???', fontSize: 15, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.24)' },
      { type: 'text', name: 'Row 3 Zone', x: 88, y: 398, w: 200,
        content: 'Abyss · Rare', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.24)' },
      // Tab bar
      { type: 'rect', name: 'Tab Bar BG', x: 0, y: 849, w: 430, h: 83,
        fill: 'rgba(5,7,15,0.92)', border: { color: 'rgba(255,233,166,0.1)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Tab Active', x: 183, y: 860, w: 64,
        content: '✦\nCollect', fontSize: 10, fontFamily: 'Inter', color: '#FFE9A6', align: 'center' },
    ]
  },

  // ── STATS ─────────────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'Stats',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 180 }, opacity: 0.14 },
      { type: 'text', name: 'Title', x: 24, y: 72, w: 300,
        content: 'Stats', fontSize: 28, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      // Total depth hero
      { type: 'rect', name: 'Depth Hero', x: 16, y: 114, w: 398, h: 100,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 135 }, radius: 20, opacity: 0.55 },
      { type: 'text', name: 'Depth Hero Label', x: 32, y: 128, w: 200,
        content: 'TOTAL DEPTH', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.72)', letterSpacing: 1 },
      { type: 'text', name: 'Depth Hero Value', x: 32, y: 150, w: 300,
        content: '−842m', fontSize: 36, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      { type: 'text', name: 'Depth Hero Sub', x: 32, y: 192, w: 300,
        content: 'across 42 dives', fontSize: 13, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.72)' },
      // Streak cards
      { type: 'rect', name: 'Streak Card', x: 16, y: 230, w: 190, h: 88,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Streak Label', x: 28, y: 244, w: 166,
        content: 'CURRENT STREAK', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Streak Value', x: 28, y: 266, w: 166,
        content: '7 days', fontSize: 24, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFE9A6' },
      { type: 'rect', name: 'Best Streak Card', x: 224, y: 230, w: 190, h: 88,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Best Streak Label', x: 236, y: 244, w: 166,
        content: 'BEST STREAK', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Best Streak Value', x: 236, y: 266, w: 166,
        content: '14 days', fontSize: 24, fontFamily: 'Sora', fontStyle: 'Bold', color: '#9FFFD4' },
      // Zone breakdown
      { type: 'rect', name: 'Zone Breakdown Card', x: 16, y: 334, w: 398, h: 180,
        fill: 'rgba(23,26,39,0.34)', radius: 20,
        border: { color: 'rgba(191,247,255,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Zone Breakdown Label', x: 32, y: 350, w: 200,
        content: 'ZONE BREAKDOWN', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'rect', name: 'Bar Surface BG', x: 32, y: 378, w: 330, h: 8, fill: 'rgba(255,255,255,0.08)', radius: 4 },
      { type: 'rect', name: 'Bar Surface Fill', x: 32, y: 378, w: 264, h: 8, fill: '#4FC3F7', radius: 4 },
      { type: 'text', name: 'Bar Surface Label', x: 32, y: 392, w: 200,
        content: 'Surface  ·  80%', fontSize: 11, fontFamily: 'Inter', color: 'rgba(255,248,231,0.62)' },
      { type: 'rect', name: 'Bar Twilight BG', x: 32, y: 418, w: 330, h: 8, fill: 'rgba(255,255,255,0.08)', radius: 4 },
      { type: 'rect', name: 'Bar Twilight Fill', x: 32, y: 418, w: 165, h: 8, fill: '#818CF8', radius: 4 },
      { type: 'text', name: 'Bar Twilight Label', x: 32, y: 432, w: 200,
        content: 'Twilight  ·  50%', fontSize: 11, fontFamily: 'Inter', color: 'rgba(255,248,231,0.62)' },
      { type: 'rect', name: 'Bar Midnight BG', x: 32, y: 458, w: 330, h: 8, fill: 'rgba(255,255,255,0.08)', radius: 4 },
      { type: 'rect', name: 'Bar Midnight Fill', x: 32, y: 458, w: 99, h: 8, fill: '#3B82F6', radius: 4 },
      { type: 'text', name: 'Bar Midnight Label', x: 32, y: 472, w: 200,
        content: 'Midnight  ·  30%', fontSize: 11, fontFamily: 'Inter', color: 'rgba(255,248,231,0.62)' },
      { type: 'rect', name: 'Tab Bar BG', x: 0, y: 849, w: 430, h: 83,
        fill: 'rgba(5,7,15,0.92)', border: { color: 'rgba(255,233,166,0.1)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Tab Active', x: 253, y: 860, w: 64,
        content: '▦\nStats', fontSize: 10, fontFamily: 'Inter', color: '#FFE9A6', align: 'center' },
    ]
  },

  // ── PROFILE ───────────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'Profile',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 180 }, opacity: 0.14 },
      { type: 'text', name: 'Title', x: 24, y: 72, w: 300,
        content: 'Profile', fontSize: 28, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      // Avatar
      { type: 'ellipse', name: 'Avatar', x: 165, y: 120, w: 100, h: 100,
        fill: 'rgba(255,233,166,0.12)',
        border: { color: '#FFE9A6', opacity: 0.4, width: 2 } },
      { type: 'text', name: 'Avatar Initial', x: 165, y: 154, w: 100,
        content: 'A', fontSize: 36, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFE9A6', align: 'center' },
      { type: 'text', name: 'Diver Name', x: 0, y: 234, w: 430,
        content: 'Alex', fontSize: 24, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'rect', name: 'Level Badge', x: 175, y: 266, w: 80, h: 24,
        fill: '#FFE9A6', radius: 12 },
      { type: 'text', name: 'Level Label', x: 175, y: 273, w: 80,
        content: 'Level 8', fontSize: 11, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#05070F', align: 'center' },
      // XP bar
      { type: 'rect', name: 'XP Bar BG', x: 40, y: 306, w: 350, h: 8,
        fill: 'rgba(255,255,255,0.08)', radius: 4 },
      { type: 'rect', name: 'XP Bar Fill', x: 40, y: 306, w: 245, h: 8,
        fill: '#FFE9A6', radius: 4 },
      { type: 'text', name: 'XP Label', x: 40, y: 320, w: 350,
        content: '2450 / 3500 XP  ·  Level 9', fontSize: 11, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      // Premium badge
      { type: 'rect', name: 'Premium Row', x: 16, y: 360, w: 398, h: 56,
        fill: 'rgba(255,210,122,0.08)', radius: 16,
        border: { color: 'rgba(255,210,122,0.3)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Premium Label', x: 32, y: 380, w: 200,
        content: '★  Deep Ocean Premium', fontSize: 14, fontFamily: 'Sora',
        color: '#FFD27A' },
      { type: 'text', name: 'Premium Sub', x: 32, y: 398, w: 200,
        content: 'Active', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,210,122,0.72)' },
      // Settings rows
      { type: 'rect', name: 'Settings Card', x: 16, y: 432, w: 398, h: 220,
        fill: 'rgba(23,26,39,0.34)', radius: 20,
        border: { color: 'rgba(191,247,255,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Row Notifications', x: 32, y: 450, w: 334,
        content: 'Notifications', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'line', name: 'Divider 1', x: 32, y: 482, w: 334, h: 1, opacity: 0.1 },
      { type: 'text', name: 'Row Language', x: 32, y: 492, w: 334,
        content: 'Language', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'line', name: 'Divider 2', x: 32, y: 524, w: 334, h: 1, opacity: 0.1 },
      { type: 'text', name: 'Row Theme', x: 32, y: 534, w: 334,
        content: 'Theme', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'line', name: 'Divider 3', x: 32, y: 566, w: 334, h: 1, opacity: 0.1 },
      { type: 'text', name: 'Row Rate', x: 32, y: 576, w: 334,
        content: 'Rate Deep Ocean', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'line', name: 'Divider 4', x: 32, y: 608, w: 334, h: 1, opacity: 0.1 },
      { type: 'text', name: 'Row Restore', x: 32, y: 618, w: 334,
        content: 'Restore Purchases', fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'rect', name: 'Tab Bar BG', x: 0, y: 849, w: 430, h: 83,
        fill: 'rgba(5,7,15,0.92)', border: { color: 'rgba(255,233,166,0.1)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Tab Active', x: 349, y: 860, w: 64,
        content: '○\nProfile', fontSize: 10, fontFamily: 'Inter', color: '#FFE9A6', align: 'center' },
    ]
  },

  // ── AI ────────────────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'AI',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 180 }, opacity: 0.14 },
      // Header
      { type: 'ellipse', name: 'AI Avatar', x: 183, y: 72, w: 64, h: 64,
        fill: 'rgba(255,233,166,0.12)',
        border: { color: '#FFE9A6', opacity: 0.4, width: 2 } },
      { type: 'text', name: 'AI Avatar Icon', x: 183, y: 90, w: 64,
        content: '◎', fontSize: 28, color: '#FFE9A6', align: 'center' },
      { type: 'text', name: 'AI Name', x: 0, y: 148, w: 430,
        content: 'Ocean Guide', fontSize: 17, fontFamily: 'Sora',
        color: '#FFF8E7', align: 'center' },
      // AI message bubble
      { type: 'rect', name: 'AI Bubble', x: 16, y: 190, w: 310, h: 88,
        fill: 'rgba(23,26,39,0.5)', radius: 20,
        border: { color: 'rgba(255,233,166,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'AI Message', x: 32, y: 206, w: 278,
        content: "You've been diving consistently for 7 days. Your focus depth is improving — today you reached Midnight Zone for the first time.",
        fontSize: 14, fontFamily: 'Inter', color: '#FFF8E7', opacity: 0.9, lineHeight: 22 },
      // User bubble
      { type: 'rect', name: 'User Bubble', x: 104, y: 294, w: 310, h: 56,
        fill: 'rgba(255,233,166,0.1)', radius: 20,
        border: { color: 'rgba(255,233,166,0.22)', opacity: 1, width: 1 } },
      { type: 'text', name: 'User Message', x: 120, y: 310, w: 278,
        content: 'What should I focus on tomorrow?',
        fontSize: 14, fontFamily: 'Inter', color: '#FFF8E7', lineHeight: 22 },
      // AI reply
      { type: 'rect', name: 'AI Bubble 2', x: 16, y: 366, w: 310, h: 72,
        fill: 'rgba(23,26,39,0.5)', radius: 20,
        border: { color: 'rgba(255,233,166,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'AI Message 2', x: 32, y: 382, w: 278,
        content: "Try a 30-minute session and aim for Abyss Zone. You're close to unlocking it.",
        fontSize: 14, fontFamily: 'Inter', color: '#FFF8E7', opacity: 0.9, lineHeight: 22 },
      // Input bar
      { type: 'rect', name: 'Input Bar', x: 16, y: 858, w: 398, h: 48,
        fill: 'rgba(23,26,39,0.6)', radius: 24,
        border: { color: 'rgba(255,233,166,0.18)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Input Placeholder', x: 32, y: 874, w: 300,
        content: 'Ask your guide…', fontSize: 14, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.32)' },
      { type: 'ellipse', name: 'Send Button', x: 350, y: 862, w: 40, h: 40,
        fill: '#FFE9A6' },
      { type: 'text', name: 'Send Icon', x: 350, y: 874, w: 40,
        content: '↑', fontSize: 18, fontFamily: 'Inter', color: '#05070F', align: 'center' },
    ]
  },
```

- [ ] **Step 2: Verify in Figma — Core Screens page should now have 6 frames**

Run plugin again. Check:
- Collection: zone filter tabs visible, 3 creature rows (2 discovered, 1 locked)
- Stats: depth hero card, zone bars with fills
- Profile: avatar circle, XP bar, settings rows
- AI: chat bubbles alternating left/right, input bar at bottom

- [ ] **Step 3: Commit**

```bash
git add figma-plugin/code.js
git commit -m "feat(figma-plugin): add Collection, Stats, Profile, AI screen specs"
```

---

### Task 4: Spec — Notifications + Session Detail + all 6 Sheets

**Files:**
- Modify: `figma-plugin/code.js` — append remaining Core Screen entries + all Sheet entries

- [ ] **Step 1: Append Notifications + Session Detail to SPEC**

```js
  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'Notifications',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'BG Gradient', x: 0, y: 0, w: 430, h: 932,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 180 }, opacity: 0.14 },
      { type: 'text', name: 'Title', x: 24, y: 72, w: 300,
        content: 'Notifications', fontSize: 28, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      // Notification rows
      { type: 'rect', name: 'Notif 1', x: 16, y: 120, w: 398, h: 72,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(255,233,166,0.14)', opacity: 1, width: 1 } },
      { type: 'ellipse', name: 'Notif 1 Icon', x: 28, y: 132, w: 40, h: 40,
        fill: 'rgba(255,233,166,0.12)' },
      { type: 'text', name: 'Notif 1 Emoji', x: 28, y: 144, w: 40,
        content: '🎯', fontSize: 18, align: 'center' },
      { type: 'text', name: 'Notif 1 Title', x: 80, y: 132, w: 290,
        content: 'Dive streak: 7 days', fontSize: 14, fontFamily: 'Sora', color: '#FFF8E7' },
      { type: 'text', name: 'Notif 1 Sub', x: 80, y: 152, w: 290,
        content: 'You\'re on a roll — keep it up!', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.62)' },
      { type: 'text', name: 'Notif 1 Time', x: 80, y: 172, w: 290,
        content: '2h ago', fontSize: 11, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.38)' },
      { type: 'rect', name: 'Notif 2', x: 16, y: 200, w: 398, h: 72,
        fill: 'rgba(23,26,39,0.34)', radius: 16,
        border: { color: 'rgba(191,247,255,0.12)', opacity: 1, width: 1 } },
      { type: 'ellipse', name: 'Notif 2 Icon', x: 28, y: 212, w: 40, h: 40,
        fill: 'rgba(159,255,212,0.1)' },
      { type: 'text', name: 'Notif 2 Emoji', x: 28, y: 224, w: 40,
        content: '✦', fontSize: 18, color: '#9FFFD4', align: 'center' },
      { type: 'text', name: 'Notif 2 Title', x: 80, y: 212, w: 290,
        content: 'New discovery: Midnight Squid', fontSize: 14, fontFamily: 'Sora', color: '#FFF8E7' },
      { type: 'text', name: 'Notif 2 Sub', x: 80, y: 232, w: 290,
        content: 'Added to your collection', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.62)' },
      { type: 'text', name: 'Notif 2 Time', x: 80, y: 252, w: 290,
        content: 'Yesterday', fontSize: 11, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.38)' },
      { type: 'rect', name: 'Tab Bar BG', x: 0, y: 849, w: 430, h: 83,
        fill: 'rgba(5,7,15,0.92)', border: { color: 'rgba(255,233,166,0.1)', opacity: 1, width: 1 } },
    ]
  },

  // ── SESSION DETAIL ────────────────────────────────────────────────────────
  {
    page: 'Core Screens', name: 'Session Detail',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Hero Gradient', x: 0, y: 0, w: 430, h: 260,
        fill: { gradient: ['#E4F8FF', '#6F8DFF', '#10172A'], angle: 180 }, opacity: 0.7 },
      { type: 'text', name: 'Back Button', x: 24, y: 68, w: 60,
        content: '← Back', fontSize: 13, fontFamily: 'Inter', color: '#FFE9A6' },
      { type: 'text', name: 'Zone Label', x: 24, y: 108, w: 300,
        content: 'MIDNIGHT ZONE', fontSize: 11, fontFamily: 'Sora',
        color: '#BFF7FF', letterSpacing: 2 },
      { type: 'text', name: 'Session Date', x: 24, y: 132, w: 300,
        content: 'Today, 9:30 AM', fontSize: 24, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7' },
      // Stats row
      { type: 'rect', name: 'Stats Row', x: 16, y: 196, w: 398, h: 72,
        fill: 'rgba(23,26,39,0.5)', radius: 16,
        border: { color: 'rgba(255,233,166,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Stat Duration Label', x: 32, y: 208, w: 100,
        content: 'DURATION', fontSize: 9, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Stat Duration Value', x: 32, y: 224, w: 100,
        content: '20 min', fontSize: 17, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      { type: 'text', name: 'Stat Depth Label', x: 160, y: 208, w: 100,
        content: 'MAX DEPTH', fontSize: 9, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Stat Depth Value', x: 160, y: 224, w: 100,
        content: '−32m', fontSize: 17, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFE9A6' },
      { type: 'text', name: 'Stat Disc Label', x: 288, y: 208, w: 100,
        content: 'DISCOVERIES', fontSize: 9, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'text', name: 'Stat Disc Value', x: 288, y: 224, w: 100,
        content: '3', fontSize: 17, fontFamily: 'Sora', fontStyle: 'Bold', color: '#9FFFD4' },
      // Timeline
      { type: 'text', name: 'Timeline Label', x: 24, y: 290, w: 200,
        content: 'DISCOVERIES', fontSize: 10, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.48)', letterSpacing: 1 },
      { type: 'rect', name: 'Timeline Item 1', x: 16, y: 314, w: 398, h: 60,
        fill: 'rgba(23,26,39,0.34)', radius: 12,
        border: { color: 'rgba(191,247,255,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Timeline 1 Name', x: 32, y: 326, w: 300,
        content: 'Bioluminescent Jellyfish', fontSize: 14, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'text', name: 'Timeline 1 Time', x: 32, y: 348, w: 200,
        content: '9:35 AM · Surface Zone', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)' },
      { type: 'rect', name: 'Timeline Item 2', x: 16, y: 382, w: 398, h: 60,
        fill: 'rgba(23,26,39,0.34)', radius: 12,
        border: { color: 'rgba(191,247,255,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Timeline 2 Name', x: 32, y: 394, w: 300,
        content: 'Midnight Squid', fontSize: 14, fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'text', name: 'Timeline 2 Time', x: 32, y: 416, w: 200,
        content: '9:42 AM · Midnight Zone', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)' },
    ]
  },

  // ── PAYWALL ───────────────────────────────────────────────────────────────
  {
    page: 'Sheets & Overlays', name: 'Paywall',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Scrim', x: 0, y: 0, w: 430, h: 932,
        fill: 'rgba(0,0,0,0.72)' },
      { type: 'rect', name: 'Sheet', x: 0, y: 120, w: 430, h: 812,
        fill: '#0A1420', radius: 32 },
      { type: 'rect', name: 'Hero Gradient', x: 0, y: 120, w: 430, h: 200,
        fill: { gradient: ['#FAE6A0', '#BFF7FF'], angle: 135 }, radius: 32, opacity: 0.22 },
      { type: 'text', name: 'Close Button', x: 382, y: 136, w: 32,
        content: '✕', fontSize: 16, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
      { type: 'text', name: 'Crown', x: 0, y: 160, w: 430,
        content: '★', fontSize: 48, color: '#FFD27A', align: 'center' },
      { type: 'text', name: 'Heading', x: 40, y: 228, w: 350,
        content: 'Deep Ocean\nPremium', fontSize: 32, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center', lineHeight: 42 },
      { type: 'text', name: 'Sub', x: 40, y: 314, w: 350,
        content: 'Unlock all themes, AI insights, and unlimited discoveries.',
        fontSize: 15, fontFamily: 'Inter', color: 'rgba(255,248,231,0.72)',
        align: 'center', lineHeight: 24 },
      // Feature rows
      { type: 'rect', name: 'Feature Row 1', x: 40, y: 374, w: 350, h: 48,
        fill: 'rgba(255,210,122,0.06)', radius: 12,
        border: { color: 'rgba(255,210,122,0.2)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Feature 1', x: 56, y: 390, w: 318,
        content: '✓  10 exclusive Prism themes', fontSize: 14,
        fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'rect', name: 'Feature Row 2', x: 40, y: 430, w: 350, h: 48,
        fill: 'rgba(255,210,122,0.06)', radius: 12,
        border: { color: 'rgba(255,210,122,0.2)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Feature 2', x: 56, y: 446, w: 318,
        content: '✓  Ocean Guide AI companion', fontSize: 14,
        fontFamily: 'Inter', color: '#FFF8E7' },
      { type: 'rect', name: 'Feature Row 3', x: 40, y: 486, w: 350, h: 48,
        fill: 'rgba(255,210,122,0.06)', radius: 12,
        border: { color: 'rgba(255,210,122,0.2)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Feature 3', x: 56, y: 502, w: 318,
        content: '✓  Full creature collection', fontSize: 14,
        fontFamily: 'Inter', color: '#FFF8E7' },
      // CTA
      { type: 'rect', name: 'CTA Button', x: 40, y: 560, w: 350, h: 60,
        fill: '#FFD27A', radius: 20 },
      { type: 'text', name: 'CTA Label', x: 40, y: 578, w: 350,
        content: 'Unlock Premium', fontSize: 17, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#1A0F00', align: 'center', letterSpacing: 0.5 },
      { type: 'text', name: 'Footer', x: 40, y: 638, w: 350,
        content: 'Restore Purchases  ·  Terms  ·  Privacy', fontSize: 12, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.38)', align: 'center' },
    ]
  },

  // ── THEME PICKER ──────────────────────────────────────────────────────────
  {
    page: 'Sheets & Overlays', name: 'Theme Picker',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Scrim', x: 0, y: 0, w: 430, h: 932, fill: 'rgba(0,0,0,0.72)' },
      { type: 'rect', name: 'Sheet', x: 0, y: 200, w: 430, h: 732, fill: '#0A1420', radius: 32 },
      { type: 'text', name: 'Sheet Title', x: 24, y: 232, w: 300,
        content: 'Choose Theme', fontSize: 20, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      // 2-col grid of 10 theme cards (5 rows)
      ...['Prism Light','Prism Fire','Prism Water','Prism Air','Prism Nature','Prism Ice','Prism Storm','Prism Magma','Prism Mystic','Prism Dark'].map((name, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = col === 0 ? 16 : 224, y = 280 + row * 104;
        const accents = ['#FFE9A6','#FF6A3D','#48E6FF','#BDEBFF','#74FF9F','#A9F4FF','#B18CFF','#FF8A2A','#82FFD9','#C77DFF'];
        return [
          { type: 'rect', name: `Theme Card ${name}`, x, y, w: 190, h: 88,
            fill: 'rgba(23,26,39,0.5)', radius: 16,
            border: { color: accents[i], opacity: i === 0 ? 0.7 : 0.2, width: i === 0 ? 2 : 1 } },
          { type: 'rect', name: `Swatch ${name}`, x: x + 12, y: y + 12, w: 32, h: 32,
            fill: accents[i], radius: 8 },
          { type: 'text', name: `Name ${name}`, x: x + 52, y: y + 18, w: 130,
            content: name, fontSize: 13, fontFamily: 'Sora', color: '#FFF8E7' },
          { type: 'text', name: `Element ${name}`, x: x + 52, y: y + 38, w: 130,
            content: ['Light','Fire','Water','Air','Nature','Ice','Storm','Magma','Mystic','Dark'][i],
            fontSize: 11, fontFamily: 'Inter', color: 'rgba(255,248,231,0.48)' },
        ];
      }).flat(),
    ]
  },

  // ── LANGUAGE PICKER ───────────────────────────────────────────────────────
  {
    page: 'Sheets & Overlays', name: 'Language Picker',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Scrim', x: 0, y: 0, w: 430, h: 932, fill: 'rgba(0,0,0,0.72)' },
      { type: 'rect', name: 'Sheet', x: 0, y: 300, w: 430, h: 632, fill: '#0A1420', radius: 32 },
      { type: 'text', name: 'Title', x: 24, y: 332, w: 300,
        content: 'Language', fontSize: 20, fontFamily: 'Sora', fontStyle: 'Bold', color: '#FFF8E7' },
      { type: 'rect', name: 'Search Bar', x: 16, y: 372, w: 398, h: 44,
        fill: 'rgba(23,26,39,0.6)', radius: 22,
        border: { color: 'rgba(255,233,166,0.14)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Search Placeholder', x: 32, y: 388, w: 300,
        content: '🔍  Search language', fontSize: 14, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.32)' },
      ...['🇺🇸  English','🇻🇳  Tiếng Việt','🇪🇸  Español','🇯🇵  日本語','🇰🇷  한국어'].map((lang, i) => [
        { type: 'rect', name: `Lang Row ${i}`, x: 16, y: 432 + i * 56, w: 398, h: 48,
          fill: i === 0 ? 'rgba(255,233,166,0.06)' : 'transparent', radius: 12,
          border: { color: i === 0 ? 'rgba(255,233,166,0.2)' : 'transparent', opacity: 1, width: 1 } },
        { type: 'text', name: `Lang Label ${i}`, x: 32, y: 446 + i * 56, w: 300,
          content: lang, fontSize: 15, fontFamily: 'Inter', color: '#FFF8E7' },
        ...(i === 0 ? [{ type: 'text', name: 'Check', x: 374, y: 446, w: 24,
          content: '✓', fontSize: 16, color: '#FFE9A6', align: 'center' }] : []),
      ]).flat(),
    ]
  },

  // ── CREATURE STORY ────────────────────────────────────────────────────────
  {
    page: 'Sheets & Overlays', name: 'Creature Story',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Scrim', x: 0, y: 0, w: 430, h: 932, fill: 'rgba(0,0,0,0.72)' },
      { type: 'rect', name: 'Sheet', x: 0, y: 100, w: 430, h: 832, fill: '#0A1420', radius: 32 },
      { type: 'rect', name: 'Creature Illustration', x: 16, y: 120, w: 398, h: 280,
        fill: { gradient: ['#FAE6A0', '#8BB7FF', '#141A35'], angle: 135 }, radius: 20, opacity: 0.5 },
      { type: 'text', name: 'Illustration Placeholder', x: 16, y: 240, w: 398,
        content: '✦', fontSize: 64, color: '#FFE9A6', align: 'center', opacity: 0.4 },
      { type: 'text', name: 'Zone Badge', x: 24, y: 424, w: 120,
        content: 'Surface Zone', fontSize: 11, fontFamily: 'Sora',
        color: '#BFF7FF', letterSpacing: 0.5 },
      { type: 'text', name: 'Creature Name', x: 24, y: 448, w: 382,
        content: 'Bioluminescent Jellyfish', fontSize: 26, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7' },
      { type: 'rect', name: 'Rarity Badge', x: 24, y: 490, w: 72, h: 22,
        fill: 'rgba(255,233,166,0.12)', radius: 11,
        border: { color: '#FFE9A6', opacity: 0.3, width: 1 } },
      { type: 'text', name: 'Rarity Label', x: 24, y: 497, w: 72,
        content: 'Common', fontSize: 11, fontFamily: 'Sora', color: '#FFE9A6', align: 'center' },
      { type: 'text', name: 'Description', x: 24, y: 528, w: 382,
        content: 'Found in the shallow waters of the Surface Zone, this creature emits a soft blue-white light that pulses gently in the current. Early divers called it the lantern of the sea.',
        fontSize: 15, fontFamily: 'Inter', color: 'rgba(255,248,231,0.72)',
        lineHeight: 24 },
      { type: 'text', name: 'Close', x: 382, y: 116, w: 32,
        content: '✕', fontSize: 16, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.48)', align: 'center' },
    ]
  },

  // ── DISCOVERY OVERLAY ─────────────────────────────────────────────────────
  {
    page: 'Sheets & Overlays', name: 'Discovery Overlay',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Scrim', x: 0, y: 0, w: 430, h: 932, fill: 'rgba(0,0,0,0.72)' },
      { type: 'rect', name: 'Card', x: 32, y: 260, w: 366, h: 412,
        fill: '#0A1420', radius: 28,
        border: { color: '#FFE9A6', opacity: 0.22, width: 1 } },
      { type: 'rect', name: 'Card Glow', x: 32, y: 260, w: 366, h: 412,
        fill: 'rgba(255,233,166,0.03)', radius: 28 },
      { type: 'text', name: 'Discovery Label', x: 32, y: 288, w: 366,
        content: 'NEW DISCOVERY', fontSize: 11, fontFamily: 'Sora',
        color: '#FFE9A6', align: 'center', letterSpacing: 2 },
      { type: 'ellipse', name: 'Creature Illustration', x: 140, y: 316, w: 150, h: 150,
        fill: { gradient: ['#FAE6A0', '#BFF7FF'], angle: 135 }, opacity: 0.3 },
      { type: 'text', name: 'Creature Icon', x: 140, y: 368, w: 150,
        content: '✦', fontSize: 56, color: '#FFE9A6', align: 'center', opacity: 0.8 },
      { type: 'text', name: 'Creature Name', x: 32, y: 484, w: 366,
        content: 'Bioluminescent Jellyfish', fontSize: 20, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'text', name: 'Zone Info', x: 32, y: 516, w: 366,
        content: 'Surface Zone  ·  −12m  ·  Common', fontSize: 13, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.62)', align: 'center' },
      { type: 'rect', name: 'Dismiss Button', x: 72, y: 604, w: 286, h: 52,
        fill: 'rgba(255,233,166,0.1)', radius: 16,
        border: { color: '#FFE9A6', opacity: 0.3, width: 1 } },
      { type: 'text', name: 'Dismiss Label', x: 72, y: 620, w: 286,
        content: 'Continue Diving', fontSize: 14, fontFamily: 'Sora',
        color: '#FFE9A6', align: 'center', letterSpacing: 0.5 },
    ]
  },

  // ── REMINDER TIME PICKER ──────────────────────────────────────────────────
  {
    page: 'Sheets & Overlays', name: 'Reminder Time Picker',
    width: 430, height: 932, background: '#05070F',
    layers: [
      { type: 'rect', name: 'Scrim', x: 0, y: 0, w: 430, h: 932, fill: 'rgba(0,0,0,0.72)' },
      { type: 'rect', name: 'Sheet', x: 0, y: 420, w: 430, h: 512, fill: '#0A1420', radius: 32 },
      { type: 'text', name: 'Title', x: 24, y: 452, w: 382,
        content: 'Daily Reminder', fontSize: 20, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7' },
      { type: 'text', name: 'Sub', x: 24, y: 482, w: 382,
        content: 'Pick a time for your daily dive', fontSize: 14, fontFamily: 'Inter',
        color: 'rgba(255,248,231,0.62)' },
      // Time wheel (simulated)
      { type: 'rect', name: 'Time Wheel BG', x: 40, y: 514, w: 350, h: 160,
        fill: 'rgba(23,26,39,0.4)', radius: 20 },
      { type: 'rect', name: 'Selection Highlight', x: 40, y: 571, w: 350, h: 44,
        fill: 'rgba(255,233,166,0.08)', radius: 10,
        border: { color: 'rgba(255,233,166,0.18)', opacity: 1, width: 1 } },
      { type: 'text', name: 'Hour Above', x: 40, y: 526, w: 175,
        content: '8', fontSize: 24, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.28)', align: 'center' },
      { type: 'text', name: 'Hour Selected', x: 40, y: 578, w: 175,
        content: '9', fontSize: 32, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'text', name: 'Hour Below', x: 40, y: 622, w: 175,
        content: '10', fontSize: 24, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.28)', align: 'center' },
      { type: 'text', name: 'Min Above', x: 215, y: 526, w: 175,
        content: '15', fontSize: 24, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.28)', align: 'center' },
      { type: 'text', name: 'Min Selected', x: 215, y: 578, w: 175,
        content: '30', fontSize: 32, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#FFF8E7', align: 'center' },
      { type: 'text', name: 'Min Below', x: 215, y: 622, w: 175,
        content: '45', fontSize: 24, fontFamily: 'Sora',
        color: 'rgba(255,248,231,0.28)', align: 'center' },
      { type: 'rect', name: 'Set Button', x: 40, y: 700, w: 350, h: 56,
        fill: '#FFE9A6', radius: 20 },
      { type: 'text', name: 'Set Label', x: 40, y: 716, w: 350,
        content: 'Set Reminder', fontSize: 15, fontFamily: 'Sora', fontStyle: 'Bold',
        color: '#05070F', align: 'center', letterSpacing: 0.5 },
      { type: 'text', name: 'Remove', x: 40, y: 772, w: 350,
        content: 'Remove Reminder', fontSize: 14, fontFamily: 'Inter',
        color: '#FF8EA6', align: 'center' },
    ]
  },
];
```

- [ ] **Step 2: Verify all 3 pages in Figma**

Run plugin → Generate All. Verify:
- Onboarding: 3 frames
- Core Screens: 8 frames
- Sheets & Overlays: 6 frames (including Theme Picker with 10 cards)
- Total: 17 frames

- [ ] **Step 3: Commit**

```bash
git add figma-plugin/code.js
git commit -m "feat(figma-plugin): complete all screen and sheet specs (17 frames)"
```

---

### Task 5: README + final verification

**Files:**
- Create: `figma-plugin/README.md`

- [ ] **Step 1: Create README**

```markdown
# Deep Ocean — Figma UI Generator Plugin

Generates high-fidelity mockups of all Deep Ocean screens in Figma.

## Setup

1. Open Figma Desktop
2. Menu → Plugins → Development → Import plugin from manifest
3. Select `figma-plugin/manifest.json`

## Usage

1. Open the Deep Ocean Figma file
2. Run the plugin (Plugins → Development → Deep Ocean UI Generator)
3. Choose page scope or "All Pages"
4. Click **Generate Screens**

## Output

| Page | Frames |
|---|---|
| Onboarding | Welcome, Permissions, First Dive |
| Core Screens | Home, Dive, Collection, Stats, Profile, AI, Notifications, Session Detail |
| Sheets & Overlays | Paywall, Theme Picker, Language Picker, Creature Story, Discovery Overlay, Reminder Time Picker |

Frame size: 430 × 932 px (iPhone 16 Plus). Theme: Prism Light.

## Regenerating

Running the plugin again deletes and recreates each selected page — all frames are idempotently regenerated.
```

- [ ] **Step 2: Full end-to-end test in Figma**

1. Open DeepOcean Figma file (`rQbT09ed2v5dg0Vz2Tsrz1`)
2. Import plugin from `figma-plugin/manifest.json`
3. Run → Generate All
4. Verify: 3 pages created, 17 total frames, no JS errors
5. Spot-check: Home frame has stats row, Dive frame has progress ring, Paywall frame has gold CTA

- [ ] **Step 3: Commit**

```bash
git add figma-plugin/README.md
git commit -m "feat(figma-plugin): add README, complete plugin ready for use"
```
