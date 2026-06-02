import { useState, useCallback } from 'react';

interface CodeBlockProps {
  code: string;
  label?: string;
}

const LABEL_CONFIG: Record<string, { icon: string; badge: string; desc: string }> = {
  'Proxmox Shell':              { icon: '⚙️', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', desc: 'Proxmox 웹 UI → homelab → Shell 탭' },
  'NAS VM SSH':                 { icon: '🗄️', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',       desc: 'NAS VM에 SSH로 접속한 터미널' },
  'AI VM SSH':                  { icon: '🤖', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', desc: 'AI VM에 SSH로 접속한 터미널' },
  '내 PC 터미널 (Windows PowerShell / macOS 터미널)': { icon: '💻', badge: 'bg-slate-600/50 text-slate-300 border-slate-500/40', desc: '내 PC에서 PowerShell 또는 터미널 앱 실행' },
  '내 PC 터미널':               { icon: '💻', badge: 'bg-slate-600/50 text-slate-300 border-slate-500/40',   desc: '내 PC에서 PowerShell 또는 터미널 앱 실행' },
  '브라우저 주소창':             { icon: '🌐', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',       desc: '크롬·엣지 등 브라우저 주소창에 입력' },
  '브라우저':                   { icon: '🌐', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',       desc: '크롬·엣지 등 브라우저 주소창에 입력' },
  '터미널':                     { icon: '💻', badge: 'bg-slate-600/50 text-slate-300 border-slate-500/40',   desc: '터미널(명령 창)에 입력' },
  'VM 콘솔 — IP 확인':          { icon: '🖥️', badge: 'bg-slate-600/50 text-slate-300 border-slate-500/40',   desc: 'Proxmox 웹 UI → VM 100 → Console 탭' },
  '내 PC 터미널 (PowerShell / macOS 터미널)': { icon: '💻', badge: 'bg-slate-600/50 text-slate-300 border-slate-500/40', desc: '내 PC의 PowerShell 또는 터미널 앱' },
  'NAS VM SSH — 설정 적용':     { icon: '🗄️', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',       desc: 'NAS VM SSH 터미널에서 실행' },
  'Proxmox Shell — 네트워크 재시작 및 IP 확인': { icon: '⚙️', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', desc: 'Proxmox 웹 UI → homelab → Shell 탭' },
};

function getLabelConfig(label: string) {
  if (LABEL_CONFIG[label]) return LABEL_CONFIG[label];
  if (label.startsWith('Proxmox Shell')) return LABEL_CONFIG['Proxmox Shell'];
  if (label.startsWith('NAS VM SSH'))    return LABEL_CONFIG['NAS VM SSH'];
  if (label.startsWith('AI VM SSH'))     return LABEL_CONFIG['AI VM SSH'];
  if (label.includes('브라우저'))        return LABEL_CONFIG['브라우저'];
  if (label.includes('터미널'))          return LABEL_CONFIG['터미널'];
  return null;
}

export default function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const cfg = label ? getLabelConfig(label) : null;

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700">
      {/* 헤더 */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {cfg ? (
            <>
              <span className="text-base flex-shrink-0">{cfg.icon}</span>
              <div className="min-w-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                  {label}
                </span>
                <span className="ml-2 text-xs text-slate-600 hidden sm:inline">{cfg.desc}</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-400 font-mono truncate">{label ?? 'Terminal'}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
          }`}
        >
          {copied ? '✓ 복사됨' : '📋 복사'}
        </button>
      </div>
      {/* 코드 */}
      <pre className="bg-slate-950 p-4 overflow-x-auto text-sm font-mono text-green-300 whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
