import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  Linkedin,
  LayoutGrid,
  List as ListIcon,
  Mail,
  Moon,
  Phone,
  RotateCcw,
  Sun,
  X,
  ShieldCheck,
  Cloud,
  Activity,
  GitBranch,
  Boxes,
  Wrench,
  Timer,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  Zap,
  ServerCog,
} from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const PALETTE = [
  { a: "#0EA5E9", b: "#1D4ED8" },
  { a: "#22C55E", b: "#065F46" },
  { a: "#F59E0B", b: "#B45309" },
  { a: "#A855F7", b: "#6D28D9" },
  { a: "#FB7185", b: "#BE123C" },
  { a: "#14B8A6", b: "#0F766E" },
  { a: "#60A5FA", b: "#1E3A8A" },
  { a: "#F97316", b: "#9A3412" },
];

function pickPalette(key) {
  return PALETTE[hashCode(String(key || "")) % PALETTE.length];
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}

function useBinaryReveal(finalText, key, { durationMs = 1200, settleMs = 200 } = {}) {
  const [text, setText] = useState(finalText);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const chars = finalText.split("");
    const total = chars.length;

    const tick = (now) => {
      const t = now - start;
      const p = clamp(t / durationMs, 0, 1);
      const revealCount = Math.floor(p * total);

      let out = "";
      for (let i = 0; i < total; i++) {
        const c = chars[i];
        if (i < revealCount) out += c;
        else out += c === " " ? " " : Math.random() > 0.5 ? "0" : "1";
      }
      setText(out);

      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setText(finalText), settleMs);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finalText, key, durationMs, settleMs]);

  return text;
}

/* ----------------------------- Color helpers ----------------------------- */
// Avoid 8-digit hex alpha entirely (some devices render it inconsistently).
function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "").trim();
  if (h.length !== 6) return { r: 255, g: 255, b: 255 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/* ----------------------------- Starfield + Meteors ----------------------------- */
function Starfield({ density = 650, theme = "dark" }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const stars = useRef([]);
  const meteors = useRef([]);
  const sizeRef = useRef({ w: window.innerWidth, h: window.innerHeight });
  const lastT = useRef(performance.now());
  const spawnAcc = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const N = Math.floor((w * h) / 1900);
      const target = Math.min(density, Math.max(160, N));
      stars.current = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.0 + 0.12,
        a: Math.random() * 0.55 + 0.08,
        tw: Math.random() * 0.7 + 0.25,
        ph: Math.random() * Math.PI * 2,
      }));

      // keep existing meteors valid after resize
      meteors.current = meteors.current.filter((m) => m.x > -200 && m.x < w + 200 && m.y > -200 && m.y < h + 200);
    };

    const spawnMeteor = () => {
      const { w, h } = sizeRef.current;

      // subtle, background, cinematic diagonal streak like reference
      // Spawn slightly off-screen so tail "enters"
      const fromLeft = Math.random() < 0.55;
      const startX = fromLeft ? -60 : w + 60;
      const startY = h * (0.10 + Math.random() * 0.55);

      // Angle: mostly left->right or right->left with slight downward drift
      const base = fromLeft ? Math.PI * 0.06 : Math.PI - Math.PI * 0.06; // ~10deg
      const jitter = (Math.random() - 0.5) * (Math.PI * 0.10); // +/- 9deg
      const ang = base + jitter + (Math.random() * 0.10); // tiny downward component

      const speed = 820 + Math.random() * 520; // px/sec
      const vx = Math.cos(ang) * speed;
      const vy = Math.sin(ang) * speed;

      const life = 0.95 + Math.random() * 0.60; // seconds
      const len = 260 + Math.random() * 260; // tail length px
      const head = 2.4 + Math.random() * 1.6; // head radius

      meteors.current.push({
        x: startX,
        y: startY,
        vx,
        vy,
        t: 0,
        life,
        len,
        head,
      });

      // hard cap for performance
      if (meteors.current.length > 3) meteors.current.shift();
    };

    const drawMeteor = (m) => {
      const p = clamp(m.t / m.life, 0, 1);

      // fade-in then fade-out (subtle)
      const fadeIn = clamp(p / 0.10, 0, 1);
      const fadeOut = clamp((1 - p) / 0.22, 0, 1);
      const alpha = Math.min(fadeIn, fadeOut);

      if (alpha <= 0.001) return;

      const dx = m.vx;
      const dy = m.vy;
      const mag = Math.hypot(dx, dy) || 1;
      const ux = dx / mag;
      const uy = dy / mag;

      const x2 = m.x;
      const y2 = m.y;
      const x1 = x2 - ux * m.len;
      const y1 = y2 - uy * m.len;

      // theme colors
      const headColor =
        theme === "dark"
          ? "rgba(255, 240, 200, 1)" // warm head
          : "rgba(255, 80, 80, 1)"; // vivid red head

      const glowColor =
        theme === "dark"
          ? "rgba(255, 170, 70, 1)" // orange glow
          : "rgba(210, 20, 20, 1)"; // deep red glow

      // Tail gradient (transparent -> glow near head)
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      if (theme === "dark") {
        grad.addColorStop(0, `rgba(255,200,120,0)`);
        grad.addColorStop(0.45, `rgba(255,180,90,${0.12 * alpha})`);
        grad.addColorStop(0.78, `rgba(255,190,110,${0.26 * alpha})`);
        grad.addColorStop(1, `rgba(255,230,190,${0.40 * alpha})`);
      } else {
        grad.addColorStop(0, `rgba(190,0,0,0)`);
        grad.addColorStop(0.45, `rgba(255,40,40,${0.12 * alpha})`);
        grad.addColorStop(0.78, `rgba(255,55,55,${0.26 * alpha})`);
        grad.addColorStop(1, `rgba(255,95,95,${0.42 * alpha})`);
      }

      // Draw tail (thin, long, smooth)
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = grad;
      ctx.lineWidth = theme === "dark" ? 1.65 : 1.85;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Soft glow around tail near head (very subtle)
      ctx.strokeStyle = theme === "dark" ? `rgba(255,170,70,${0.10 * alpha})` : `rgba(220,20,20,${0.10 * alpha})`;
      ctx.lineWidth = theme === "dark" ? 4.5 : 5.2;
      ctx.beginPath();
      ctx.moveTo(lerp(x1, x2, 0.55), lerp(y1, y2, 0.55));
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Head glow blob
      const r = m.head;
      const hg = ctx.createRadialGradient(x2, y2, 0, x2, y2, r * 10);
      hg.addColorStop(0, `${headColor.replace("1)", `${0.75 * alpha})`)}`);
      hg.addColorStop(0.35, `${glowColor.replace("1)", `${0.28 * alpha})`)}`);
      hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(x2, y2, r * 10, 0, Math.PI * 2);
      ctx.fill();

      // Bright head core
      ctx.fillStyle = theme === "dark" ? `rgba(255,255,255,${0.50 * alpha})` : `rgba(255,220,220,${0.46 * alpha})`;
      ctx.beginPath();
      ctx.arc(x2, y2, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const draw = (t) => {
      const { w, h } = sizeRef.current;

      const now = t;
      const dt = Math.min(40, now - lastT.current);
      lastT.current = now;

      ctx.clearRect(0, 0, w, h);

      // background vignette
      const starRGB = theme === "light" ? "0,0,0" : "255,255,255";
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 60, w * 0.5, h * 0.5, Math.max(w, h) * 0.95);

      if (theme === "light") {
        g.addColorStop(0, "rgba(0,0,0,0.02)");
        g.addColorStop(1, "rgba(255,255,255,0)");
      } else {
        g.addColorStop(0, "rgba(255,255,255,0.015)");
        g.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // stars
      for (const s of stars.current) {
        const tw = 0.6 + 0.4 * Math.sin((t / 1000) * s.tw + s.ph);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${starRGB},${s.a * tw})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Meteors (subtle + more frequent, but not annoying)
      // Frequency target: ~ every 3–6s depending on screen size; keep max 2–3 active.
      // Use an accumulator so it feels natural.
      const { w: ww, h: hh } = sizeRef.current;
      const area = ww * hh;
      const basePerSec = area < 450_000 ? 0.22 : area < 900_000 ? 0.18 : 0.14; // mobile a bit more frequent
      spawnAcc.current += (dt / 1000) * basePerSec;

      // Spawn with randomness (Poisson-ish)
      while (spawnAcc.current > 1.0) {
        spawnAcc.current -= 1.0;
        if (meteors.current.length < 2) spawnMeteor();
        else if (Math.random() < 0.35 && meteors.current.length < 3) spawnMeteor();
      }

      // Update + draw meteors
      const next = [];
      for (const m of meteors.current) {
        m.t += dt / 1000;
        m.x += (m.vx * dt) / 1000;
        m.y += (m.vy * dt) / 1000;

        // keep if alive and near screen
        const alive = m.t < m.life;
        const near = m.x > -400 && m.x < w + 400 && m.y > -400 && m.y < h + 400;
        if (alive && near) {
          drawMeteor(m);
          next.push(m);
        }
      }
      meteors.current = next;

      raf.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
    };
  }, [density, theme]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" />;
}

/* --------------------------------- Modal --------------------------------- */
function Modal({ open, onClose, title, children, theme = "dark", origin }) {
  const panel = theme === "light" ? "bg-white text-black border-black/10" : "bg-[#0a0a0c] text-white border-white/15";
  const headerBorder = theme === "light" ? "border-black/10" : "border-white/10";
  const closeBtn =
    theme === "light"
      ? "border-black/10 bg-black/[0.02] text-black/70 hover:bg-black/[0.06]"
      : "border-white/15 bg-white/[0.02] text-white/80 hover:bg-white/[0.06]";
  const overlay = theme === "light" ? "bg-black/28" : "bg-black/70";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ox = origin ? clamp((origin.x / window.innerWidth) * 100, 8, 92) : 50;
  const oy = origin ? clamp((origin.y / window.innerHeight) * 100, 8, 92) : 35;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className={cn("absolute inset-0 backdrop-blur", overlay)} onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              className={cn("w-[min(980px,92vw)] overflow-hidden rounded-3xl border shadow-[0_24px_110px_rgba(0,0,0,0.40)]", panel)}
              style={{ transformOrigin: `${ox}% ${oy}%` }}
              initial={{ y: 10, scale: 0.96, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 8, scale: 0.97, opacity: 0, filter: "blur(3px)" }}
              transition={{ type: "spring", stiffness: 360, damping: 26, mass: 0.9 }}
            >
              <div className={cn("flex items-center justify-between border-b px-5 py-4", headerBorder)}>
                <div className={cn("text-sm font-semibold", theme === "light" ? "text-black" : "text-white")}>{title}</div>
                <button onClick={onClose} className={cn("rounded-full border p-2 transition", closeBtn)} aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className={cn("max-h-[78svh] overflow-y-auto p-5 text-sm leading-6", theme === "light" ? "text-black/80" : "text-white/75")}>
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------- Layout (dense, premium) ------------------------- */
function premiumSphereLayout(items, { isMobile }) {
  const n = items.length;
  if (!n) return new Map();

  // ✅ FIX for mobile “vertical line” artifact:
  // Use a golden-angle (Fibonacci) sphere distribution on mobile.
  // Desktop layout remains exactly as before.
  if (isMobile) {
    const out = new Map();
    const golden = Math.PI * (3 - Math.sqrt(5)); // ~2.399963
    for (let i = 0; i < n; i++) {
      const it = items[i];

      // y in [-1,1]
      const t = (i + 0.5) / n;
      const y = 1 - 2 * t;

      // lat in radians
      let lat = Math.asin(clamp(y, -1, 1));

      // lon distributes around
      let lon = (i * golden) % (Math.PI * 2);

      // small deterministic jitter to avoid perfect "bands"
      const seed = hashCode(it.id) % 1000;
      const jl = (seed / 1000 - 0.5) * 0.060;
      const jt = ((hashCode(it.id + "t") % 1000) / 1000 - 0.5) * 0.030;

      lon += jl;
      lat += jt;

      // clamp slightly away from exact poles
      lat = clamp(lat, -1.50, 1.50);

      out.set(it.id, { lon, lat });
    }
    return out;
  }

  // Desktop (unchanged)
  const bands = 8;
  const latMin = -1.30;
  const latMax = 1.30;

  const lats = [];
  for (let i = 0; i < bands; i++) {
    const t = bands === 1 ? 0.5 : i / (bands - 1);
    lats.push(lerp(latMax, latMin, t));
  }

  const weights = lats.map((lat) => Math.max(0.22, Math.cos(lat)));
  const wSum = weights.reduce((a, b) => a + b, 0);

  let counts = weights.map((w) => Math.max(3, Math.round((w / wSum) * n)));
  let diff = n - counts.reduce((a, b) => a + b, 0);

  while (diff !== 0) {
    if (diff > 0) {
      const idx = counts.indexOf(Math.max(...counts));
      counts[idx] += 1;
      diff -= 1;
    } else {
      const idx = counts.indexOf(Math.max(...counts));
      if (counts[idx] > 3) {
        counts[idx] -= 1;
        diff += 1;
      } else {
        const j = counts.findIndex((c) => c > 3);
        if (j === -1) break;
        counts[j] -= 1;
        diff += 1;
      }
    }
  }

  const out = new Map();
  let k = 0;

  for (let bi = 0; bi < bands; bi++) {
    const lat = lats[bi];
    const m = counts[bi];
    const phase = (bi * 0.92) % (Math.PI * 2);

    for (let j = 0; j < m; j++) {
      if (k >= n) break;
      const it = items[k++];

      const u = j / m;
      let lon = u * Math.PI * 2 + phase;

      const seed = hashCode(it.id) % 1000;
      const jl = (seed / 1000 - 0.5) * 0.035;
      const jt = ((hashCode(it.id + "t") % 1000) / 1000 - 0.5) * 0.020;

      out.set(it.id, { lon: lon + jl, lat: lat + jt });
    }
  }

  return out;
}

/* --------------------------------- Globe --------------------------------- */
function Globe({ items, onSelect, theme = "dark", isMobile }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  const BASE_X = -7;
  const rot = useRef({ x: BASE_X, y: 18 });

  // Mobile: calmer idle rotation
  const vel = useRef({ y: isMobile ? 0.070 : 0.095 });

  const drag = useRef({ active: false, lx: 0, pointerType: "mouse" });
  const lastInteract = useRef(0);

  const [R, setR] = useState(420);
  const [wrapSize, setWrapSize] = useState(960);
  const [cardScale, setCardScale] = useState(1);

  const cardNodesRef = useRef([]);
  const frameRef = useRef(0);

  const tapRef = useRef({ downX: 0, downY: 0, moved: false, t: 0 });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const safeTop = w < 640 ? 118 : 92;
      const safeBottom = w < 640 ? 100 : 104;

      const usableH = Math.max(220, h - safeTop - safeBottom);
      const usable = Math.max(220, Math.min(w, usableH));

      // ✅ Mobile globe slightly smaller (desktop untouched)
      const maxSize = isMobile ? 500 : 920;
      const minSize = isMobile ? 240 : 330;
      const ws = clamp(Math.floor(usable * (isMobile ? 0.78 : 0.86)), minSize, maxSize);
      setWrapSize(ws);

      // ✅ Mobile tighter radius = more visible cards
      const radiusFactor = isMobile ? 0.50 : 0.60;
      const r = clamp(Math.floor(ws * radiusFactor), isMobile ? 145 : 230, isMobile ? 295 : 600);
      setR(r);

      // ✅ Mobile cards slightly smaller for density (still readable)
      const cs = isMobile ? clamp(usable / 1280, 0.52, 0.76) : clamp(usable / 1650, 0.66, 0.92);
      setCardScale(cs);
    };

    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [isMobile]);

  // Desktop untouched
  const cardW = isMobile ? clamp(66 * cardScale, 52, 86) : clamp(132 * cardScale, 104, 168);
  const cardH = isMobile ? cardW : clamp(98 * cardScale, 84, 122);

  const pointsById = useMemo(() => premiumSphereLayout(items, { isMobile }), [items, isMobile]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    cardNodesRef.current = Array.from(el.querySelectorAll("[data-card='1']"));
  }, [items.length]);

  useEffect(() => {
    let raf = 0;

    const updateDepth = () => {
      const nodes = cardNodesRef.current;
      if (!nodes || nodes.length === 0) return;

      const ry = (rot.current.y * Math.PI) / 180;
      const rx = (BASE_X * Math.PI) / 180;

      const sinY = Math.sin(ry),
        cosY = Math.cos(ry);
      const sinX = Math.sin(rx),
        cosX = Math.cos(rx);

      frameRef.current = (frameRef.current + 1) % 2;
      const doFull = frameRef.current === 0;

      for (const node of nodes) {
        const lon = parseFloat(node.dataset.lon || "0");
        const lat = parseFloat(node.dataset.lat || "0");

        const x = Math.sin(lon) * Math.cos(lat);
        const y = Math.sin(lat);
        const z = Math.cos(lon) * Math.cos(lat);

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const depth01 = clamp((z2 + 1) / 2, 0, 1);
        node.style.zIndex = String(100 + Math.round(depth01 * 900));

        if (doFull) {
          const farDim = theme === "light" ? 0.93 : 0.90;
          node.style.opacity = String(lerp(farDim, 1, depth01));
          const s = lerp(0.992, 1.035, depth01);
          node.style.setProperty("--depthScale", String(s));
        }
      }
    };

    const loop = () => {
      updateDepth();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(34, now - last);
      last = now;

      const idle = !drag.current.active && now - lastInteract.current > 240;

      if (idle) {
        const target = isMobile ? 0.070 : 0.095;
        vel.current.y = lerp(vel.current.y, target, isMobile ? 0.030 : 0.018);
      } else {
        vel.current.y = lerp(vel.current.y, 0.0, isMobile ? 0.075 : 0.060);
      }

      rot.current.x = BASE_X;
      rot.current.y += vel.current.y * (dt / 16);

      if (innerRef.current) innerRef.current.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onDown = (e) => {
      if (e.target?.closest?.("button[data-card='1']")) return;
      drag.current.active = true;
      drag.current.pointerType = e.pointerType || "mouse";
      lastInteract.current = performance.now();
      drag.current.lx = e.clientX;
      el.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e) => {
      if (!drag.current.active) return;
      lastInteract.current = performance.now();
      const dx = e.clientX - drag.current.lx;
      drag.current.lx = e.clientX;

      const isTouch = drag.current.pointerType === "touch";
      rot.current.y += dx * (isTouch ? 0.25 : 0.16);
      vel.current.y = dx * (isTouch ? 0.090 : 0.065);
    };

    const onUp = () => {
      drag.current.active = false;
      lastInteract.current = performance.now();
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const norm = (e) => {
      const mode = e.deltaMode;
      const mul = mode === 1 ? 16 : mode === 2 ? window.innerHeight : 1;
      return { dx: e.deltaX * mul, dy: e.deltaY * mul };
    };

    const onWheel = (e) => {
      e.preventDefault();
      lastInteract.current = performance.now();
      const { dx, dy } = norm(e);
      const primary = Math.abs(dx) > Math.abs(dy) ? dx : dx + dy * 0.55;
      const s = isMobile ? 0.0028 : 0.0030;
      vel.current.y += primary * s;
      rot.current.y += primary * (isMobile ? 0.008 : 0.007);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isMobile]);

  const specular =
    theme === "light"
      ? "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(255,255,255,0) 46%), linear-gradient(315deg, rgba(0,0,0,0.05), rgba(255,255,255,0) 58%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0) 48%), linear-gradient(315deg, rgba(255,210,140,0.03), rgba(0,0,0,0) 58%)";

  return (
    <div className="relative z-10 flex h-[100svh] w-full items-center justify-center">
      <motion.div
        ref={wrapRef}
        className="relative select-none"
        style={{
          width: wrapSize,
          height: wrapSize,
          perspective: isMobile ? "1060px" : "1550px",
          transform: "translateZ(0)",
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.70, y: 26, z: -80 }}
        animate={{ opacity: 1, scale: 1, y: 0, z: 0 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: specular, opacity: theme === "light" ? 0.16 : 0.20 }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: theme === "light" ? 0.16 : 0.20, scale: 1 }}
          transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          <div ref={innerRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {items.map((it) => {
              const p = pointsById.get(it.id) || { lon: 0, lat: 0 };

              const facing = Math.cos(p.lon) * Math.cos(p.lat);
              const facing01 = clamp((facing + 1) / 2, 0, 1);

              const zBoost = facing * (isMobile ? 9 : 14);
              const place = `rotateY(${(p.lon * 180) / Math.PI}deg) rotateX(${(-p.lat * 180) / Math.PI}deg) translateZ(${R + zBoost}px)`;

              const pal = it.palette ?? pickPalette(it.company || it.title || it.id);

              // ✅ PREMIUM COLOR (RGBA)
              const aHot = theme === "dark" ? rgba(pal.a, 0.62) : rgba(pal.a, 0.48);
              const bHot = theme === "dark" ? rgba(pal.b, 0.54) : rgba(pal.b, 0.40);
              const rimA = theme === "dark" ? rgba(pal.a, 0.20) : rgba(pal.a, 0.18);
              const rimB = theme === "dark" ? rgba(pal.b, 0.18) : rgba(pal.b, 0.16);

              const glow =
                theme === "dark"
                  ? `0 0 0 1px rgba(255,255,255,0.10),
                     0 18px 70px rgba(0,0,0,0.55),
                     0 0 44px ${rgba(pal.a, 0.18)}`
                  : `0 0 0 1px rgba(0,0,0,0.14),
                     0 14px 60px rgba(0,0,0,0.12),
                     0 0 26px ${rgba(pal.a, 0.12)}`;

              const cardBorder = theme === "light" ? "border-black/15" : "border-white/14";
              const primary = it.type === "skill" ? it.title : it.company || it.title;
              const secondary = it.type === "skill" ? (it.company || "") : (it.title || "");
              const badge = (it.logoText || initials(primary)).slice(0, 3).toUpperCase();

              return (
                <button
                  key={it.id}
                  data-card="1"
                  data-lon={String(p.lon)}
                  data-lat={String(p.lat)}
                  className="globe-card group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 outline-none"
                  style={{
                    width: cardW,
                    height: cardH,
                    transformStyle: "preserve-3d",
                    transform: place,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    tapRef.current.downX = e.clientX;
                    tapRef.current.downY = e.clientY;
                    tapRef.current.moved = false;
                    tapRef.current.t = performance.now();
                  }}
                  onPointerMove={(e) => {
                    const dx = Math.abs(e.clientX - tapRef.current.downX);
                    const dy = Math.abs(e.clientY - tapRef.current.downY);
                    if (dx > 7 || dy > 7) tapRef.current.moved = true;
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    const dt = performance.now() - tapRef.current.t;
                    if (!tapRef.current.moved && dt < 900) onSelect(it, { x: e.clientX, y: e.clientY });
                  }}
                >
                  <motion.div
                    className="relative h-full w-full"
                    style={{ transform: "scale(var(--depthScale, 1))", transition: "transform 120ms ease" }}
                    whileHover={!isMobile ? { scale: 1.06, y: -2 } : undefined}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <div className={cn("relative h-full w-full overflow-hidden rounded-2xl border", cardBorder)} style={{ boxShadow: glow }}>
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            theme === "dark"
                              ? `
                                radial-gradient(circle at 18% 16%, ${aHot}, rgba(0,0,0,0) 60%),
                                radial-gradient(circle at 88% 86%, ${bHot}, rgba(0,0,0,0) 62%),
                                linear-gradient(135deg, rgba(255,255,255,0.18), rgba(0,0,0,0) 70%)
                              `
                              : `
                                radial-gradient(circle at 18% 16%, ${aHot}, rgba(255,255,255,0) 60%),
                                radial-gradient(circle at 88% 86%, ${bHot}, rgba(255,255,255,0) 64%),
                                radial-gradient(circle at 50% 120%, rgba(0,0,0,0.18), rgba(0,0,0,0) 58%),
                                linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.70))
                              `,
                        }}
                      />

                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${rimA}, rgba(255,255,255,0) 45%, ${rimB})`,
                          opacity: 0.95,
                        }}
                      />

                      <div className="absolute inset-0 backdrop-blur-[10px]" style={{ opacity: theme === "dark" ? 0.28 : 0.34 }} />

                      {isMobile ? (
                        <div className="relative flex h-full flex-col items-center justify-center gap-2 p-2">
                          <div
                            className={cn(
                              "grid place-items-center rounded-2xl border font-extrabold tracking-wide",
                              theme === "light" ? "border-black/15 bg-black/[0.07] text-black/92" : "border-white/14 bg-black/35 text-white/92"
                            )}
                            style={{ width: 34, height: 34, fontSize: 11.25 }}
                          >
                            {badge}
                          </div>
                          <div
                            className={cn("w-full text-center font-semibold", theme === "light" ? "text-black/92" : "text-white/92")}
                            style={{ fontSize: 10.4, lineHeight: "12px", maxHeight: "26px", overflow: "hidden" }}
                          >
                            {primary}
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex h-full flex-col justify-between p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <div
                                className={cn(
                                  "grid place-items-center rounded-xl border font-extrabold shrink-0",
                                  theme === "light" ? "border-black/15 bg-black/[0.07] text-black/92" : "border-white/14 bg-black/35 text-white/90"
                                )}
                                style={{ width: 34, height: 34, fontSize: 12 }}
                              >
                                {badge}
                              </div>
                              <div className="min-w-0 text-left">
                                <div className={cn("text-[12px] font-semibold leading-4", theme === "light" ? "text-black/92" : "text-white/92")}>
                                  {primary}
                                </div>
                                {secondary ? (
                                  <div className={cn("mt-1 line-clamp-1 text-[11px]", theme === "light" ? "text-black/70" : "text-white/62")}>
                                    {secondary}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <ArrowUpRight className={cn("h-4 w-4 shrink-0 opacity-70 transition group-hover:opacity-100", theme === "light" ? "text-black/70" : "text-white/75")} />
                          </div>

                          <div className={cn("mt-2 text-[11px]", theme === "light" ? "text-black/65" : "text-white/58")}>
                            {it.meta ? <span className="line-clamp-1">{it.meta}</span> : <span>&nbsp;</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {facing01 > 0.78 ? <div className="pointer-events-none absolute inset-0 rounded-2xl card-front-glow" /> : null}
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------------------------- HUD ---------------------------------- */
function Hud({ theme, onToggleTheme, onBrowse, onReset, onContact, onAbout, onHome, nameText, showBrowseHint }) {
  const btnBase = "rounded-full border transition relative";
  const btnDark = "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]";
  const btnLight = "border-black/10 bg-black/[0.03] text-black/75 hover:bg-black/[0.06]";
  const btn = theme === "light" ? btnLight : btnDark;

  return (
    <div className="fixed inset-x-0 top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button onClick={onHome} className="flex items-center gap-3 text-left" title="Home">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-extrabold tracking-wide shrink-0",
                theme === "light" ? "border-black/10 bg-black/[0.04] text-black/80" : "border-white/12 bg-white/[0.06] text-white/90"
              )}
            >
              SG
            </div>
            <div className="min-w-0">
              <div className={cn("truncate text-sm font-semibold", theme === "light" ? "text-black" : "text-white")}>{nameText}</div>
              <div className={cn("truncate text-xs", theme === "light" ? "text-black/55" : "text-white/55")}>DevOps Engineer • Dublin, Ireland</div>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button onClick={onAbout} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")}>
              About
            </button>

            <button onClick={onToggleTheme} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")}>
              <span className="inline-flex items-center gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            <motion.button
              onClick={onBrowse}
              className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold", showBrowseHint ? "hint-glow hint-sparkle" : "")}
              aria-label="Browse"
              title="Browse"
              animate={showBrowseHint ? { y: [0, -2, 0] } : { y: 0 }}
              transition={showBrowseHint ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
            >
              <span className="inline-flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Browse
              </span>
            </motion.button>

            <button onClick={onReset} className={cn(btnBase, btn, "p-2")} aria-label="Reset" title="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>

            <button onClick={onContact} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")}>
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Browse View ------------------------------ */
function BrowseView({ open, onClose, mode, setMode, cards, onPick, theme }) {
  const pillBase = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition";
  const active = theme === "light" ? "border-black/10 bg-black text-white" : "border-white/15 bg-white text-black";
  const idle =
    theme === "light"
      ? "border-black/10 bg-black/[0.03] text-black/70 hover:bg-black/[0.06]"
      : "border-white/12 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]";
  const wrap = "mt-4 max-h-[64svh] overflow-y-auto pr-1";

  return (
    <Modal open={open} onClose={onClose} title={mode === "grid" ? "Browse (Grid)" : "Browse (List)"} theme={theme}>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setMode("grid")} className={cn(pillBase, mode === "grid" ? active : idle)}>
          <LayoutGrid className="h-4 w-4" /> Grid
        </button>
        <button onClick={() => setMode("list")} className={cn(pillBase, mode === "list" ? active : idle)}>
          <ListIcon className="h-4 w-4" /> List
        </button>
      </div>

      {mode === "grid" ? (
        <div className={wrap}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((c) => {
              const pal = c.palette ?? pickPalette(c.company || c.title || c.id);
              const a = theme === "dark" ? rgba(pal.a, 0.20) : rgba(pal.a, 0.18);
              const b = theme === "dark" ? rgba(pal.b, 0.16) : rgba(pal.b, 0.14);

              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className={cn(
                    "browse-card group relative overflow-hidden rounded-2xl border p-3 text-left transition",
                    theme === "light"
                      ? "border-black/12 bg-black/[0.03] hover:bg-black/[0.06] hover:shadow-[0_16px_60px_rgba(0,0,0,0.12)]"
                      : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-[0_18px_70px_rgba(0,0,0,0.45)]"
                  )}
                  style={{
                    background: `radial-gradient(circle at 24% 20%, ${a}, rgba(255,255,255,0.10) 30%, rgba(0,0,0,0) 62%),
                                 linear-gradient(135deg, ${a}, ${b} 55%, rgba(0,0,0,0))`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl border text-xs font-extrabold",
                          theme === "light" ? "border-black/12 bg-white/85 text-black/80" : "border-white/12 bg-black/30 text-white/85"
                        )}
                      >
                        {c.logoText ? c.logoText : initials(c.company || c.title)}
                      </div>
                      <div className="min-w-0">
                        <div className={cn("truncate text-xs font-semibold", theme === "light" ? "text-black/85" : "text-white/85")}>
                          {c.company || c.title}
                        </div>
                        <div className={cn("mt-0.5 line-clamp-1 text-[12px]", theme === "light" ? "text-black/60" : "text-white/60")}>{c.title}</div>
                      </div>
                    </div>
                    <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition", theme === "light" ? "text-black/55 group-hover:text-black/80" : "text-white/55 group-hover:text-white/80")} />
                  </div>

                  {c.meta && <div className={cn("mt-2 line-clamp-2 text-[12px] leading-4", theme === "light" ? "text-black/60" : "text-white/60")}>{c.meta}</div>}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={wrap}>
          <div className="grid gap-2">
            {cards.map((c) => {
              const pal = c.palette ?? pickPalette(c.company || c.title || c.id);
              const a = theme === "dark" ? rgba(pal.a, 0.16) : rgba(pal.a, 0.14);
              const b = theme === "dark" ? rgba(pal.b, 0.14) : rgba(pal.b, 0.12);

              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className={cn(
                    "browse-card group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    theme === "light"
                      ? "border-black/12 bg-black/[0.03] hover:bg-black/[0.06] hover:shadow-[0_16px_60px_rgba(0,0,0,0.10)]"
                      : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-[0_18px_70px_rgba(0,0,0,0.45)]"
                  )}
                  style={{
                    background: `radial-gradient(circle at 22% 20%, ${a}, rgba(255,255,255,0.08) 32%, rgba(0,0,0,0) 62%),
                                 linear-gradient(135deg, ${a}, ${b} 55%, rgba(0,0,0,0))`,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl border text-xs font-extrabold",
                        theme === "light" ? "border-black/12 bg-white/85 text-black/80" : "border-white/12 bg-black/30 text-white/85"
                      )}
                    >
                      {c.logoText ? c.logoText : initials(c.company || c.title)}
                    </div>
                    <div className="min-w-0">
                      <div className={cn("truncate text-sm font-semibold", theme === "light" ? "text-black/90" : "text-white/90")}>{c.title}</div>
                      <div className={cn("truncate text-xs", theme === "light" ? "text-black/60" : "text-white/55")}>{c.company || c.meta || ""}</div>
                    </div>
                  </div>
                  <ArrowUpRight className={cn("h-4 w-4 transition", theme === "light" ? "text-black/55 group-hover:text-black/80" : "text-white/55 group-hover:text-white/80")} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

/* --------------------------- Popup resolver -------------------------- */
function resolvePopupData(sel, data) {
  if (!sel) return null;
  const keyId = sel.baseId || sel.id;

  if (sel.type === "experience") {
    const exp = data.experiences.find((e) => e.id === keyId || e.id === sel.id);
    const relatedSkills = (exp?.relatedSkillIds || []).map((id) => data.skills[id]).filter(Boolean);
    return { kind: "experience", exp, relatedSkills, principles: data.principles };
  }

  if (sel.type === "skill") {
    const sid = sel.skillId || String(keyId).replace(/^skill-/, "");
    const skill = data.skills[sid];
    const usedIn = data.experiences
      .filter((e) => (e.relatedSkillIds || []).includes(sid))
      .map((e) => ({ id: e.id, company: e.company, role: e.title, period: e.period, meta: e.meta }));
    return { kind: "skill", skill, usedIn, principles: data.principles };
  }

  if (sel.type === "education") {
    const edu = data.education.find((e) => e.id === keyId || e.id === sel.id);
    const relatedSkills = (edu?.relatedSkillIds || []).map((id) => data.skills[id]).filter(Boolean);
    return { kind: "education", edu, relatedSkills, principles: data.principles };
  }

  if (sel.type === "link") {
    return { kind: "link", title: sel.title, company: sel.company, url: sel.url, meta: sel.meta, principles: data.principles };
  }

  return null;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    return prefersLight ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
      const small = w < 720 || h < 560;
      setIsMobile(Boolean(coarse || small));
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState("grid");
  const [contactOpen, setContactOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [modalOrigin, setModalOrigin] = useState(null);

  const [nameAnimKey, setNameAnimKey] = useState(1);
  const nameText = useBinaryReveal("Srinivasarao Galla", nameAnimKey, { durationMs: 1250, settleMs: 160 });

  // ✅ Browse hint state
  const [hasUsedBrowse, setHasUsedBrowse] = useState(() => localStorage.getItem("usedBrowse") === "1");
  const showBrowseHint = !hasUsedBrowse;

  // ✅ Sparkle flashes exactly 5 times (CSS handles 5 iterations). Once user clicks Browse, it never shows again.
  const openBrowse = () => {
    setBrowseOpen(true);
    if (!hasUsedBrowse) {
      setHasUsedBrowse(true);
      localStorage.setItem("usedBrowse", "1");
    }
  };

  const data = useMemo(() => {
    const skills = {
      aws: {
        id: "aws",
        title: "AWS",
        subtitle: "EC2 • S3 • IAM • VPC",
        desc: "Secure, cost-aware cloud foundations with clear ownership and guardrails.",
        bullets: ["IAM least privilege", "Networking/VPC", "Compute + storage patterns", "Operational hygiene"],
        examples: ["Set up secure VPC + IAM boundaries", "Hardened EC2 patterns and access", "S3 policies + lifecycle + cost controls"],
      },
      jenkins: {
        id: "jenkins",
        title: "Jenkins",
        subtitle: "CI/CD Pipelines",
        desc: "Build → test → deploy automation so releases become boring (in the best way).",
        bullets: ["Pipelines", "Automation", "Release confidence"],
        examples: ["Branch + PR workflows", "Artifacts + versioning", "Rollback-friendly deployments"],
      },
      docker: {
        id: "docker",
        title: "Docker",
        subtitle: "Containers",
        desc: "Environment parity across dev/stage/prod with fast iteration and predictable builds.",
        bullets: ["Images", "Best practices", "Parity"],
        examples: ["Slim images, caching, multi-stage builds", "Dev/prod parity and reproducible builds"],
      },
      kubernetes: {
        id: "kubernetes",
        title: "Kubernetes",
        subtitle: "Deploy • Scale",
        desc: "Scalable deployments with safe rollouts, health checks, and rollback discipline.",
        bullets: ["Deployments", "Services", "Helm"],
        examples: ["Safe rollouts, probes, HPA", "Config/secrets hygiene", "Cluster operations mindset"],
      },
      terraform: {
        id: "terraform",
        title: "Terraform",
        subtitle: "Infrastructure as Code",
        desc: "Repeatable, auditable provisioning with modules and state control.",
        bullets: ["Modules", "State", "Reusable infra"],
        examples: ["Reusable modules", "State strategy + drift awareness", "Infra changes through PRs"],
      },
      prometheus: {
        id: "prometheus",
        title: "Prometheus",
        subtitle: "Metrics + Alerting",
        desc: "Signals and alerting tuned to reduce noise and improve response.",
        bullets: ["Metrics", "Alerting", "SLIs/SLOs"],
        examples: ["Actionable alert rules", "SLO-minded dashboards", "Reduce alert fatigue"],
      },
      grafana: {
        id: "grafana",
        title: "Grafana",
        subtitle: "Dashboards",
        desc: "Dashboards teams actually use during incidents and reviews.",
        bullets: ["Dashboards", "Panels", "Ops visibility"],
        examples: ["Golden signals + drilldowns", "Incident-ready boards", "Runbook links"],
      },
      git: {
        id: "git",
        title: "Git + GitHub",
        subtitle: "Collaboration",
        desc: "PR-based workflows with reviews, versioning, and clean releases.",
        bullets: ["PRs", "Reviews", "Branching"],
        examples: ["Clean branching + reviews", "Release tagging + traceability"],
      },
      collaboration: {
        id: "collaboration",
        title: "Cross-team Collaboration",
        subtitle: "Dev • Ops • Product",
        desc: "Align infra decisions with business goals and delivery timelines.",
        bullets: ["Stakeholders", "Delivery", "Execution"],
        examples: ["Translate requirements into reliable delivery", "Communicate risk + tradeoffs clearly"],
      },
      tooling: {
        id: "tooling",
        title: "Tooling",
        subtitle: "Linux • Bash • APIs",
        desc: "Practical systems fundamentals + automation to remove repetition.",
        bullets: ["Linux", "Bash", "REST APIs"],
        examples: ["Automate repetitive ops tasks", "Improve day-2 operations"],
      },
      pm: {
        id: "pm",
        title: "Project Coordination",
        subtitle: "Monday.com • Trello",
        desc: "Strong planning and communication for shipping consistently.",
        bullets: ["Planning", "Timelines", "Stakeholders"],
        examples: ["Clear milestones + ownership", "Delivery rhythm + status clarity"],
      },
    };

    const experiences = [
      {
        id: "exp-fullscale",
        type: "experience",
        title: "DevOps Engineer",
        company: "FullScale.ie",
        location: "Dublin, Ireland",
        period: "Jun 2023 – Present",
        meta: "AWS • Jenkins • Docker • Kubernetes • Terraform • Prometheus/Grafana",
        responsibilities: [
          "Built and maintained CI/CD pipelines (Jenkins) for automated build, test and deployments.",
          "Containerised services with Docker and managed Kubernetes deployments for scalable delivery.",
          "Implemented Infrastructure as Code using Terraform (repeatable provisioning, auditability).",
          "Operationalised monitoring with Prometheus + Grafana (dashboards + actionable alerts).",
          "Managed AWS infra (EC2, S3, IAM, VPC) with security-first practices.",
          "Partnered with dev + product teams to reduce friction and ship reliably.",
        ],
        relatedSkillIds: ["aws", "jenkins", "docker", "kubernetes", "terraform", "prometheus", "grafana", "git", "collaboration"],
        details: "Reliable deployments + scalable operations for a cloud marketplace.",
      },
      {
        id: "exp-chillcart",
        type: "experience",
        title: "Project Co-Ordinator",
        company: "Chillcart Ltd.",
        location: "Dublin, Ireland",
        period: "Jun 2018 – Jun 2023",
        meta: "Delivery • Coordination",
        responsibilities: [
          "Coordinated daily project delivery across partners and internal teams.",
          "Owned planning, scheduling, and risk tracking for feature releases.",
          "Managed delivery operations with Monday.com, Trello and Google Workspace.",
        ],
        relatedSkillIds: ["pm", "collaboration"],
        details: "Kept delivery predictable across platform lifecycle.",
      },
      {
        id: "exp-lyca-ire",
        type: "experience",
        title: "Product & Business Development Manager",
        company: "LycaTel (Ireland) Ltd.",
        location: "Dublin, Ireland",
        period: "May 2014 – Jun 2018",
        meta: "Product • Growth",
        responsibilities: [
          "Launched and established presence in the Irish market.",
          "Closed enterprise deals and shaped offers for profitability + growth.",
          "Supported field testing and resolution of live issues with operators.",
        ],
        relatedSkillIds: ["collaboration"],
        details: "Connected business goals with execution under real constraints.",
      },
      {
        id: "exp-lyca-uk",
        type: "experience",
        title: "Business Development Manager",
        company: "LycaTel Distribution UK Ltd.",
        location: "London, UK",
        period: "May 2012 – May 2014",
        meta: "Sales • Strategy",
        responsibilities: ["Expanded product reach and revenue across territories.", "Implemented sales & marketing strategies and improved pipeline tracking."],
        relatedSkillIds: ["collaboration"],
        details: "Partnership growth with strong execution.",
      },
    ];

    const education = [
      { id: "edu-mba", type: "education", title: "MBA in Marketing", school: "University of Wales Trinity Saint David", location: "London, UK", period: "2010 – 2011", details: "Master of Business Administration in Marketing.", relatedSkillIds: ["collaboration", "pm"] },
      { id: "edu-bsc", type: "education", title: "B.Sc (Maths, Physics, Chemistry)", school: "Gowtham Degree College (A.N. University)", location: "Vijayawada, India", period: "2004–2005, 2007–2009", details: "Analytical and problem-solving foundation.", relatedSkillIds: ["tooling"] },
      { id: "edu-ded", type: "education", title: "Diploma in Education (D.Ed)", school: "D.I.E.T, Krishna District", location: "India", period: "2005 – 2007", details: "Structured learning + communication.", relatedSkillIds: ["collaboration"] },
    ];

    const principles = ["Automate the boring parts.", "Prefer repeatability over heroics.", "Observability is a feature.", "Ship small changes, often."];

    const baseCards = [
      ...experiences.map((e) => ({
        id: e.id,
        baseId: e.id,
        type: "experience",
        title: e.title,
        company: e.company,
        logoText: initials(e.company),
        meta: e.meta,
        palette: pickPalette(e.company),
      })),
      ...Object.values(skills).map((s) => ({
        id: `skill-${s.id}`,
        baseId: `skill-${s.id}`,
        type: "skill",
        title: s.title,
        company: s.subtitle,
        logoText: initials(s.title),
        meta: s.desc,
        palette: pickPalette(s.title),
        skillId: s.id,
      })),
      ...education.map((e) => ({
        id: e.id,
        baseId: e.id,
        type: "education",
        title: e.title,
        company: e.school,
        logoText: initials(e.school),
        meta: e.period,
        palette: pickPalette(e.school),
      })),
    ];

    // ✅ Mobile: more items before cap (denser globe)
    const loops = isMobile ? 4 : 3;
    const expanded = [];
    for (let i = 0; i < loops; i++) for (let j = 0; j < baseCards.length; j++) expanded.push({ ...baseCards[j], id: `${baseCards[j].id}-${i}` });

    const socials = [
      { id: "social-linkedin", baseId: "social-linkedin", type: "link", title: "LinkedIn", company: "Connect", logoText: "in", meta: "Open my LinkedIn profile", palette: pickPalette("LinkedIn"), url: "https://www.linkedin.com/in/sgalla/" },
      { id: "social-github", baseId: "social-github", type: "link", title: "GitHub", company: "Projects", logoText: "GH", meta: "Open my GitHub repositories", palette: pickPalette("GitHub"), url: "https://github.com/srinugalla/srinugalla" },
      { id: "social-email", baseId: "social-email", type: "link", title: "Email", company: "srinu.galla@gmail.com", logoText: "@", meta: "Send me an email", palette: pickPalette("Email"), url: "mailto:srinu.galla@gmail.com" },
    ];

    // ✅ Mobile: allow more icons (still controlled, not chaotic)
    const maxGlobeItems = isMobile ? 64 : 52;
    const items = [...expanded.slice(0, maxGlobeItems), ...socials];

    return { items, experiences, education, skills, principles };
  }, [isMobile]);

  const browseCards = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const c of data.items) {
      const key = c.baseId || c.id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...c, id: key });
    }
    return out;
  }, [data.items]);

  const rootBg = theme === "light" ? "bg-[#f5f7fb] text-black" : "bg-black text-white";

  const reset = () => {
    setSelected(null);
    setContactOpen(false);
    setBrowseOpen(false);
    setAboutOpen(false);
    setModalOrigin(null);
  };

  const DetailsModal = () => {
    const d = resolvePopupData(selected, data);
    if (!d) return null;

    const sectionBase = theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]";
    const label = theme === "light" ? "text-black/55" : "text-white/55";
    const text = theme === "light" ? "text-black/90" : "text-white/90";
    const subtle = theme === "light" ? "text-black/65" : "text-white/70";

    const Section = ({ title, icon: Icon, children }) => (
      <div className={cn("rounded-2xl border p-4", sectionBase)}>
        <div className="flex items-center justify-between">
          <div className={cn("text-xs font-semibold tracking-widest", label)}>{title}</div>
          {Icon ? <Icon className={cn("h-4 w-4", theme === "light" ? "text-black/45" : "text-white/45")} /> : null}
        </div>
        <div className="mt-3">{children}</div>
      </div>
    );

    const Pill = ({ children }) => (
      <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", theme === "light" ? "border-black/10 bg-white/75 text-black/75" : "border-white/12 bg-black/30 text-white/75")}>
        {children}
      </span>
    );

    const SkillPills = ({ list }) => (
      <div className="flex flex-wrap gap-2">
        {list.map((s) => (
          <Pill key={s.id}>
            {s.title}
            {s.subtitle ? <span className={cn("ml-2", theme === "light" ? "text-black/50" : "text-white/50")}>• {s.subtitle}</span> : null}
          </Pill>
        ))}
      </div>
    );

    if (d.kind === "link") {
      const Icon = d.title === "GitHub" ? Github : d.title === "LinkedIn" ? Linkedin : Mail;
      return (
        <div className="space-y-4">
          <Section title="CONNECT" icon={Zap}>
            <div className={cn("flex items-center gap-2 text-base font-semibold", text)}>
              <Icon className="h-5 w-5" /> {d.title}
            </div>
            {d.company && <div className={cn("mt-1 text-sm", subtle)}>{d.company}</div>}
            {d.meta && <div className={cn("mt-2 text-sm", subtle)}>{d.meta}</div>}
            <a
              href={d.url}
              target={d.url?.startsWith("http") ? "_blank" : undefined}
              rel={d.url?.startsWith("http") ? "noreferrer" : undefined}
              className={cn("mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold", theme === "light" ? "bg-black text-white" : "bg-white text-black")}
            >
              Open <ArrowUpRight className="h-4 w-4" />
            </a>
          </Section>

          <Section title="WORKING STYLE" icon={BadgeCheck}>
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
          </Section>
        </div>
      );
    }

    if (d.kind === "experience") {
      const exp = d.exp;
      if (!exp) return null;

      return (
        <div className="space-y-4">
          <Section title="ROLE" icon={ServerCog}>
            <div className={cn("text-base font-semibold", text)}>{exp.title}</div>
            <div className={cn("mt-1 text-sm", subtle)}>
              {exp.company} • {exp.location}
            </div>
            <div className={cn("mt-1 text-xs", label)}>{exp.period}</div>

            {exp.meta ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {String(exp.meta)
                  .split("•")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t, i) => (
                    <Pill key={i}>{t}</Pill>
                  ))}
              </div>
            ) : null}

            {exp.details && <div className={cn("mt-3 text-sm", subtle)}>{exp.details}</div>}
          </Section>

          <Section title="IMPACT / RESPONSIBILITIES" icon={CheckCircle2}>
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{exp.responsibilities.map((r, idx) => <li key={idx}>{r}</li>)}</ul>
          </Section>

          {d.relatedSkills?.length ? (
            <Section title="SKILLS USED" icon={Wrench}>
              <SkillPills list={d.relatedSkills} />
            </Section>
          ) : null}

          <Section title="WORKING STYLE" icon={BadgeCheck}>
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
          </Section>
        </div>
      );
    }

    if (d.kind === "skill") {
      const s = d.skill;
      if (!s) return null;

      return (
        <div className="space-y-4">
          <Section title="SKILL" icon={Sparkles}>
            <div className={cn("text-base font-semibold", text)}>{s.title}</div>
            {s.subtitle && <div className={cn("mt-1 text-sm", subtle)}>{s.subtitle}</div>}
            {s.desc && <div className={cn("mt-3 text-sm", subtle)}>{s.desc}</div>}

            {Array.isArray(s.bullets) && s.bullets.length > 0 && (
              <div className="mt-3">
                <div className={cn("text-xs font-semibold tracking-widest", label)}>FOCUS AREAS</div>
                <ul className={cn("mt-2 list-disc space-y-1 pl-5 text-sm", subtle)}>{s.bullets.map((b, idx) => <li key={idx}>{b}</li>)}</ul>
              </div>
            )}

            {Array.isArray(s.examples) && s.examples.length > 0 && (
              <div className="mt-4">
                <div className={cn("text-xs font-semibold tracking-widest", label)}>TYPICAL OUTCOMES</div>
                <ul className={cn("mt-2 list-disc space-y-1 pl-5 text-sm", subtle)}>{s.examples.map((b, idx) => <li key={idx}>{b}</li>)}</ul>
              </div>
            )}
          </Section>

          {d.usedIn?.length ? (
            <Section title="WHERE IT SHOWS UP" icon={GitBranch}>
              <div className="grid gap-2">
                {d.usedIn.map((u) => (
                  <div
                    key={u.id}
                    className={cn("flex items-center justify-between rounded-xl border px-3 py-2", theme === "light" ? "border-black/10 bg-white/75" : "border-white/10 bg-black/25")}
                  >
                    <div className="min-w-0">
                      <div className={cn("text-sm font-semibold", text)}>{u.company}</div>
                      <div className={cn("text-xs", label)}>
                        {u.role} • {u.period}
                      </div>
                      {u.meta ? <div className={cn("mt-0.5 text-[11px] line-clamp-1", subtle)}>{u.meta}</div> : null}
                    </div>
                    <ArrowUpRight className={cn("h-4 w-4 shrink-0", theme === "light" ? "text-black/55" : "text-white/60")} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="WORKING STYLE" icon={BadgeCheck}>
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
          </Section>
        </div>
      );
    }

    if (d.kind === "education") {
      const edu = d.edu;
      if (!edu) return null;

      return (
        <div className="space-y-4">
          <Section title="EDUCATION" icon={BadgeCheck}>
            <div className={cn("text-base font-semibold", text)}>{edu.title}</div>
            <div className={cn("mt-1 text-sm", subtle)}>
              {edu.school} • {edu.location}
            </div>
            <div className={cn("mt-1 text-xs", label)}>{edu.period}</div>
            {edu.details && <div className={cn("mt-3 text-sm", subtle)}>{edu.details}</div>}
          </Section>

          {d.relatedSkills?.length ? (
            <Section title="RELATED SKILLS" icon={Wrench}>
              <SkillPills list={d.relatedSkills} />
            </Section>
          ) : null}

          <Section title="WORKING STYLE" icon={BadgeCheck}>
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>{d.principles?.map((p, idx) => <li key={idx}>{p}</li>)}</ul>
          </Section>
        </div>
      );
    }

    return null;
  };

  const AboutContent = () => {
    // unchanged from your “nearly perfect” version
    const card = theme === "light" ? "border-black/12 bg-white/88" : "border-white/12 bg-white/[0.03]";
    const section = theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]";
    const label = theme === "light" ? "text-black/55" : "text-white/55";
    const text = theme === "light" ? "text-black/92" : "text-white/92";
    const subtle = theme === "light" ? "text-black/70" : "text-white/72";

    const Proof = ({ icon: Icon, title, desc }) => (
      <div className={cn("rounded-2xl border p-4", card)}>
        <div className="flex items-center gap-2">
          <div className={cn("grid h-9 w-9 place-items-center rounded-xl border", theme === "light" ? "border-black/12 bg-black/[0.06] text-black/90" : "border-white/12 bg-black/35 text-white/90")}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={cn("text-sm font-semibold", text)}>{title}</div>
        </div>
        <div className={cn("mt-2 text-xs leading-5", subtle)}>{desc}</div>
      </div>
    );

    return (
      <div className="grid gap-4">
        <div className={cn("rounded-3xl border p-5", section)}>
          <div className={cn("text-xs font-semibold tracking-widest", label)}>HIRE-READY DEVOPS</div>
          <div className={cn("mt-3 text-[15px] leading-6", subtle)}>
            I help teams ship faster <span className={cn("font-semibold", text)}>without breaking production</span>.
            I build the delivery backbone — CI/CD, Kubernetes, IaC, and monitoring — so releases become predictable, incident response becomes calm, and operations becomes scalable.
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className={cn("rounded-2xl border p-4", card)}>
              <div className={cn("text-xs font-semibold", label)}>YOU GET</div>
              <div className={cn("mt-2 text-sm font-semibold", text)}>Release confidence</div>
              <div className={cn("mt-1 text-xs", subtle)}>Automated pipelines + safe deployment habits + rollback discipline.</div>
            </div>
            <div className={cn("rounded-2xl border p-4", card)}>
              <div className={cn("text-xs font-semibold", label)}>YOU GET</div>
              <div className={cn("mt-2 text-sm font-semibold", text)}>Operational clarity</div>
              <div className={cn("mt-1 text-xs", subtle)}>Dashboards and alerts that are actionable (not noisy).</div>
            </div>
            <div className={cn("rounded-2xl border p-4", card)}>
              <div className={cn("text-xs font-semibold", label)}>YOU GET</div>
              <div className={cn("mt-2 text-sm font-semibold", text)}>Secure defaults</div>
              <div className={cn("mt-1 text-xs", subtle)}>Least privilege, sensible guardrails, and change safety.</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://www.linkedin.com/in/sgalla/"
              target="_blank"
              rel="noreferrer"
              className={cn("inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold", theme === "light" ? "bg-black text-white" : "bg-white text-black")}
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a
              href="https://github.com/srinugalla/srinugalla"
              target="_blank"
              rel="noreferrer"
              className={cn("inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold", theme === "light" ? "border-black/12 bg-white text-black" : "border-white/15 bg-black/30 text-white")}
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
            <button
              onClick={() => {
                setAboutOpen(false);
                setContactOpen(true);
              }}
              className={cn("inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold border", theme === "light" ? "border-black/12 bg-white text-black" : "border-white/15 bg-black/30 text-white")}
            >
              <Mail className="h-4 w-4" /> Contact
            </button>
          </div>
        </div>

        <div className={cn("rounded-3xl border p-5", section)}>
          <div className={cn("text-xs font-semibold tracking-widest", label)}>WHAT I DO WELL</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Proof icon={Cloud} title="AWS foundations" desc="IAM/VPC/networking, security-first defaults, cost awareness and clean ownership." />
            <Proof icon={GitBranch} title="CI/CD delivery" desc="Jenkins pipelines teams trust — predictable, debuggable, rollback-friendly." />
            <Proof icon={Boxes} title="Kubernetes & containers" desc="Safe rollouts, scaling, consistency across environments, operational hygiene." />
            <Proof icon={Activity} title="Observability" desc="Prometheus + Grafana for signals that reduce noise and speed response." />
            <Proof icon={ShieldCheck} title="Security & reliability mindset" desc="Guardrails, secrets hygiene, safe change management." />
            <Proof icon={Wrench} title="Automation & tooling" desc="Remove toil. Make ops boring. Improve day-2 operations." />
          </div>
        </div>

        <div className={cn("rounded-3xl border p-5", section)}>
          <div className={cn("text-xs font-semibold tracking-widest", label)}>FIRST 30 DAYS (REALISTIC)</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className={cn("rounded-2xl border p-4", card)}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <div className={cn("text-sm font-semibold", text)}>Delivery baseline</div>
              </div>
              <div className={cn("mt-2 text-xs", subtle)}>Clear pipeline stages, environments, versioning and rollback playbooks.</div>
            </div>
            <div className={cn("rounded-2xl border p-4", card)}>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <div className={cn("text-sm font-semibold", text)}>Incident clarity</div>
              </div>
              <div className={cn("mt-2 text-xs", subtle)}>Dashboards + alerts tuned for action, faster triage, fewer false alarms.</div>
            </div>
            <div className={cn("rounded-2xl border p-4", card)}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <div className={cn("text-sm font-semibold", text)}>Less friction</div>
              </div>
              <div className={cn("mt-2 text-xs", subtle)}>Automation and guardrails that improve flow without slowing teams down.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("min-h-[100svh]", rootBg)}>
      <Starfield theme={theme} density={isMobile ? 320 : 620} />

      <Hud
        theme={theme}
        nameText={nameText}
        showBrowseHint={showBrowseHint}
        onHome={() => {
          reset();
          setNameAnimKey((k) => k + 1);
        }}
        onAbout={() => setAboutOpen(true)}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onBrowse={openBrowse}
        onReset={() => reset()}
        onContact={() => setContactOpen(true)}
      />

      {!browseOpen && (
        <Globe
          items={data.items}
          theme={theme}
          isMobile={isMobile}
          onSelect={(it, pt) => {
            setModalOrigin(pt || null);
            setSelected(it);
          }}
        />
      )}

      <BrowseView
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        mode={browseMode}
        setMode={setBrowseMode}
        cards={browseCards}
        theme={theme}
        onPick={(c) => {
          setBrowseOpen(false);
          setSelected(c);
          setModalOrigin({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 });
        }}
      />

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About" theme={theme} origin={{ x: window.innerWidth * 0.25, y: 120 }}>
        <AboutContent />
      </Modal>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Contact" theme={theme} origin={{ x: window.innerWidth * 0.82, y: 120 }}>
        <div className="grid gap-3">
          <div className={cn("rounded-2xl border px-4 py-3 text-sm", theme === "light" ? "border-black/10 bg-black/[0.03] text-black/75" : "border-white/10 bg-white/[0.03] text-white/75")}>
            <div className={cn("text-xs font-semibold tracking-widest", theme === "light" ? "text-black/55" : "text-white/55")}>FASTEST WAY TO REACH ME</div>
            <div className="mt-2">Email is best — I reply quickly and can share availability right away.</div>
          </div>

          {[
            { href: "mailto:srinu.galla@gmail.com", left: <><Mail className="h-4 w-4" /> srinu.galla@gmail.com</>, ext: false },
            { href: "https://github.com/srinugalla/srinugalla", left: <><Github className="h-4 w-4" /> GitHub</>, ext: true },
            { href: "https://www.linkedin.com/in/sgalla/", left: <><Linkedin className="h-4 w-4" /> LinkedIn</>, ext: true },
            { href: "tel:+353866005678", left: <><Phone className="h-4 w-4" /> +353 86 600 5678</>, ext: false },
          ].map((row, i) => (
            <a
              key={i}
              href={row.href}
              target={row.ext ? "_blank" : undefined}
              rel={row.ext ? "noreferrer" : undefined}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
                theme === "light" ? "border-black/10 bg-black/[0.03] text-black/85 hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]"
              )}
            >
              <span className="flex items-center gap-2">{row.left}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          ))}
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.company ? `${selected.company}` : selected?.title || "Details"} theme={theme} origin={modalOrigin || undefined}>
        <DetailsModal />
      </Modal>

      <div className={cn("pointer-events-none fixed bottom-3 right-4 z-40 text-[11px]", theme === "light" ? "text-black/40" : "text-white/45")}>
        © {new Date().getFullYear()} Srinivasarao Galla
      </div>

      <div className="fixed inset-x-0 bottom-6 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <button
            onClick={openBrowse}
            className={cn(
              "hint-glow-soft rounded-full border backdrop-blur transition relative",
              showBrowseHint ? "hint-sparkle-soft" : "",
              theme === "light" ? "border-black/10 bg-white/80 text-black/65 hover:bg-white" : "border-white/12 bg-black/35 text-white/75 hover:bg-black/45",
              isMobile ? "px-3 py-1.5 text-[10px] font-semibold tracking-wide" : "px-4 py-2 text-[11px] font-semibold tracking-widest"
            )}
          >
            {isMobile ? "DRAG • TAP • OPEN BROWSE" : "TRACKPAD SWIPE • DRAG • CLICK TO OPEN BROWSE"}
          </button>
        </div>
      </div>
    </div>
  );
}
