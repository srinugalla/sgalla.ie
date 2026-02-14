import { useEffect, useState } from "react";
import { clamp } from "../utils/math";

export function useBinaryReveal(finalText, key, { durationMs = 1200, settleMs = 200 } = {}) {
  const [text, setText] = useState(finalText);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const chars = String(finalText).split("");
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
