"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

type Brand = "anthropic" | "openai" | "xai";

export function ExplorerBackdrop({ active, brand, className }: { active: boolean; brand: Brand; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  if (!active) return null;

  const palettes: Record<Brand, string[]> = {
    anthropic: [
      "rgba(56,189,248,0.28)", // sky-400
      "rgba(99,102,241,0.22)", // indigo-500
      "rgba(251,191,36,0.18)" // amber-400
    ],
    openai: [
      "rgba(14,165,233,0.28)", // sky-500
      "rgba(2,132,199,0.20)", // sky-600
      "rgba(125,211,252,0.18)" // sky-300
    ],
    xai: [
      "rgba(99,102,241,0.28)", // indigo-500
      "rgba(14,165,233,0.20)", // sky-500
      "rgba(76,29,149,0.14)" // violet-900
    ]
  };

  const [a, b, c] = palettes[brand];

  const layers = [
    { x: "-10%", y: "-20%", size: 520, color: a, rotate: 12 },
    { x: "60%", y: "-10%", size: 460, color: b, rotate: -8 },
    { x: "20%", y: "40%", size: 640, color: c, rotate: 6 }
  ];

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      {!prefersReducedMotion ? (
        layers.map((layer, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0.35, x: 0, y: 0, rotate: layer.rotate }}
            animate={{
              opacity: [0.28, 0.42, 0.28],
              x: ["0%", "4%", "0%"],
              y: ["0%", "-2%", "0%"],
              rotate: [layer.rotate, layer.rotate + 2, layer.rotate]
            }}
            transition={{ duration: 12 + idx * 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: layer.x,
              top: layer.y,
              width: layer.size,
              height: layer.size,
              background: `radial-gradient(circle at center, ${layer.color} 0%, rgba(255,255,255,0) 60%)`,
              filter: "blur(40px)"
            }}
          />
        ))
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              `radial-gradient(1200px 600px at -10% -20%, ${a} 0%, transparent 60%),` +
              `radial-gradient(900px 500px at 60% -10%, ${b} 0%, transparent 60%),` +
              `radial-gradient(1100px 700px at 20% 40%, ${c} 0%, transparent 60%)`
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/40" />
    </div>
  );
}
