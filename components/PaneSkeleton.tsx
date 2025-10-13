export function PaneSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-2/3 rounded-lg bg-slate-200/60" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-slate-200/60" />
        <div className="h-4 w-11/12 rounded bg-slate-200/50" />
        <div className="h-4 w-10/12 rounded bg-slate-200/40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl border border-white/60 bg-white/70" />
        ))}
      </div>
    </div>
  );
}
