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

/* ----------------------------- Binary reveal name ----------------------------- */
function useBinaryReveal(finalText, { durationMs = 1200, settleMs = 200 } = {}) {
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
  }, [finalText, durationMs, settleMs]);

  return text;
}

/* ----------------------------- Starfield + Meteors ----------------------------- */
function Starfield({ density = 700, theme = "dark" }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const stars = useRef([]);
  const meteors = useRef([]);
  const lastMeteorAt = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const N = Math.floor((w * h) / 1800);
      const target = Math.min(density, Math.max(260, N));
      stars.current = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.12,
        a: Math.random() * 0.55 + 0.08,
        tw: Math.random() * 0.7 + 0.25,
        ph: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

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

      for (const s of stars.current) {
        const tw = 0.6 + 0.4 * Math.sin((t / 1000) * s.tw + s.ph);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${starRGB},${s.a * tw})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const now = t;
      const since = now - lastMeteorAt.current;
      const minGap = theme === "light" ? 5200 : 3300;
      const maxGap = theme === "light" ? 10000 : 7600;
      const gap = minGap + Math.random() * (maxGap - minGap);

      if (since > gap && meteors.current.length < 3) {
        lastMeteorAt.current = now;

        const startEdge = Math.random() < 0.5 ? "top" : "left";
        const x0 = startEdge === "top" ? Math.random() * w : -120;
        const y0 = startEdge === "top" ? -120 : Math.random() * (h * 0.75);

        const len = 360 + Math.random() * 520;
        const angle = (Math.PI * (16 + Math.random() * 20)) / 180;
        const speed = 12 + Math.random() * 7;

        meteors.current.push({
          x: x0,
          y: y0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          len,
          life: 1,
          fade: 0.012 + Math.random() * 0.012,
        });
      }

      meteors.current = meteors.current
        .map((m) => {
          const nx = m.x + m.vx;
          const ny = m.y + m.vy;
          const life = m.life - m.fade;
          const alpha = Math.max(0, life);

          const tailX = nx - m.vx * (m.len / 16);
          const tailY = ny - m.vy * (m.len / 16);

          const grad = ctx.createLinearGradient(nx, ny, tailX, tailY);
          if (theme === "light") {
            grad.addColorStop(0, `rgba(0,0,0,${0.24 * alpha})`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);
          } else {
            grad.addColorStop(0, `rgba(255,255,255,${0.55 * alpha})`);
            grad.addColorStop(0.2, `rgba(255,235,150,${0.45 * alpha})`);
            grad.addColorStop(0.55, `rgba(255,160,40,${0.33 * alpha})`);
            grad.addColorStop(1, `rgba(255,70,0,0)`);
          }

          ctx.strokeStyle = grad;
          ctx.lineWidth = theme === "light" ? 1.0 : 1.4;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          if (theme !== "light") {
            const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, 18);
            glow.addColorStop(0, `rgba(255,220,120,${0.16 * alpha})`);
            glow.addColorStop(1, `rgba(255,90,0,0)`);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(nx, ny, 18, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle =
            theme === "light"
              ? `rgba(0,0,0,${0.16 * alpha})`
              : `rgba(255,255,255,${0.22 * alpha})`;
          ctx.beginPath();
          ctx.arc(nx, ny, theme === "light" ? 1.2 : 1.7, 0, Math.PI * 2);
          ctx.fill();

          return { ...m, x: nx, y: ny, life };
        })
        .filter((m) => m.life > 0 && m.x < w + 360 && m.y < h + 360);

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
function Modal({ open, onClose, title, children, theme = "dark" }) {
  const panel =
    theme === "light"
      ? "bg-white text-black border-black/10"
      : "bg-[#0a0a0c] text-white border-white/15";
  const headerBorder = theme === "light" ? "border-black/10" : "border-white/10";
  const closeBtn =
    theme === "light"
      ? "border-black/10 bg-black/[0.02] text-black/70 hover:bg-black/[0.06]"
      : "border-white/15 bg-white/[0.02] text-white/80 hover:bg-white/[0.06]";
  const overlay = theme === "light" ? "bg-black/28" : "bg-black/70";

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className={cn("absolute inset-0 backdrop-blur", overlay)} onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              className={cn("w-[min(980px,92vw)] overflow-hidden rounded-3xl border shadow-[0_20px_90px_rgba(0,0,0,0.35)]", panel)}
              initial={{ y: 18, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.99, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <div className={cn("flex items-center justify-between border-b px-5 py-4", headerBorder)}>
                <div className={cn("text-sm font-semibold", theme === "light" ? "text-black" : "text-white")}>{title}</div>
                <button onClick={onClose} className={cn("rounded-full border p-2 transition", closeBtn)} aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className={cn("max-h-[78vh] overflow-y-auto p-5 text-sm leading-6", theme === "light" ? "text-black/80" : "text-white/75")}>
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Globe --------------------------------- */
function Globe({ items, onSelect, theme = "dark" }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const rafRef = useRef(0);

  const rot = useRef({ x: -12, y: 18 });
  const vel = useRef({ x: 0.0, y: 0.085 });
  const drag = useRef({ active: false, lx: 0, ly: 0 });
  const lastInteract = useRef(0);

  const [R, setR] = useState(420);
  const [wrapSize, setWrapSize] = useState(960);
  const [cardScale, setCardScale] = useState(1);

  // ✅ better mobile sizing: respect top header + bottom pill
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // safe padding for header+footer
      const safeTop = w < 640 ? 124 : 92;
      const safeBottom = 84;

      const usable = Math.max(520, Math.min(w, h - safeTop - safeBottom));
      const ws = clamp(Math.floor(usable * 0.98), 340, 1120);
      setWrapSize(ws);

      const r = clamp(Math.floor(ws * 0.47), 165, 520);
      setR(r);

      setCardScale(clamp(usable / 1200, 0.78, 1.02));
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const points = useMemo(() => {
    const n = items.length;
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    const poleClamp = 0.975;
    for (let i = 0; i < n; i++) {
      const y = lerp(poleClamp, -poleClamp, i / (n - 1));
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      pts.push({ lon: Math.atan2(x, z), lat: Math.asin(y) });
    }
    return pts;
  }, [items.length]);

  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(34, now - last);
      last = now;

      rot.current.y += vel.current.y * (dt / 16);
      rot.current.x += vel.current.x * (dt / 16);
      rot.current.x = clamp(rot.current.x, -46, 46);

      vel.current.y *= 0.992;
      vel.current.x *= 0.992;

      const idle = !drag.current.active && now - lastInteract.current > 900;

      if (idle) {
        vel.current.y = lerp(vel.current.y, 0.085, 0.012);
        vel.current.x = lerp(vel.current.x, 0.0, 0.030);
      } else {
        vel.current.y = lerp(vel.current.y, 0.0, 0.022);
        vel.current.x = lerp(vel.current.x, 0.0, 0.030);
      }

      if (innerRef.current) {
        innerRef.current.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onDown = (e) => {
      if (e.target?.closest?.("button[data-card]")) return;
      drag.current.active = true;
      lastInteract.current = performance.now();
      drag.current.lx = e.clientX;
      drag.current.ly = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e) => {
      if (!drag.current.active) return;
      lastInteract.current = performance.now();

      const dx = e.clientX - drag.current.lx;
      const dy = e.clientY - drag.current.ly;
      drag.current.lx = e.clientX;
      drag.current.ly = e.clientY;

      rot.current.y += dx * 0.14;
      rot.current.x -= dy * 0.14;
      rot.current.x = clamp(rot.current.x, -55, 55);

      vel.current.y = dx * 0.055;
      vel.current.x = -dy * 0.055;
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
      if (!e.ctrlKey) e.preventDefault();
      lastInteract.current = performance.now();
      const { dx, dy } = norm(e);
      const s = 0.0022;
      vel.current.y += dx * s;
      vel.current.x += -dy * s;
      rot.current.x = clamp(rot.current.x, -55, 55);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const specular =
    theme === "light"
      ? "linear-gradient(135deg, rgba(0,0,0,0.07), rgba(255,255,255,0) 46%), linear-gradient(315deg, rgba(0,0,0,0.04), rgba(255,255,255,0) 58%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0) 48%), linear-gradient(315deg, rgba(255,210,140,0.02), rgba(0,0,0,0) 58%)";

  return (
    <div className="relative z-10 flex h-[100svh] w-full items-center justify-center">
      <motion.div
        ref={wrapRef}
        className="relative select-none"
        style={{ width: wrapSize, height: wrapSize, perspective: "1200px" }}
        initial={{ opacity: 0, scale: 0.70, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 165, damping: 20 }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full" style={{ background: specular, opacity: theme === "light" ? 0.18 : 0.22 }} />

        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          <div ref={innerRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {items.map((it, i) => {
              const p = points[i];
              const place = `rotateY(${(p.lon * 180) / Math.PI}deg) rotateX(${(-p.lat * 180) / Math.PI}deg) translateZ(${R}px)`;

              const w = (it.w ?? 142) * cardScale;
              const h = (it.h ?? 96) * cardScale;

              const cardBorder = theme === "light" ? "border-black/15" : "border-white/12";
              const cardBg = theme === "light" ? "bg-white/92" : "bg-white/[0.06]";
              const textMain = theme === "light" ? "text-black/88" : "text-white/92";
              const textSub = theme === "light" ? "text-black/62" : "text-white/70";

              const pal = it.palette ?? pickPalette(it.company || it.title || it.id);
              const bgA = theme === "light" ? `${pal.a}18` : `${pal.a}22`;
              const bgB = theme === "light" ? `${pal.b}12` : `${pal.b}16`;

              return (
                <button
                  key={it.id}
                  data-card
                  className="globe-card group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 outline-none"
                  style={{
                    width: w,
                    height: h,
                    transformStyle: "preserve-3d",
                    transform: place,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(it);
                  }}
                >
                  <div
                    className={cn("relative h-full w-full overflow-hidden rounded-2xl border backdrop-blur-md transition", cardBorder, cardBg)}
                    style={{
                      background: `radial-gradient(circle at 22% 18%, ${bgA}, rgba(255,255,255,0.08) 32%, rgba(0,0,0,0) 72%), linear-gradient(135deg, ${bgA}, ${bgB} 60%, rgba(0,0,0,0))`,
                      boxShadow: theme === "light" ? "0 10px 22px rgba(0,0,0,0.06)" : "0 14px 40px rgba(0,0,0,0.42)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "grid h-9 w-9 place-items-center rounded-xl border border-white/10 font-extrabold",
                            theme === "light" ? "bg-black/[0.04] text-black/75" : "bg-black/40 text-white/85"
                          )}
                          style={{ fontSize: 10 }}
                        >
                          {it.logoText ? it.logoText : initials(it.company || it.title)}
                        </div>

                        <div className="min-w-0 text-left">
                          <div className={cn("line-clamp-2 font-semibold leading-[14px]", textMain)} style={{ fontSize: 11 }}>
                            {it.company || it.title}
                          </div>
                          <div className={cn("mt-0.5 line-clamp-1 leading-[14px]", textSub)} style={{ fontSize: 10 }}>
                            {it.title}
                          </div>
                        </div>
                      </div>

                      <div className={cn("rounded-xl p-1.5", theme === "light" ? "text-black/55" : "text-white/70")}>
                        <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className={cn("px-3 pb-3 text-left leading-[14px]", textSub)} style={{ fontSize: 10 }}>
                      <span className="line-clamp-2">{it.meta || ""}</span>
                    </div>
                  </div>
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
function Hud({ theme, onToggleTheme, onBrowse, onReset, onContact, onAbout, nameText }) {
  const btnBase = "rounded-full border transition";
  const btnDark = "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]";
  const btnLight = "border-black/10 bg-black/[0.03] text-black/75 hover:bg-black/[0.06]";
  const btn = theme === "light" ? btnLight : btnDark;

  return (
    <div className="fixed inset-x-0 top-0 z-30">
      {/* ✅ mobile friendly header */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
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
          </div>

          {/* ✅ buttons wrap instead of overlapping */}
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

            <button onClick={onBrowse} className={cn(btnBase, btn, "px-4 py-2 text-xs font-semibold")}>
              <span className="inline-flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Browse
              </span>
            </button>

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
  const wrap = "mt-4 max-h-[64vh] overflow-y-auto pr-1";

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
              const a = theme === "light" ? `${pal.a}14` : `${pal.a}22`;
              const b = theme === "light" ? `${pal.b}10` : `${pal.b}16`;

              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-3 text-left transition",
                    theme === "light" ? "border-black/10 bg-black/[0.03] hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                  style={{
                    background: `radial-gradient(circle at 24% 20%, ${a}, rgba(255,255,255,0.08) 30%, rgba(0,0,0,0) 62%), linear-gradient(135deg, ${a}, ${b} 55%, rgba(0,0,0,0))`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl border text-xs font-extrabold",
                          theme === "light" ? "border-black/10 bg-white/75 text-black/75" : "border-white/12 bg-black/30 text-white/85"
                        )}
                      >
                        {c.logoText ? c.logoText : initials(c.company || c.title)}
                      </div>
                      <div className="min-w-0">
                        <div className={cn("truncate text-xs font-semibold", theme === "light" ? "text-black/80" : "text-white/85")}>
                          {c.company || c.title}
                        </div>
                        <div className={cn("mt-0.5 line-clamp-1 text-[12px]", theme === "light" ? "text-black/55" : "text-white/60")}>{c.title}</div>
                      </div>
                    </div>
                    <ArrowUpRight className={cn("h-4 w-4 shrink-0 transition", theme === "light" ? "text-black/50 group-hover:text-black/75" : "text-white/55 group-hover:text-white/80")} />
                  </div>

                  {c.meta && <div className={cn("mt-2 line-clamp-2 text-[12px] leading-4", theme === "light" ? "text-black/55" : "text-white/60")}>{c.meta}</div>}
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
              const a = theme === "light" ? `${pal.a}12` : `${pal.a}18`;
              const b = theme === "light" ? `${pal.b}10` : `${pal.b}14`;
              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c)}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    theme === "light" ? "border-black/10 bg-black/[0.03] hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                  style={{
                    background: `radial-gradient(circle at 22% 20%, ${a}, rgba(255,255,255,0.06) 32%, rgba(0,0,0,0) 62%), linear-gradient(135deg, ${a}, ${b} 55%, rgba(0,0,0,0))`,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl border text-xs font-extrabold",
                        theme === "light" ? "border-black/10 bg-white/75 text-black/75" : "border-white/12 bg-black/30 text-white/85"
                      )}
                    >
                      {c.logoText ? c.logoText : initials(c.company || c.title)}
                    </div>
                    <div className="min-w-0">
                      <div className={cn("truncate text-sm font-semibold", theme === "light" ? "text-black/85" : "text-white/90")}>{c.title}</div>
                      <div className={cn("truncate text-xs", theme === "light" ? "text-black/55" : "text-white/55")}>{c.company || c.meta || ""}</div>
                    </div>
                  </div>
                  <ArrowUpRight className={cn("h-4 w-4 transition", theme === "light" ? "text-black/50 group-hover:text-black/75" : "text-white/55 group-hover:text-white/80")} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

/* --------------------------- Rich Popup Resolver -------------------------- */
function resolvePopupData(sel, data) {
  if (!sel) return null;

  if (sel.type === "experience") {
    const exp = data.experiences.find((e) => e.id === sel.baseId || e.id === sel.id);
    const relatedSkills = (exp?.relatedSkillIds || []).map((id) => data.skills[id]).filter(Boolean);
    return { kind: "experience", exp, relatedSkills, principles: data.principles };
  }

  if (sel.type === "skill") {
    const sid = sel.skillId || sel.baseId?.replace(/^skill-/, "");
    const skill = data.skills[sid];
    const usedIn = data.experiences
      .filter((e) => (e.relatedSkillIds || []).includes(sid))
      .map((e) => ({ id: e.id, company: e.company, role: e.title, period: e.period }));
    return { kind: "skill", skill, usedIn, principles: data.principles };
  }

  if (sel.type === "education") {
    const edu = data.education.find((e) => e.id === sel.baseId || e.id === sel.id);
    const relatedSkills = (edu?.relatedSkillIds || []).map((id) => data.skills[id]).filter(Boolean);
    return { kind: "education", edu, relatedSkills, principles: data.principles };
  }

  if (sel.type === "link") {
    return { kind: "link", title: sel.title, company: sel.company, url: sel.url, meta: sel.meta, principles: data.principles };
  }

  return null;
}

/* ----------------------------------- App ---------------------------------- */
export default function App() {
  // ✅ default dark
  const [theme, setTheme] = useState("dark");

  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState("grid");
  const [contactOpen, setContactOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const nameText = useBinaryReveal("Srinivasarao Galla", { durationMs: 1250, settleMs: 160 });

  const data = useMemo(() => {
    const skills = {
      aws: { id: "aws", title: "AWS", subtitle: "EC2 • S3 • IAM • VPC", desc: "Cloud infrastructure support with a security-first mindset.", bullets: ["EC2", "S3", "IAM", "VPC"] },
      jenkins: { id: "jenkins", title: "Jenkins", subtitle: "CI/CD Pipelines", desc: "Reliable pipelines for build, test, and deployment automation.", bullets: ["Pipelines", "Automation", "Release confidence"] },
      docker: { id: "docker", title: "Docker", subtitle: "Containerisation", desc: "Environment parity across dev/stage/prod.", bullets: ["Images", "Best practices", "Parity"] },
      kubernetes: { id: "kubernetes", title: "Kubernetes", subtitle: "Deploy • Scale", desc: "Scalable deployments and operational consistency.", bullets: ["Deployments", "Services", "Helm"] },
      terraform: { id: "terraform", title: "Terraform", subtitle: "Infrastructure as Code", desc: "Repeatable, auditable infrastructure provisioning.", bullets: ["Modules", "State", "Reusable infra"] },
      prometheus: { id: "prometheus", title: "Prometheus", subtitle: "Metrics + Alerting", desc: "Proactive monitoring and faster incident response.", bullets: ["Metrics", "Alerting", "SLIs/SLOs"] },
      grafana: { id: "grafana", title: "Grafana", subtitle: "Dashboards", desc: "Operational visibility that teams actually use.", bullets: ["Dashboards", "Panels", "Ops visibility"] },
      git: { id: "git", title: "Git + GitHub", subtitle: "Collaboration", desc: "Version control, reviews, and clean release workflows.", bullets: ["PRs", "Reviews", "Branching"] },
      collaboration: { id: "collaboration", title: "Cross-team Collaboration", subtitle: "Dev • Ops • Product", desc: "Align infra decisions with product goals and delivery timelines.", bullets: ["Stakeholders", "Delivery", "Execution"] },
      tooling: { id: "tooling", title: "Tooling", subtitle: "Linux • Bash • APIs", desc: "Practical scripting and systems fundamentals.", bullets: ["Linux", "Bash", "REST APIs"] },
      pm: { id: "pm", title: "Project Coordination", subtitle: "Monday.com • Trello", desc: "Strong planning and communication for shipping work.", bullets: ["Planning", "Timelines", "Stakeholders"] },
    };

    const experiences = [
      {
        id: "exp-fullscale",
        type: "experience",
        title: "DevOps Engineer",
        company: "FullScale.ie",
        location: "Dublin, Ireland",
        period: "Jun 2023 – Present",
        meta: "Cloud • CI/CD • Kubernetes",
        responsibilities: [
          "Designed, implemented, and maintained CI/CD pipelines using Jenkins for automated builds, testing, and deployments.",
          "Containerised applications using Docker and managed deployments on Kubernetes for scalability and environment parity.",
          "Managed source control workflows with Git/GitHub (reviews, versioning, automated deployments).",
          "Implemented Infrastructure as Code using Terraform to provision/manage cloud infrastructure repeatably.",
          "Set up monitoring with Prometheus and Grafana for performance tracking and faster incident response.",
          "Managed AWS infrastructure using EC2, S3, IAM, and VPC for secure environments.",
          "Collaborated with dev + product teams to align infra and delivery with business goals.",
        ],
        relatedSkillIds: ["aws", "jenkins", "docker", "kubernetes", "terraform", "prometheus", "grafana", "git", "collaboration"],
        details: "Built reliable deployments and scalable delivery for a cloud-based property-listing marketplace.",
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
          "Coordinated daily project activities for an online marketplace across partner stores.",
          "Supported planning, scheduling, and execution of feature releases and onboarding.",
          "Communicated requirements between development teams, vendors, and stakeholders.",
          "Monitored progress, identified risks, and recommended solutions to keep delivery on track.",
          "Managed tasks and timelines using Monday.com, Trello, and Google Workspace.",
        ],
        relatedSkillIds: ["pm", "collaboration"],
        details: "Kept teams aligned and delivery predictable across the platform lifecycle.",
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
          "Engaged enterprise clients and closed multi-million-euro deals.",
          "Built customer offers to maximize profitability while securing new business.",
          "Managed product lifecycle from strategic planning to tactical activities.",
          "Assisted tech team with field testing and resolving live issues with operators.",
        ],
        relatedSkillIds: ["collaboration"],
        details: "Connected business goals with execution and operations under real-world constraints.",
      },
      {
        id: "exp-lyca-uk",
        type: "experience",
        title: "Business Development Manager",
        company: "LycaTel Distribution UK Ltd.",
        location: "London, UK",
        period: "May 2012 – May 2014",
        meta: "Sales • Strategy",
        responsibilities: [
          "Expanded product reach and revenue across regional and international territories.",
          "Implemented sales and marketing strategies and kept the sales database up to date.",
          "Participated in product development and design; acted as brand ambassador.",
          "Assisted in recruitment, training, and staff development.",
        ],
        relatedSkillIds: ["collaboration"],
        details: "Growth and partnerships work with strong communication and execution.",
      },
    ];

    const education = [
      {
        id: "edu-mba",
        type: "education",
        title: "MBA in Marketing",
        school: "University of Wales Trinity Saint David",
        location: "London, UK",
        period: "2010 – 2011",
        details: "Master of Business Administration in Marketing.",
        relatedSkillIds: ["collaboration", "pm"],
      },
      {
        id: "edu-bsc",
        type: "education",
        title: "B.Sc (Maths, Physics, Chemistry)",
        school: "Gowtham Degree College (A.N. University)",
        location: "Vijayawada, India",
        period: "2004–2005, 2007–2009",
        details: "Strong analytical and problem-solving foundation.",
        relatedSkillIds: ["tooling"],
      },
      {
        id: "edu-ded",
        type: "education",
        title: "Diploma in Education (D.Ed)",
        school: "D.I.E.T, Krishna District",
        location: "India",
        period: "2005 – 2007",
        details: "Communication and structured learning approaches.",
        relatedSkillIds: ["collaboration"],
      },
    ];

    const principles = ["Automate the boring parts.", "Prefer repeatability over heroics.", "Observability is a feature.", "Small changes, shipped often."];

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

    const expanded = [];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < baseCards.length; j++) {
        const b = baseCards[j];
        expanded.push({
          ...b,
          id: `${b.id}-${i}`,
          w: 140 + ((i * 7 + j) % 4) * 10,
          h: 96 + ((i * 11 + j) % 3) * 6,
        });
      }
    }

    const socials = [
      { id: "social-linkedin", baseId: "social-linkedin", type: "link", title: "LinkedIn", company: "Connect", logoText: "in", meta: "Open my LinkedIn profile", palette: pickPalette("LinkedIn"), url: "https://www.linkedin.com/in/sgalla/" },
      { id: "social-github", baseId: "social-github", type: "link", title: "GitHub", company: "Projects", logoText: "GH", meta: "Open my GitHub repositories", palette: pickPalette("GitHub"), url: "https://github.com/srinugalla/srinugalla" },
      { id: "social-email", baseId: "social-email", type: "link", title: "Email", company: "srinu.galla@gmail.com", logoText: "@", meta: "Send me an email", palette: pickPalette("Email"), url: "mailto:srinu.galla@gmail.com" },
    ];

    return { items: [...expanded.slice(0, 28), ...socials], experiences, education, skills, principles };
  }, []);

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
  };

  const DetailsModal = () => {
    const d = resolvePopupData(selected, data);
    if (!d) return null;

    const sectionBase = theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]";
    const label = theme === "light" ? "text-black/55" : "text-white/55";
    const text = theme === "light" ? "text-black/80" : "text-white/80";
    const subtle = theme === "light" ? "text-black/60" : "text-white/65";

    const Section = ({ title, children }) => (
      <div className={cn("rounded-2xl border p-4", sectionBase)}>
        <div className={cn("text-xs font-semibold tracking-widest", label)}>{title}</div>
        <div className="mt-3">{children}</div>
      </div>
    );

    const SkillPills = ({ list }) => (
      <div className="flex flex-wrap gap-2">
        {list.map((s) => (
          <span
            key={s.id}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              theme === "light" ? "border-black/10 bg-white/70 text-black/70" : "border-white/12 bg-black/30 text-white/70"
            )}
          >
            {s.title}
            {s.subtitle ? <span className={cn("ml-2", theme === "light" ? "text-black/45" : "text-white/45")}>• {s.subtitle}</span> : null}
          </span>
        ))}
      </div>
    );

    if (d.kind === "link") {
      const Icon = d.title === "GitHub" ? Github : d.title === "LinkedIn" ? Linkedin : Mail;
      return (
        <div className="space-y-4">
          <Section title="CONNECT">
            <div className={cn("flex items-center gap-2 text-base font-semibold", text)}>
              <Icon className="h-5 w-5" /> {d.title}
            </div>
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

          <Section title="HOW I WORK">
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>
              {d.principles?.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </Section>
        </div>
      );
    }

    if (d.kind === "experience") {
      const exp = d.exp;
      if (!exp) return null;
      return (
        <div className="space-y-4">
          <Section title="EXPERIENCE">
            <div className={cn("text-base font-semibold", text)}>{exp.title}</div>
            <div className={cn("mt-1 text-sm", subtle)}>
              {exp.company} • {exp.location}
            </div>
            <div className={cn("mt-1 text-xs", label)}>{exp.period}</div>
            {exp.details && <div className={cn("mt-3 text-sm", subtle)}>{exp.details}</div>}

            <div className="mt-4">
              <div className={cn("text-xs font-semibold tracking-widest", label)}>WHAT I DID</div>
              <ul className={cn("mt-3 list-disc space-y-1 pl-5 text-sm", subtle)}>
                {exp.responsibilities?.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </Section>

          {d.relatedSkills?.length ? (
            <Section title="SKILLS USED">
              <SkillPills list={d.relatedSkills} />
            </Section>
          ) : null}

          <Section title="HOW I WORK">
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>
              {d.principles?.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </Section>
        </div>
      );
    }

    if (d.kind === "skill") {
      const s = d.skill;
      if (!s) return null;

      return (
        <div className="space-y-4">
          <Section title="SKILL">
            <div className={cn("text-base font-semibold", text)}>{s.title}</div>
            {s.subtitle && <div className={cn("mt-1 text-sm", subtle)}>{s.subtitle}</div>}
            {s.desc && <div className={cn("mt-3 text-sm", subtle)}>{s.desc}</div>}
            {Array.isArray(s.bullets) && s.bullets.length > 0 && (
              <ul className={cn("mt-3 list-disc space-y-1 pl-5 text-sm", subtle)}>
                {s.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}
          </Section>

          {d.usedIn?.length ? (
            <Section title="USED IN">
              <div className="grid gap-2">
                {d.usedIn.map((u) => (
                  <div
                    key={u.id}
                    className={cn("flex items-center justify-between rounded-xl border px-3 py-2", theme === "light" ? "border-black/10 bg-white/70" : "border-white/10 bg-black/25")}
                  >
                    <div>
                      <div className={cn("text-sm font-semibold", text)}>{u.company}</div>
                      <div className={cn("text-xs", label)}>
                        {u.role} • {u.period}
                      </div>
                    </div>
                    <ArrowUpRight className={cn("h-4 w-4", theme === "light" ? "text-black/55" : "text-white/60")} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="HOW I WORK">
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>
              {d.principles?.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </Section>
        </div>
      );
    }

    if (d.kind === "education") {
      const edu = d.edu;
      if (!edu) return null;

      return (
        <div className="space-y-4">
          <Section title="EDUCATION">
            <div className={cn("text-base font-semibold", text)}>{edu.title}</div>
            <div className={cn("mt-1 text-sm", subtle)}>
              {edu.school} • {edu.location}
            </div>
            <div className={cn("mt-1 text-xs", label)}>{edu.period}</div>
            {edu.details && <div className={cn("mt-3 text-sm", subtle)}>{edu.details}</div>}
          </Section>

          {d.relatedSkills?.length ? (
            <Section title="RELATED SKILLS">
              <SkillPills list={d.relatedSkills} />
            </Section>
          ) : null}

          <Section title="HOW I WORK">
            <ul className={cn("list-disc space-y-1 pl-5 text-sm", subtle)}>
              {d.principles?.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </Section>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn("min-h-[100svh]", rootBg)}>
      <Starfield theme={theme} />

      <Hud
        theme={theme}
        nameText={nameText}
        onAbout={() => setAboutOpen(true)}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onBrowse={() => setBrowseOpen(true)}
        onReset={() => {
          reset();
        }}
        onContact={() => setContactOpen(true)}
      />

      {!browseOpen && <Globe items={data.items} theme={theme} onSelect={(it) => setSelected(it)} />}

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
        }}
      />

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About" theme={theme}>
        <div className="grid gap-4">
          <div className={cn("rounded-2xl border p-4", theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]")}>
            <div className={cn("text-xs font-semibold tracking-widest", theme === "light" ? "text-black/55" : "text-white/55")}>ABOUT ME</div>
            <p className={cn("mt-3 text-sm leading-6", theme === "light" ? "text-black/70" : "text-white/75")}>
                      <p>
                        I’m a DevOps Engineer who turns complex systems into reliable, scalable,
                      and easy-to-operate platforms.
                      </p>

                      <p>
                        I specialize in building production-ready cloud infrastructure, CI/CD
                      pipelines teams trust, and Kubernetes environments that scale without
                      drama. My focus is always on repeatability, observability, and safe
                      delivery — so teams can move fast without breaking things.
                      </p>

                      <p>
                        I bring a rare blend of hands-on DevOps engineering and strong business
                      understanding. Having worked across product, delivery, and operations,
                      I don’t just automate systems — I design them around real business needs,
                      timelines, and risk.
                      </p>

                      <p>  
                        If you need predictable deployments, secure infrastructure, and a DevOps
                      partner who owns outcomes end to end — I’d love to talk.
                      </p>
            </p>
          </div>

          <div className={cn("rounded-2xl border p-4", theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]")}>
            <div className={cn("text-xs font-semibold tracking-widest", theme === "light" ? "text-black/55" : "text-white/55")}>OPPORTUNITIES</div>
            <ul className={cn("mt-3 list-disc space-y-1 pl-5 text-sm", theme === "light" ? "text-black/70" : "text-white/75")}>
              <li>DevOps / Platform Engineering roles</li>
              <li>Cloud migration and IaC projects</li>
              <li>CI/CD modernization & reliability improvements</li>
              <li>Observability: metrics, alerts, dashboards</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setAboutOpen(false);
                setContactOpen(true);
              }}
              className={cn("rounded-2xl px-4 py-2 text-sm font-semibold", theme === "light" ? "bg-black text-white" : "bg-white text-black")}
            >
              Contact me
            </button>
            <a
              href="https://www.linkedin.com/in/sgalla/"
              target="_blank"
              rel="noreferrer"
              className={cn(
                "rounded-2xl border px-4 py-2 text-sm font-semibold",
                theme === "light" ? "border-black/10 bg-white text-black/80 hover:bg-black/[0.03]" : "border-white/12 bg-black/20 text-white/85 hover:bg-white/[0.03]"
              )}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </Modal>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Contact" theme={theme}>
        <div className="grid gap-3">
          <a
            href="mailto:srinu.galla@gmail.com"
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
              theme === "light" ? "border-black/10 bg-black/[0.03] text-black/80 hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]"
            )}
          >
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> srinu.galla@gmail.com
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href="https://github.com/srinugalla/srinugalla"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
              theme === "light" ? "border-black/10 bg-black/[0.03] text-black/80 hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]"
            )}
          >
            <span className="flex items-center gap-2">
              <Github className="h-4 w-4" /> GitHub
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href="https://www.linkedin.com/in/sgalla/"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
              theme === "light" ? "border-black/10 bg-black/[0.03] text-black/80 hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]"
            )}
          >
            <span className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href="tel:+353866005678"
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
              theme === "light" ? "border-black/10 bg-black/[0.03] text-black/80 hover:bg-black/[0.06]" : "border-white/12 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]"
            )}
          >
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +353 86 600 5678
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.company ? `${selected.company}` : selected?.title || "Details"} theme={theme}>
        <DetailsModal />
      </Modal>

      {/* ✅ Copyright stays visible and small on mobile */}
      <div className={cn("pointer-events-none fixed bottom-3 right-4 z-40 text-[11px]", theme === "light" ? "text-black/40" : "text-white/45")}>
        © {new Date().getFullYear()} Srinivasarao Galla
      </div>

      {/* ✅ single helper pill */}
      <div className="fixed inset-x-0 bottom-6 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <div
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-semibold tracking-widest backdrop-blur",
              theme === "light" ? "border-black/10 bg-white/70 text-black/60" : "border-white/12 bg-black/35 text-white/70"
            )}
          >
            DRAG / TRACKPAD SWIPE • CLICK CARD • BROWSE GRID/LIST
          </div>
        </div>
      </div>
    </div>
  );
}
