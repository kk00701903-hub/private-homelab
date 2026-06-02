interface WhereBoxProps {
  where: string;
  how: string;
}

const WHERE_CONFIG: Record<string, { icon: string; color: string; border: string; badge: string }> = {
  '내 PC 브라우저':      { icon: '🌐', color: 'bg-blue-900/20',   border: 'border-blue-500/40',   badge: 'bg-blue-500/20 text-blue-300' },
  '내 PC 터미널':        { icon: '💻', color: 'bg-slate-800/60',  border: 'border-slate-600',     badge: 'bg-slate-700 text-slate-300' },
  'Proxmox 웹 UI Shell': { icon: '⚙️', color: 'bg-orange-900/20', border: 'border-orange-500/40', badge: 'bg-orange-500/20 text-orange-300' },
  'NAS VM SSH':          { icon: '🗄️', color: 'bg-cyan-900/20',   border: 'border-cyan-500/40',   badge: 'bg-cyan-500/20 text-cyan-300' },
  'AI VM SSH':           { icon: '🤖', color: 'bg-purple-900/20', border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-300' },
  '공유기 관리 페이지':   { icon: '🔧', color: 'bg-teal-900/20',   border: 'border-teal-500/40',   badge: 'bg-teal-500/20 text-teal-300' },
};

export default function WhereBox({ where, how }: WhereBoxProps) {
  const cfg = WHERE_CONFIG[where] ?? { icon: '📌', color: 'bg-slate-800/60', border: 'border-slate-600', badge: 'bg-slate-700 text-slate-300' };
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.color} ${cfg.border} mb-2 mt-4`}>
      <span className="text-lg flex-shrink-0">{cfg.icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500">어디서?</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{where}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{how}</p>
      </div>
    </div>
  );
}
