const HOURS = Array.from({ length: 24 }, (_, i) => i);

function isSleep(h: number): boolean {
  return h >= 23 || h < 8;
}

export default function NightModeTimeline() {
  return (
    <div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🌙</span>
        <span className="text-sm font-semibold text-white">야간 절전 스케줄 (23:00 ~ 08:00)</span>
      </div>
      <div className="flex gap-0.5">
        {HOURS.map(h => (
          <div key={h} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-6 rounded-sm w-full ${
                isSleep(h) ? 'bg-slate-700' : 'bg-gradient-to-b from-cyan-500 to-blue-600'
              }`}
              title={`${h}:00`}
            />
            {h % 6 === 0 && <span className="text-xs text-slate-500">{h}</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-b from-cyan-500 to-blue-600 inline-block" />
          동작 (08:00~23:00)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-700 inline-block" />
          절전 (23:00~08:00)
        </span>
      </div>
    </div>
  );
}
