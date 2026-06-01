import type { ReactNode } from 'react';

interface NoteProps {
  type: 'tip' | 'warn' | 'info';
  children: ReactNode;
}

const NOTE_STYLES = {
  tip:  { bg: 'bg-emerald-900/30', border: 'border-emerald-500/50', icon: '💡', label: '팁',  text: 'text-emerald-300' },
  warn: { bg: 'bg-amber-900/30',   border: 'border-amber-500/50',   icon: '⚠️', label: '주의', text: 'text-amber-300'   },
  info: { bg: 'bg-cyan-900/30',    border: 'border-cyan-500/50',    icon: 'ℹ️', label: '참고', text: 'text-cyan-300'    },
} as const;

export default function Note({ type, children }: NoteProps) {
  const s = NOTE_STYLES[type];
  return (
    <div className={`my-3 p-3 rounded-lg border ${s.bg} ${s.border}`}>
      <span className={`font-bold text-sm ${s.text}`}>{s.icon} {s.label}{'  '}</span>
      <span className="text-slate-300 text-sm">{children}</span>
    </div>
  );
}
