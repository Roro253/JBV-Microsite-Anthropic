interface PaneRouterProps {
  pane?: string | null;
  mode?: string | null;
}

type PaneProps = { searchParams?: Record<string, string | string[] | undefined> };

type PaneModule = {
  default: (props: PaneProps) => JSX.Element | null | Promise<JSX.Element | null>;
};

type PaneLoader = () => Promise<PaneModule>;

const paneLoaders: Record<string, PaneLoader> = {
  anthropic: () => import("@/app/@pane/(microsites)/anthropic/page"),
  openai: () => import("@/app/@pane/(microsites)/openai/page"),
  xai: () => import("@/app/@pane/(microsites)/xai/page")
};

export async function PaneRouter({ pane, mode }: PaneRouterProps) {
  if (!pane) return null;
  const loader = paneLoaders[pane];
  if (!loader) return null;

  const paneModule = await loader();
  const PaneComponent = paneModule.default;
  if (!PaneComponent) return null;

  return <PaneComponent searchParams={{ mode: mode ?? undefined }} />;
}
