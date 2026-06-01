import { useState } from 'react';

interface ChecklistProps {
  items: string[];
}

export default function Checklist({ items }: ChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false));

  const toggle = (i: number) =>
    setChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  const done = checked.filter(Boolean).length;

  return (
    <div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-300">체크리스트</span>
        <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-400">
          {done}/{items.length} 완료
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </div>
      {items.map((item, i) => (
        <label key={i} className="flex items-start gap-3 mb-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() => toggle(i)}
            className="mt-0.5 w-4 h-4 accent-cyan-500 cursor-pointer flex-shrink-0"
          />
          <span
            className={`text-sm transition-colors ${
              checked[i]
                ? 'line-through text-slate-500'
                : 'text-slate-300 group-hover:text-white'
            }`}
          >
            {item}
          </span>
        </label>
      ))}
    </div>
  );
}
