"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Building2, DollarSign, Sparkles } from "lucide-react";

import { CallToAction } from "@/components/CallToAction";
import { KpiTile } from "@/components/KpiTile";
import { NewsFeed, type NewsItem } from "@/components/NewsFeed";
import { PortfolioFit } from "@/components/PortfolioFit";
import { Section } from "@/components/Section";
import { SourceFootnotes } from "@/components/SourceFootnotes";
import { StatPill } from "@/components/StatPill";
import { Stepper, type StepperItem } from "@/components/Stepper";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore } from "@/lib/store/ui";
import { formatCurrency } from "@/lib/utils";
import type { AnthropicData } from "@/lib/data";

const ReturnSimulator = dynamic(
  () => import("@/components/ReturnSimulator").then((mod) => mod.ReturnSimulator),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 w-full items-center justify-center rounded-3xl border border-sky-200 bg-white/85 text-slate-500">
        Loading simulator…
      </div>
    )
  }
);

interface AnthropicExperienceProps {
  data: AnthropicData;
}

export function AnthropicExperience({ data }: AnthropicExperienceProps) {
  const mode = useUIStore((state) => state.mode);
  const prefersReducedMotion = useReducedMotion();
  const [portfolioSummary, setPortfolioSummary] = useState<string | null>(null);

  const runRateBillions = data.kpis.run_rate_revenue.value / 1_000_000_000;
  const valuationBillions = data.kpis.valuation.value / 1_000_000_000;
  const fundingSparkline = useMemo(
    () => [4, 6.5, 10, 13],
    []
  );

  const stepperItems: StepperItem[] = [
    {
      id: "vision",
      eyebrow: "Vision",
      title: "Constitutional AI north star",
      summary:
        "Anthropic encodes constitutional guardrails to deliver steerable intelligence that enterprises can deploy inside regulated workflows.",
      bullets: [
        "Core principles mapped to industry-grade compliance controls",
        "Reward model tuned for debiasing, refusal, and self-critique",
        "Governance via Long-Term Benefit Trust keeps incentives aligned"
      ]
    },
    {
      id: "traction",
      eyebrow: "Traction",
      title: "Enterprise adoption flywheel",
      summary:
        "Run-rate surpassing $5B ARR with distribution across AWS Bedrock and Google Cloud unlocks hyperscaler attach and wallet expansion.",
      bullets: [
        data.kpis.enterprise_adoption_notes,
        "Claude 3.5 family delivering long-context loyalty in consulting, finance, and policy stacks",
        "API-first approach accelerates regulated deployments"
      ]
    },
    {
      id: "moat",
      eyebrow: "Moat",
      title: "Governance-advantaged moat",
      summary:
        "PBC structure and recursive alignment research harden Anthropic's moat as institutional buyers demand safety-first partners.",
      bullets: [
        "PBC charter enshrines mission over short-term monetization",
        "Claude's long-context leadership enables differentiated enterprise copilot workflows",
        "Hyperscaler capital stack funds compute scale at favorable terms"
      ]
    }
  ];

  const commentary: NewsItem[] = useMemo(
    () => [
      {
        title: "Anthropic raises $13B Series F at $183B valuation",
        publisher: "Reuters",
        date: "Sept 2, 2025",
        whyItMatters:
          "Confirms flagship investors backing safe frontier AI while compressing time-to-scale on revenue milestones.",
        url: "https://www.reuters.com/business/anthropics-valuation-more-than-doubles-183-billion-after-13-billion-fundraise-2025-09-02/"
      },
      {
        title: "Amazon completes full $4B commitment and expands Bedrock rollout",
        publisher: "Amazon",
        date: "Sept 2025",
        whyItMatters:
          "Cements AWS as a core channel for Anthropic, pairing Claude with mission-critical enterprise workloads.",
        url: "https://www.aboutamazon.com/news/company-news/amazon-anthropic-ai-investment"
      },
      {
        title: "Google adds $1B strategic capital for Anthropic",
        publisher: "Ars Technica",
        date: "Jan 2025",
        whyItMatters:
          "Dual hyperscaler sponsorship de-risks compute, marketing, and sovereign rollouts.",
        url: "https://arstechnica.com/ai/2025/01/google-increases-investment-in-anthropic-by-another-1-billion/"
      },
      {
        title: "Anthropic details constitutional AI governance",
        publisher: "Anthropic",
        date: "May 2025",
        whyItMatters:
          "Offers regulated buyers transparent operating playbooks for safe deployment.",
        url: "https://www.anthropic.com/news/claudes-constitution"
      },
      {
        title: "Anthropic opens India office to scale safety teams",
        publisher: "Reuters",
        date: "Oct 8, 2025",
        whyItMatters:
          "Extends go-to-market and policy engagement while anchoring regional safety talent.",
        url: "https://www.reuters.com/technology/anthropic-opens-india-office-2025-10-08/"
      }
    ],
    []
  );

  const heroCopy =
    mode === "explorer" ? data.modes.explorer.story : data.modes.investor.thesis;
  const isInvestor = mode === "investor";

  return (
    <div className="flex flex-col gap-10">
      <Section
        eyebrow={data.company.structure}
        title={`${data.company.name} — ${data.company.tagline}`}
        description={heroCopy}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-sky-300/60 bg-gradient-to-br from-sky-200/70 via-indigo-200/60 to-orange-200/50 shadow-[0_20px_40px_-28px_rgba(32,118,199,0.6)]">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anthropic_logo.svg/2560px-Anthropic_logo.svg.png"
                alt="Anthropic logo"
                fill
                className="object-contain p-3"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-600">
                Public Benefit Corporation
              </p>
              <h1 className="text-3xl font-semibold text-slate-800">
                Enterprise-grade, safety-first frontier AI.
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatPill
              label="Valuation"
              value={`$${valuationBillions.toFixed(0)}B post-money`}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatPill
              label="Series F"
              value={formatCurrency(data.kpis.recent_round.amount, {
                maximumFractionDigits: 0
              })}
              icon={<Sparkles className="h-4 w-4" />}
            />
            <StatPill
              label="Run-rate"
              value={`$${runRateBillions.toFixed(1)}B ARR`}
              icon={<Building2 className="h-4 w-4" />}
            />
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Pulseboard"
        title="Hyperscaler-backed traction"
        description="Key indicators of Anthropic's scale as a safety-led frontier partner."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <KpiTile
            title="Run-rate revenue"
            value={`$${runRateBillions.toFixed(1)}B`}
            subtitle="Claude platform ARR"
            asOf="Aug 2025"
            animate={!prefersReducedMotion}
          />
          <KpiTile
            title="Post-money valuation"
            value={`$${valuationBillions.toFixed(0)}B`}
            subtitle="Series F led by ICONIQ"
            asOf="Sept 2025"
            animate={!prefersReducedMotion}
          />
          <KpiTile
            title="Cloud backers"
            value={
              <div className="flex flex-wrap gap-2">
                {data.kpis.cloud_backers.map((cloud) => (
                  <Badge key={cloud} variant="secondary" className="text-xs">
                    {cloud}
                  </Badge>
                ))}
              </div>
            }
            subtitle="AWS Bedrock + Google Cloud distribution"
          />
          <KpiTile
            title="Funding velocity"
            value="Velocity"
            subtitle="Quarterly capital deployment"
            sparkline={mode === "investor" ? fundingSparkline : undefined}
            animate={!prefersReducedMotion && mode === "investor"}
          />
        </div>
      </Section>

      <Section
        eyebrow="Narrative walkthrough"
        title="Anthropic thesis synthesis"
        description="Toggle through the investor-grade storyline or let explorer mode carry the narrative."
      >
        <Stepper
          steps={stepperItems}
          initialStep={mode === "investor" ? 1 : 0}
          animate={!prefersReducedMotion}
        />
      </Section>

      {isInvestor ? (
        <>
          <Section
            eyebrow="Capital planning"
            title="Model forward returns"
            description="Adjust entry, ownership, dilution, and exit to visualize Anthropic's potential MOIC and IRR."
          >
            <ReturnSimulator animate={!prefersReducedMotion} />
          </Section>

          <Section
            eyebrow="Portfolio design"
            title="Match Anthropic to your mandate"
            description="Three quick prompts calibrate the Anthropic allocation recommendation."
          >
            <PortfolioFit
              animate={!prefersReducedMotion}
              onResult={(result) => setPortfolioSummary(result.profile)}
            />
            {portfolioSummary ? (
              <p className="text-sm text-sky-600">
                Suggested profile: {portfolioSummary}. Tailor follow-on pacing with Claude roadmap catalysts and hyperscaler incentives.
              </p>
            ) : null}
          </Section>

          <Section
            eyebrow="Next steps"
            title="Engage JBV Capital"
            description="Unlock diligence pathways and expedition-level coverage across Anthropic's roadmap."
          >
            <CallToAction
              reserveUrl={data.links.reserve_interest}
              diligenceUrl={data.links.book_diligence}
            />
          </Section>
        </>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <Section
            eyebrow="Differentiators"
            title="Why Claude compounds value"
            description="Signals JBV Capital tracks when underwriting Anthropic as a core holding."
          >
            <ul className="grid gap-4 md:grid-cols-2">
              {data.differentiators.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-sky-100 bg-white/85 p-4 text-sm text-slate-600 shadow-[0_20px_60px_-48px_rgba(32,118,199,0.3)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Section>
          <Section
            eyebrow="Use cases"
            title="Enterprise workload coverage"
            description="Where JBV Capital diligence sees Anthropic displacing incumbent workflows."
          >
            <ul className="grid gap-3 md:grid-cols-2">
              {data.use_cases.map((useCase) => (
                <li
                  key={useCase}
                  className="rounded-2xl border border-sky-100 bg-white/85 p-4 text-sm text-slate-600 shadow-[0_20px_60px_-48px_rgba(32,118,199,0.3)]"
                >
                  {useCase}
                </li>
              ))}
            </ul>
          </Section>
          <SourceFootnotes sources={data.sources} />
        </div>
        <div className="space-y-6">
          <NewsFeed items={commentary} />
          {isInvestor ? (
            <Section
              eyebrow="SPV terms"
              title="Illustrative SPV snapshot"
              description="Indicative term sheet for Anthropic exposure (final docs gated)."
            >
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  <strong>Minimum check:</strong> {formatCurrency(data.spv_terms.min_check_usd)}
                </p>
                <p>
                  <strong>Fees:</strong> {data.spv_terms.fees}
                </p>
                <p>
                  <strong>Closing target:</strong> {data.spv_terms.closing_target}
                </p>
                <p className="text-xs text-slate-500">{data.spv_terms.docs_note}</p>
              </div>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
