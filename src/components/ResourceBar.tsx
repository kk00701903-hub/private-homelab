interface ResourceBarProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  color: string;
}

export default function ResourceBar({ label, used, total, unit, color }: ResourceBarProps) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-slate-400 font-mono text-xs">
          {used}{unit} / {total}{unit}
        </span>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
