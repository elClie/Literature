/* Erosion glow — images with eroded, glowing, crumbling edges that grow in when shown and can burn away.
   Drop-in: <script src="erosion-glow.js"></script>, then
     <figure class="erosion-glow" data-tint="#ff8a3a" data-focal="50% 40%"><img src="photo.jpg" alt=""></figure>
   The figure needs a size (width + height or aspect-ratio); the <img> is hidden and drawn by WebGL instead.
   States (toggle the classes yourself):  .is-focus  stronger glow · .is-dim  darker · .is-burnt  burns away (1.3s, reversible)
   Attributes:
     data-tint    glow colour (hex), default #ff8a3a
     data-focal   object-position of the crop, default "50% 50%"
     data-palette "none" = keep the photo's colours · 4 comma-separated hex stops (shadow→highlight) = duotone
                  default: ink → umber → gold → paper
   All figures share ONE WebGL context (Chrome caps live contexts) and are copied into their own 2D canvas.
   Only figures that are actually visible get drawn. No WebGL / tainted image → .is-dom (plain <img> shows).
   API: window.ErosionGlow.mount(root = document) picks up figures added later. */
(() => {
  const BLEED = 120;
  const DEFAULTS = { tint: "#ff8a3a", palette: ["#09070b", "#4d2614", "#dbb070", "#fff2d6"] };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const style = document.createElement("style");
  style.textContent = `
.erosion-glow { position: relative; margin: 0; }
.erosion-glow > img { display: block; width: 100%; height: 100%; object-fit: cover; opacity: 0; }
.erosion-glow.is-dom > img { opacity: 1; }
.erosion-glow > .erosion-canvas { position: absolute; inset: -${BLEED}px; z-index: 0; pointer-events: none; }`;
  document.head.appendChild(style);

  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uReveal, uFocus, uDim, uSeed, uBurn, uMono;
uniform vec4 uBox;
uniform vec2 uImg, uFocal;
uniform vec3 uTint, uP0, uP1, uP2, uP3;
uniform sampler2D uTex;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p, int oct) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    if (i >= oct) break;
    v += a * noise(p); p = m * p; a *= 0.5;
  }
  return v;
}
// x = crunchy field, y = smooth field; > 0 = kept. Noise only runs inside the band where it can matter.
vec2 edge(vec2 s, vec2 l, vec2 hs, float E, float seed, float reach) {
  float d = min(hs.x - abs(l.x), hs.y - abs(l.y));
  if (d > E * 1.4 + 4.0) return vec2(d);
  if (d < -reach) return vec2(d);
  vec2 q = l + seed * 97.0;
  float n1 = fbm(q * 0.028 + vec2(0.0, uTime * 0.05), 4);
  float n2 = fbm(q * 0.1 + n1 * 2.5 - vec2(uTime * 0.03, 0.0), 4);
  float n3 = fbm(q * 0.38 + n2 * 3.0, 3);
  float ero = E * clamp(0.05 + 1.3 * (n1 - 0.3) + 0.6 * (n2 - 0.5), 0.0, 1.15) + (n3 - 0.5) * E * 0.35;
  float crumb = (noise(s * 0.35 + n2 * 6.0) - 0.5) * 3.0;
  float soft = d - ero;
  return vec2(soft - crumb, soft);
}
float glowAmt(float soft, float k, float halo, float lip) {
  float h = exp(min(soft, 0.0) / k) * step(soft, 0.0);
  float core = exp(-abs(soft) / 2.5);
  float l = exp(-max(soft, 0.0) / 9.0) * step(0.0, soft);
  return h * halo + core * 0.9 + l * lip;
}
float flicker(vec2 l, float seed) {
  return 0.7 + 0.6 * noise(vec2((l.x + l.y) * 0.05 + seed * 13.0, uTime * 1.6))
                     * noise(vec2((l.x - l.y) * 0.02 - uTime * 0.4, 5.0 + seed));
}
float rimMask(vec2 s, float field, float w) {
  float band = step(0.0, field) * (1.0 - smoothstep(0.0, w, field));
  float fleck = step(0.5, noise(s * 0.6 + uTime * 0.8));
  float lip = step(0.0, field) * (1.0 - smoothstep(0.0, 1.2, field));
  return max(band * fleck, lip * 0.85);
}
// 0 at the canvas border → 1 at bleed px in: glow still lit at the border shows as a hard rectangle
float bleedFade(vec2 s, vec2 res, float bleed) {
  vec2 m = clamp(min(s, res - s) / bleed, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  return m.x * m.y;
}
vec3 duotone(float L) {
  vec3 c = mix(uP0, uP1, smoothstep(0.0, 0.38, L));
  c = mix(c, uP2, smoothstep(0.32, 0.74, L));
  return mix(c, uP3, smoothstep(0.7, 1.0, L));
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 hs = uBox.zw;
  vec2 l = s - uBox.xy;
  float t = uTime;
  float E = mix(18.0, 30.0, uFocus) + (1.0 - uReveal) * (min(hs.x, hs.y) + 40.0);
  E += uBurn * (min(hs.x, hs.y) * 1.3 + 60.0);
  float k = mix(11.0, 22.0, uFocus) + uBurn * 14.0;
  vec2 e = edge(s, l, hs, E, uSeed, 5.0 * k);
  e -= vec2(uBurn * uBurn * (min(hs.x, hs.y) * 1.25 + 40.0));

  vec3 col = vec3(0.0);
  float a = 0.0;
  if (e.x > 0.0) {
    vec2 box = hs * 2.0;
    float sc = max(box.x / uImg.x, box.y / uImg.y);
    vec2 drawn = uImg * sc;
    vec2 uv = (l + hs - (box - drawn) * uFocal) / drawn;
    vec3 c = texture2D(uTex, clamp(uv, 0.001, 0.999)).rgb;
    float grain = (hash(s + floor(t * 24.0) * 17.0) - 0.5) * 0.07;
    float L = clamp(smoothstep(0.03, 0.97, dot(c, vec3(0.3, 0.59, 0.11))) + grain, 0.0, 1.0);
    col = uMono > 0.5 ? duotone(L) : clamp(c + grain, 0.0, 1.0);
    float d = min(hs.x - abs(l.x), hs.y - abs(l.y));
    col *= mix(0.72, 1.0, smoothstep(0.0, 80.0, d)) * mix(1.0, 0.42, uDim);
    col = mix(col, mix(uTint, vec3(1.0), 0.55), rimMask(s, e.x, mix(4.0, 7.0, uFocus)) * (1.0 - 0.5 * uDim));
    a = 1.0;
  }

  float I = mix(0.55, 1.4, uFocus) * (1.0 - 0.55 * uDim) * (1.0 + uBurn * (1.0 - uBurn) * 4.0);
  float g = glowAmt(e.y, k, 0.6, 0.5);
  vec3 glow = g > 0.002 ? mix(uTint, vec3(1.0), uFocus * 0.3) * g * flicker(l, uSeed) * I : vec3(0.0);
  float sp = hash(floor(s / 2.0) + uSeed * 31.0);
  float ember = step(0.994, sp) * step(-k * 1.6, e.y) * step(e.y, 0.0);
  glow += mix(uTint, vec3(1.0), 0.4) * ember * (0.5 + 0.5 * sin(t * 4.0 + sp * 80.0)) * I;
  glow *= bleedFade(s, uRes, ${BLEED}.0);

  vec3 rgb = min(col * a + glow, vec3(1.0));
  gl_FragColor = vec4(rgb, clamp(max(a, max(rgb.r, max(rgb.g, rgb.b))), 0.0, 1.0));
}`;
  const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
  const UNIFORMS = ["uRes", "uTime", "uReveal", "uFocus", "uDim", "uSeed", "uBurn", "uMono", "uBox", "uImg", "uFocal",
    "uTint", "uP0", "uP1", "uP2", "uP3", "uTex"];
  const hex = (h) => {
    const v = h.trim().replace("#", "");
    const full = v.length === 3 ? [...v].map((c) => c + c).join("") : v;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  };

  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl", { antialias: false, premultipliedAlpha: true, alpha: true });
  let U = null;
  if (gl) {
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, "a");
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    U = {};
    UNIFORMS.forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1i(U.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
  }

  const items = [];

  function add(fig) {
    if (fig.dataset.erosionMounted) return;
    fig.dataset.erosionMounted = "1";
    if (!gl) {
      fig.classList.add("is-dom");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.className = "erosion-canvas";
    canvas.setAttribute("aria-hidden", "true");
    fig.prepend(canvas);
    const focal = (fig.dataset.focal || "50% 50%").split(/\s+/).map((v) => parseFloat(v) / 100);
    const pal = (fig.dataset.palette || "").trim();
    const stops = pal && pal !== "none" ? pal.split(",") : DEFAULTS.palette;
    const item = {
      fig,
      canvas,
      ctx: canvas.getContext("2d"),
      img: fig.querySelector("img"),
      tex: null,
      focal: [focal[0] ?? 0.5, focal[1] ?? 0.5],
      tint: hex(fig.dataset.tint || DEFAULTS.tint),
      mono: pal === "none" ? 0 : 1,
      palette: stops.slice(0, 4).map(hex),
      seed: 0.37 + items.length * 1.91,
      reveal: 0, revealAt: 0, focus: 0.5, dim: 0, burn: 0, burnAt: 0, wasBurnt: false, shown: false,
    };
    const upload = () => {
      if (!item.img?.naturalWidth) return;
      try {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, item.img);
        item.tex = tex;
      } catch (err) {
        console.warn("[erosion-glow] fell back to plain <img> (tainted image? serve over http)", err);
        fig.classList.add("is-dom");
        canvas.remove();
      }
    };
    if (item.img?.complete) upload();
    else item.img?.addEventListener("load", upload, { once: true });
    items.push(item);
  }

  function mount(root = document) {
    root.querySelectorAll(".erosion-glow").forEach(add);
  }

  let time = 0;
  let last = performance.now();

  function onScreen(el) {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > -BLEED && r.right > -BLEED && r.top < innerHeight + BLEED && r.left < innerWidth + BLEED;
  }

  function draw(item, w, h) {
    if (glCanvas.width < w || glCanvas.height < h) {
      glCanvas.width = Math.max(glCanvas.width, w);
      glCanvas.height = Math.max(glCanvas.height, h);
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform4f(U.uBox, w / 2, h / 2, w / 2 - BLEED, h / 2 - BLEED);
    gl.uniform2f(U.uImg, item.img.naturalWidth, item.img.naturalHeight);
    gl.uniform2f(U.uFocal, item.focal[0], item.focal[1]);
    gl.uniform3fv(U.uTint, item.tint);
    gl.uniform1f(U.uMono, item.mono);
    ["uP0", "uP1", "uP2", "uP3"].forEach((n, i) => gl.uniform3fv(U[n], item.palette[i] || item.palette[item.palette.length - 1]));
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uReveal, 1 - Math.pow(1 - item.reveal, 3));
    gl.uniform1f(U.uFocus, item.focus);
    gl.uniform1f(U.uDim, item.dim);
    gl.uniform1f(U.uSeed, item.seed);
    gl.uniform1f(U.uBurn, item.burn);
    gl.bindTexture(gl.TEXTURE_2D, item.tex);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    item.ctx.clearRect(0, 0, w, h);
    item.ctx.drawImage(glCanvas, 0, glCanvas.height - h, w, h, 0, 0, w, h);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!reduce) time += dt;
    const ease = 1 - Math.exp(-dt * 7);
    for (const item of items) {
      const visible = item.tex && item.fig.checkVisibility({ visibilityProperty: true }) && onScreen(item.fig);
      if (!visible) {
        if (item.shown) item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
        item.shown = false;
        continue;
      }
      if (!item.shown) item.revealAt = now;
      item.shown = true;
      const cls = item.fig.classList;
      item.focus += ((cls.contains("is-focus") ? 1 : 0.5) - item.focus) * ease;
      item.dim += ((cls.contains("is-dim") ? 1 : 0) - item.dim) * ease;
      item.reveal = reduce ? 1 : Math.min(1, (now - item.revealAt) / 800);
      const burnt = cls.contains("is-burnt");
      if (burnt !== item.wasBurnt) item.burnAt = now;
      item.wasBurnt = burnt;
      item.burn = burnt ? (reduce ? 1 : Math.min(1, (now - item.burnAt) / 1300) ** 1.6) : 0;
      const w = Math.round(item.fig.offsetWidth) + BLEED * 2;
      const h = Math.round(item.fig.offsetHeight) + BLEED * 2;
      if (item.canvas.width !== w || item.canvas.height !== h) {
        item.canvas.width = w;
        item.canvas.height = h;
      }
      draw(item, w, h);
    }
  }

  window.ErosionGlow = { mount };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mount());
  else mount();
  requestAnimationFrame(frame);
})();
