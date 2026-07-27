export function PillarBar({ label, points, max }: { label: string; points: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((points / max) * 100)) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span className="font-mono text-xs text-muted">
          {points}/{max}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
