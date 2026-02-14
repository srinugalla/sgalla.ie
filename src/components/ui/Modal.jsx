import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { clamp } from "../../utils/math";

export default function Modal({ open, onClose, title, children, theme = "dark", origin }) {
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
              className={cn("modal-panel w-[min(980px,92vw)] overflow-hidden rounded-3xl border shadow-[0_24px_110px_rgba(0,0,0,0.40)]", panel)}
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

              <div className={cn("max-h-[78svh] overflow-y-auto p-5 text-sm leading-6 modal-scroll", theme === "light" ? "text-black/80" : "text-white/75")}>
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
