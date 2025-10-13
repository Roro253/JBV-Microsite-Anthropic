# Anthropic — JBV Capital Microsite

Production-ready Next.js 15 App Router experience for JBV Capital's Anthropic diligence microsite. Built with TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand state, Zod content validation, Recharts visualizations, and Next SEO instrumentation.

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Duplicate `.env.local.example` to `.env.local` and populate the URLs:
   ```bash
   cp .env.local.example .env.local
   ```
3. Run the dev server:
   ```bash
   pnpm dev
   ```
   The site is available at `http://localhost:3000` with `/` (Narrative Entry Portal) and `/anthropic` (microsite).

## Available Scripts

| Command           | Description                                  |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Start the Next.js development server         |
| `pnpm build`      | Create a production build                    |
| `pnpm start`      | Launch the production server                 |
| `pnpm lint`       | Run ESLint across the project                |
| `pnpm test`       | Execute Vitest unit tests (financial math)   |
| `pnpm test:coverage` | Generate coverage via Vitest             |

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Secret used to sign session tokens for authenticated requests. |
| `AIRTABLE_API_KEY` | Airtable personal access token with read access to the Contacts table. |
| `AIRTABLE_BASE_ID` | (Optional) Override for the Airtable base ID; defaults to `appAswQzYFHzmwqGH`. |
| `AIRTABLE_TABLE_ID` | (Optional) Override for the Airtable table ID; defaults to `tblxmUCsZcHOZiL1K`. |
| `SENDGRID_API_KEY` | SendGrid API key used to dispatch transactional magic link emails. |
| `SENDGRID_FROM_EMAIL` | (Optional) Verified SendGrid sender email; defaults to `jb@jbv.com`. |
| `NEXT_PUBLIC_SITE_URL` | Public base URL used when generating magic links (falls back to request origin). |
| `NEXT_PUBLIC_TYPEFORM_URL` | External Typeform Reserve Interest form. |
| `NEXT_PUBLIC_CALENDLY_URL` | Calendly 15-minute diligence booking link. |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `true` to enable Vercel Analytics, otherwise omit rendering. |

## Data & Content Pipeline

- Primary content lives in `data/anthropic.json` and is validated with Zod via `lib/data.ts`.
- When editing JSON, keep the required keys intact. Missing fields trigger console warnings and fallback copy.
- Update KPI `as_of` dates and values monthly. Suggested cadence: the first business day of each month.
- Sources are rendered directly in `SourceFootnotes`; maintain up-to-date URLs when metrics change.

### Monthly Refresh Checklist

1. Refresh KPIs and `as_of` dates with latest verified metrics.
2. Review `differentiators` and `use_cases` for new narrative angles.
3. Add or rotate 1–2 items in the commentary feed as needed.
4. Confirm `last_updated` reflects the refresh date.

## Content QA Checklist

- [ ] Mode toggle persists between sessions and updates copy.
- [ ] `/` hero animations degrade when `prefers-reduced-motion` is enabled.
- [ ] Return simulator sliders cover 0.2–2.0% ownership, export math (MOIC/IRR) verified.
- [ ] Portfolio Fit wizard produces deterministic profile and rationale.
- [ ] External CTAs open in a new tab with `rel="noopener"`.
- [ ] next-seo metadata renders expected OG/Twitter tags (`/og/anthropic.png`).
- [ ] Lighthouse targets: Performance >90, Accessibility >95, Best Practices >95, SEO >95.
- [ ] Vercel Analytics only loads when `NEXT_PUBLIC_ANALYTICS_ENABLED=true`.

## Deployment Notes

- `next.config.js` whitelists remote image domains for brand assets.
- Heavy client visualizations (Recharts simulator) load via dynamic import to keep TTFB low.
- `public/og/anthropic.png` powers Open Graph/Twitter cards.

For additional styling tokens or shadcn component scaffolding, edit `tailwind.config.ts`, `components.json`, and `lib/utils.ts`.
