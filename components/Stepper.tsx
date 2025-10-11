"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StepperItem {
  id: string;
  title: string;
  eyebrow?: string;
  summary: string;
  bullets?: string[];
}

interface StepperProps {
  steps: StepperItem[];
  initialStep?: number;
  onStepChange?: (index: number, item: StepperItem) => void;
  animate?: boolean;
  className?: string;
}

export function Stepper({
  steps,
  initialStep = 0,
  onStepChange,
  animate = true,
  className
}: StepperProps) {
  const [current, setCurrent] = useState(initialStep);
  const [expanded, setExpanded] = useState(false);

  const goTo = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, steps.length - 1));
    setCurrent(safeIndex);
    setExpanded(false);
    onStepChange?.(safeIndex, steps[safeIndex]);
  };

  const currentStep = steps[current];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          {currentStep?.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
              {currentStep.eyebrow}
            </p>
          ) : null}
          <h3 className="text-xl font-semibold text-slate-800 sm:text-2xl">
            {currentStep?.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous insight"
            disabled={current === 0}
            onClick={() => goTo(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next insight"
            disabled={current === steps.length - 1}
            onClick={() => goTo(current + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={currentStep?.id}
          initial={animate ? { opacity: 0, y: 12 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          exit={animate ? { opacity: 0, y: -12 } : undefined}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-[0_25px_70px_-55px_rgba(32,118,199,0.3)]"
        >
          <p className="text-sm text-slate-600">{currentStep?.summary}</p>
          {currentStep?.bullets && currentStep.bullets.length > 0 ? (
            <div className="mt-4 space-y-3">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setExpanded((prev) => !prev)}
                className="gap-2"
                aria-expanded={expanded}
                aria-controls={`stepper-details-${currentStep?.id}`}
              >
                <Info className="h-4 w-4" />
                Learn more
              </Button>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.ul
                    id={`stepper-details-${currentStep?.id}`}
                    initial={animate ? { opacity: 0, height: 0 } : {}}
                    animate={animate ? { opacity: 1, height: "auto" } : {}}
                    exit={animate ? { opacity: 0, height: 0 } : {}}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-2 text-sm text-slate-600"
                  >
                    {currentStep.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div
        role="tablist"
        aria-label="Progress through thesis narrative"
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={index === current}
            onClick={() => goTo(index)}
            className={cn(
              "rounded-xl border border-transparent bg-white/70 px-4 py-3 text-left transition shadow-[0_18px_40px_-36px_rgba(32,118,199,0.35)]",
              index === current
                ? "border-sky-300 bg-sky-100/80 text-sky-800"
                : "text-slate-500 hover:border-sky-300 hover:text-sky-700"
            )}
          >
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="text-xs text-slate-500/90">{step.summary}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
