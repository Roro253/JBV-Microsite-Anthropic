export function PaneSkeleton() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[75] flex justify-end bg-slate-900/10">
      <div className="h-full w-full max-w-[min(48vw,760px)] bg-white/80 px-6 py-10 shadow-2xl ring-1 ring-slate-200/80 backdrop-blur md:rounded-l-[32px]">
        <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 flex gap-3">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="mt-6 flex-1 space-y-3 overflow-hidden rounded-3xl border border-slate-100/80 bg-white/70 p-6">
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
          <div className="h-full rounded-2xl border border-dashed border-slate-200" />
        </div>
      </div>
    </div>
  );
}
