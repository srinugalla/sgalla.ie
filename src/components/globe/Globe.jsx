import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { clamp, lerp } from "../../utils/math";
import { initials } from "../../utils/format";
import { pickPalette, rgba } from "../../utils/colors";

/* layout */
function premiumSphereLayout(items, { isMobile }) {
  const n = items.length;
  if (!n) return new Map();

  if (isMobile) {
    const out = new Map();
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const it = items[i];
      const t = (i + 0.5) / n;
      const y = 1 - 2 * t;

      let lat = Math.asin(clamp(y, -1, 1));
      let lon = (i * golden) % (Math.PI * 2);

      // light jitter
      const seed = (it.id?.length ?? 1) * 97;
      const jl = ((seed % 1000) / 1000 - 0.5) * 0.050;
      const jt = (((seed * 3) % 1000) / 1000 - 0.5) * 0.025;

      lon += jl;
      lat += jt;
      lat = clamp(lat, -1.5, 1.5);

      out.set(it.id, { lon, lat });
    }
    return out;
  }

  const bands = 8;
  const latMin = -1.3;
  const latMax = 1.3;

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

      const seed = (it.id?.length ?? 1) * 131;
      const jl = ((seed % 1000) / 1000 - 0.5) * 0.035;
      const jt = (((seed * 5) % 1000) / 1000 - 0.5) * 0.02;

      out.set(it.id, { lon: lon + jl, lat: lat + jt });
    }
  }

  return out;
}

export default function Globe({ items, onSelect, theme = "dark", isMobile }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  const BASE_X = -7;

  // smoother physics state
  const rot = useRef({ x: BASE_X, y: 18 });
  const vel = useRef({ y: 0 });

  const drag = useRef({
    active: false,
    pending: false,
    startX: 0,
    lx: 0,
    pointerType: "mouse",
    pid: null,
  });

  const lastInteract = useRef(0);

  const [R, setR] = useState(420);
  const [wrapSize, setWrapSize] = useState(960);
  const [cardScale, setCardScale] = useState(1);

  const cardNodesRef = useRef([]);
  const frameRef = useRef(0);
  const tapRef = useRef({ downX: 0, downY: 0, moved: false, t: 0, pid: null });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const safeTop = w < 640 ? 118 : 92;
      const safeBottom = w < 640 ? 100 : 104;

      const usableH = Math.max(220, h - safeTop - safeBottom);
      const usable = Math.max(220, Math.min(w, usableH));

      const maxSize = isMobile ? 500 : 920;
      const minSize = isMobile ? 240 : 330;
      const ws = clamp(Math.floor(usable * (isMobile ? 0.78 : 0.86)), minSize, maxSize);
      setWrapSize(ws);

      const radiusFactor = isMobile ? 0.5 : 0.6;
      const r = clamp(Math.floor(ws * radiusFactor), isMobile ? 145 : 230, isMobile ? 285 : 600);
      setR(r);

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

  const cardW = isMobile ? clamp(66 * cardScale, 52, 86) : clamp(132 * cardScale, 104, 168);
  const cardH = isMobile ? cardW : clamp(98 * cardScale, 84, 122);

  const pointsById = useMemo(() => premiumSphereLayout(items, { isMobile }), [items, isMobile]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const nodes = Array.from(el.querySelectorAll("[data-card='1']"));
    cardNodesRef.current = nodes.map((node) => ({
      node,
      lon: Number(node.dataset.lon || 0),
      lat: Number(node.dataset.lat || 0),
      z: null,
      op: null,
      ds: null,
    }));
  }, [items.length]);

  // touch behavior
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    el.style.touchAction = "none";
    const onTouchMove = (e) => {
      if (drag.current.active || drag.current.pending) e.preventDefault();
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  // main RAF loop: smoother rotation
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const updateDepth = (themeNow, doFull) => {
      const nodes = cardNodesRef.current;
      if (!nodes || nodes.length === 0) return;

      const ry = (rot.current.y * Math.PI) / 180;
      const rx = (BASE_X * Math.PI) / 180;

      const sinY = Math.sin(ry),
        cosY = Math.cos(ry);
      const sinX = Math.sin(rx),
        cosX = Math.cos(rx);

      for (const it of nodes) {
        const node = it.node;
        const lon = it.lon;
        const lat = it.lat;

        const x = Math.sin(lon) * Math.cos(lat);
        const y = Math.sin(lat);
        const z = Math.cos(lon) * Math.cos(lat);

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const depth01 = clamp((z2 + 1) / 2, 0, 1);

        const zi = 100 + Math.round(depth01 * 900);
        if (it.z !== zi) {
          it.z = zi;
          node.style.zIndex = String(zi);
        }

        if (doFull) {
          const farDim = themeNow === "light" ? 0.93 : 0.9;
          const op = lerp(farDim, 1, depth01);
          const ds = lerp(0.992, 1.035, depth01);

          if (it.op == null || Math.abs(it.op - op) > 0.012) {
            it.op = op;
            node.style.opacity = String(op);
          }
          if (it.ds == null || Math.abs(it.ds - ds) > 0.0015) {
            it.ds = ds;
            node.style.setProperty("--depthScale", String(ds));
          }
        }
      }
    };

    const tick = (now) => {
      const rawDt = now - last;
      last = now;

      const dt = clamp(rawDt, 8, 28) / 16;

      const idle = !drag.current.active && now - lastInteract.current > 260;
      const auto = isMobile ? 0.022 : 0.04;
      const targetV = idle ? auto : 0;

      vel.current.y = lerp(vel.current.y, targetV, isMobile ? 0.06 : 0.045);

      const friction = isMobile ? 0.985 : 0.992;
      vel.current.y *= friction;

      rot.current.x = BASE_X;
      rot.current.y += vel.current.y * dt;

      if (innerRef.current) innerRef.current.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;

      const mod = isMobile ? 4 : 2;
      frameRef.current = (frameRef.current + 1) % mod;
      const doFull = frameRef.current === 0;
      updateDepth(theme, doFull);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, theme]);

  // pointer drag
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const THRESH = 6;

    const onDown = (e) => {
      const pressedCard = e.target?.closest?.("button[data-card='1']");

      drag.current.pointerType = e.pointerType || "mouse";
      drag.current.pid = e.pointerId;
      drag.current.lx = e.clientX;
      drag.current.startX = e.clientX;
      lastInteract.current = performance.now();

      drag.current.active = !pressedCard;
      drag.current.pending = !!pressedCard;

      if (!pressedCard) {
        e.preventDefault?.();
        try {
          el.setPointerCapture?.(e.pointerId);
        } catch {}
      }
    };

    const onMove = (e) => {
      if (drag.current.pid != null && e.pointerId !== drag.current.pid) return;
      if (!drag.current.active && !drag.current.pending) return;

      if (drag.current.active) e.preventDefault?.();

      const totalDx = e.clientX - (drag.current.startX ?? drag.current.lx);

      if (drag.current.pending && Math.abs(totalDx) > THRESH) {
        drag.current.pending = false;
        drag.current.active = true;
        tapRef.current.moved = true;

        try {
          el.setPointerCapture?.(e.pointerId);
        } catch {}
      }

      if (!drag.current.active) return;

      lastInteract.current = performance.now();
      const dx = e.clientX - drag.current.lx;
      drag.current.lx = e.clientX;

      const isTouch = drag.current.pointerType === "touch";
      const dragScale = isMobile ? (isTouch ? 0.22 : 0.14) : isTouch ? 0.24 : 0.16;

      rot.current.y += dx * dragScale;

      const impulse = dx * (isTouch ? 0.028 : 0.02);
      vel.current.y = lerp(vel.current.y, impulse, 0.35);
    };

    const onUp = (e) => {
      if (drag.current.pid != null && e.pointerId !== drag.current.pid) return;
      drag.current.active = false;
      drag.current.pending = false;
      drag.current.pid = null;
      lastInteract.current = performance.now();
    };

    el.addEventListener("pointerdown", onDown, { passive: false, capture: true });
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onDown, { capture: true });
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isMobile]);

  // wheel
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

      const s = isMobile ? 0.0018 : 0.0024;
      const impulse = primary * s;

      vel.current.y += impulse;
      rot.current.y += primary * (isMobile ? 0.0048 : 0.0065);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isMobile]);

  const specular =
    theme === "light"
      ? "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(255,255,255,0) 46%), linear-gradient(315deg, rgba(0,0,0,0.05), rgba(255,255,255,0) 58%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0) 48%), linear-gradient(315deg, rgba(255,210,140,0.03), rgba(0,0,0,0) 58%)";

  return (
    <div
      className="relative z-10 flex w-full items-center justify-center"
      style={{
        /* iOS-safe viewport height (fixes bottom drift on some Safari builds) */
        height: "100svh",
        minHeight: "100svh",
      }}
    >
      <div
        className="relative select-none"
        style={{
          width: wrapSize,
          height: wrapSize,
          perspective: isMobile ? "980px" : "1550px",
          WebkitPerspective: isMobile ? "980px" : "1550px",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
        }}
      >
        <motion.div
          className="relative h-full w-full"
          initial={{ opacity: 0, scale: 0.7, y: 26 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
        >
          <div
            ref={wrapRef}
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transform: "translateZ(0.01px)",
              WebkitTransform: "translateZ(0.01px)",
            }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ background: specular, opacity: theme === "light" ? 0.16 : 0.2 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: theme === "light" ? 0.16 : 0.2, scale: 1 }}
              transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
            />

            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}>
              <div ref={innerRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}>
                {items.map((it) => {
                  const p = pointsById.get(it.id) || { lon: 0, lat: 0 };

                  const facing = Math.cos(p.lon) * Math.cos(p.lat);
                  const facing01 = clamp((facing + 1) / 2, 0, 1);

                  const zBoost = facing * (isMobile ? 8 : 14);
                  const place = `rotateY(${(p.lon * 180) / Math.PI}deg) rotateX(${(-p.lat * 180) / Math.PI}deg) translateZ(${R + zBoost}px)`;

                  const pal = it.palette ?? pickPalette(it.company || it.title || it.id);

                  const aHot = theme === "dark" ? rgba(pal.a, 0.62) : rgba(pal.a, 0.48);
                  const bHot = theme === "dark" ? rgba(pal.b, 0.54) : rgba(pal.b, 0.4);
                  const rimA = theme === "dark" ? rgba(pal.a, 0.2) : rgba(pal.a, 0.18);
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
                  const secondary = it.type === "skill" ? it.company || "" : it.title || "";
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
                        WebkitTransformStyle: "preserve-3d",
                        transform: place,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault?.();
                        tapRef.current.downX = e.clientX;
                        tapRef.current.downY = e.clientY;
                        tapRef.current.moved = false;
                        tapRef.current.t = performance.now();
                        tapRef.current.pid = e.pointerId;

                        try {
                          e.currentTarget.setPointerCapture?.(e.pointerId);
                        } catch {}
                      }}
                      onPointerMove={(e) => {
                        if (tapRef.current.pid != null && e.pointerId !== tapRef.current.pid) return;
                        const dx = Math.abs(e.clientX - tapRef.current.downX);
                        const dy = Math.abs(e.clientY - tapRef.current.downY);
                        if (dx > 8 || dy > 8) tapRef.current.moved = true;
                      }}
                      onPointerUp={(e) => {
                        if (tapRef.current.pid != null && e.pointerId !== tapRef.current.pid) return;
                        e.stopPropagation();
                        e.preventDefault?.();
                        const dt = performance.now() - tapRef.current.t;

                        if (!tapRef.current.moved && dt < 700) onSelect(it, { x: e.clientX, y: e.clientY });

                        tapRef.current.pid = null;
                      }}
                      onPointerCancel={() => {
                        tapRef.current.pid = null;
                      }}
                    >
                      <motion.div
                        className="relative h-full w-full"
                        style={{ transform: "scale(var(--depthScale, 1))", transition: "transform 120ms ease" }}
                        whileHover={!isMobile ? { scale: 1.06, y: -2 } : undefined}
                        whileTap={!isMobile ? { scale: 0.985 } : undefined}
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

                          {/* ✅ class hook: disable blur on iOS only (prevents 3D flattening) */}
                          <div className="globe-blur absolute inset-0 backdrop-blur-[10px]" style={{ opacity: theme === "dark" ? 0.28 : 0.34 }} />

                          {isMobile ? (
                            <div className="relative flex h-full flex-col items-center justify-center gap-2 p-2">
                              <div
                                className={cn(
                                  "grid place-items-center rounded-2xl border font-extrabold tracking-wide",
                                  theme === "light"
                                    ? "border-black/15 bg-black/[0.07] text-black/92"
                                    : "border-white/14 bg-black/35 text-white/92"
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
                                      theme === "light"
                                        ? "border-black/15 bg-black/[0.07] text-black/92"
                                        : "border-white/14 bg-black/35 text-white/90"
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

                                <ArrowUpRight
                                  className={cn(
                                    "h-4 w-4 shrink-0 opacity-70 transition group-hover:opacity-100",
                                    theme === "light" ? "text-black/70" : "text-white/75"
                                  )}
                                />
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}