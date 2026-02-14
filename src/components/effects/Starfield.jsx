import React, { useEffect, useRef } from "react";
import { clamp } from "../../utils/math";

export default function Starfield({ density = 650, theme = "dark", isMobile = false }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const stars = useRef([]);
  const meteors = useRef([]);
  const sizeRef = useRef({ w: window.innerWidth, h: window.innerHeight });
  const lastT = useRef(0);
  const spawnAcc = useRef(0);
  const runningRef = useRef(true);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

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
      const target = Math.min(density, Math.max(isMobile ? 90 : 160, N));
      stars.current = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.0 + 0.12,
        a: Math.random() * 0.55 + 0.08,
        tw: Math.random() * 0.7 + 0.25,
        ph: Math.random() * Math.PI * 2,
      }));

      meteors.current = [];
    };

    const drawFrame = (t, { animate }) => {
      const { w, h } = sizeRef.current;
      const prev = lastT.current || t;
      lastT.current = t;
      const dt = Math.min(40, t - prev) / 1000;

      ctx.clearRect(0, 0, w, h);

      const starRGB = theme === "light" ? "0,0,0" : "255,255,255";
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, 60, w * 0.5, h * 0.5, Math.max(w, h) * 0.95);
      if (theme === "light") {
        vg.addColorStop(0, "rgba(0,0,0,0.02)");
        vg.addColorStop(1, "rgba(255,255,255,0)");
      } else {
        vg.addColorStop(0, "rgba(255,255,255,0.015)");
        vg.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars.current) {
        const tw = animate ? (0.6 + 0.4 * Math.sin((t / 1000) * s.tw + s.ph)) : 0.92;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${starRGB},${s.a * tw})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!animate) return;

      // meteors only on desktop
      const spawnMeteor = () => {
        const fromTop = Math.random() < 0.74;
        const x = fromTop ? Math.random() * w : -80;
        const y = fromTop ? -80 : Math.random() * (h * 0.55);

        const ang = (Math.PI / 180) * (22 + Math.random() * 18);
        const sp = (fromTop ? 980 : 860) * (0.85 + Math.random() * 0.4);

        meteors.current.push({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          age: 0,
          life: 0.55 + Math.random() * 0.35,
          len: 140 + Math.random() * 180,
          thick: 1.0 + Math.random() * 1.6,
        });
      };

      const drawMeteor = (m) => {
        const p = clamp(m.age / m.life, 0, 1);
        const fade = 1 - p;

        const mag = Math.max(0.001, Math.hypot(m.vx, m.vy));
        const ux = m.vx / mag;
        const uy = m.vy / mag;

        const x2 = m.x - ux * m.len;
        const y2 = m.y - uy * m.len;

        const g = ctx.createLinearGradient(m.x, m.y, x2, y2);
        if (theme === "light") {
          g.addColorStop(0, `rgba(0,0,0,${0.52 * fade})`);
          g.addColorStop(1, `rgba(0,0,0,0)`);
        } else {
          g.addColorStop(0, `rgba(255,255,255,${0.78 * fade})`);
          g.addColorStop(1, `rgba(255,255,255,0)`);
        }

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = g;
        ctx.lineWidth = m.thick;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = theme === "light" ? `rgba(0,0,0,${0.20 * fade})` : `rgba(255,255,255,${0.22 * fade})`;
        ctx.arc(m.x, m.y, 2.1 + m.thick * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      const area = w * h;
      const basePerSec = area < 450_000 ? 0.34 : area < 900_000 ? 0.28 : 0.22;
      spawnAcc.current += dt * basePerSec;

      while (spawnAcc.current > 1.0) {
        spawnAcc.current -= 1.0;
        if (meteors.current.length < 3) spawnMeteor();
        else if (Math.random() < 0.45 && meteors.current.length < 4) spawnMeteor();
      }

      const next = [];
      for (const m of meteors.current) {
        m.age += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        const alive = m.age < m.life;
        const near = m.x > -520 && m.x < w + 520 && m.y > -520 && m.y < h + 520;
        if (alive && near) {
          drawMeteor(m);
          next.push(m);
        }
      }
      meteors.current = next;
    };

    const drawLoop = (t) => {
      if (!runningRef.current) return;
      drawFrame(t, { animate: true });
      raf.current = requestAnimationFrame(drawLoop);
    };

    const onVis = () => {
      const hidden = document.hidden;
      runningRef.current = !hidden;
      cancelAnimationFrame(raf.current);

      if (!hidden && !isMobile) {
        lastT.current = performance.now();
        raf.current = requestAnimationFrame(drawLoop);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);

    if (isMobile) {
      // static draw once
      drawFrame(performance.now(), { animate: false });
    } else {
      raf.current = requestAnimationFrame(drawLoop);
    }

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf.current);
    };
  }, [density, theme, isMobile]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" />;
}
