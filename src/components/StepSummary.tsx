interface StepSummaryProps {
  goal: string;
  time: string;
  difficulty: '쉬움' | '보통' | '어려움' | '보통~어려움';
  items: string[];
  result: string;
}

const DIFFICULTY_STYLE = {
  '쉬움':      { bar: 'bg-emerald-500', text: 'text-emerald-400', fill: 'w-1/3'  },
  '보통':      { bar: 'bg-amber-500',   text: 'text-amber-400',   fill: 'w-2/3'  },
  '어려움':    { bar: 'bg-red-500',     text: 'text-red-400',     fill: 'w-full' },
  '보통~어려움': { bar: 'bg-orange-500', text: 'text-orange-400',  fill: 'w-4/5'  },
};

export default function StepSummary({ goal, time, difficulty, items, result }: StepSummaryProps) {
  const d = DIFFICULTY_STYLE[difficulty] ?? DIFFICULTY_STYLE['보통'];
  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/60">
      {/* 헤더 */}
      <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700 flex flex-wrap gap-4 items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">이 단계 목표</p>
          <p className="text-white font-semibold text-sm leading-snug">{goal}</p>
        </div>
        <div className="flex gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-0.5">예상 시간</p>
            <p className="text-sm font-bold text-cyan-400">{time}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-0.5">난이도</p>
            <p className={`text-sm font-bold ${d.text}`}>{difficulty}</p>
          </div>
        </div>
      </div>
      {/* 할 일 목록 */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-3">이 단계에서 할 일</p>
        <div className="space-y-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 text-slate-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
              <span className="text-sm text-slate-300">{item}</span>
            </div>
          ))}
        </div>
        {/* 완료 후 결과 */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
          <span className="text-emerald-400 text-base flex-shrink-0">✓</span>
          <div>
            <span className="text-xs font-bold text-emerald-400">완료하면</span>
            <p className="text-sm text-emerald-300 mt-0.5">{result}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
