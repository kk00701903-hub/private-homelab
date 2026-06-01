import { useState } from 'react';

interface BrowserBarProps {
  url: string;
  className?: string;
}

export default function BrowserBar({ url, className = '' }: BrowserBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isHttps = url.startsWith('https');

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-600 ${className}`}>
      {/* 브라우저 상단 바 */}
      <div className="bg-slate-700 px-3 py-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="text-xs text-slate-500 ml-1 hidden sm:inline">브라우저</span>
      </div>
      {/* 주소창 */}
      <div className="bg-slate-800 px-3 py-2.5 flex items-center gap-2">
        {/* 자물쇠/경고 아이콘 */}
        <span className={`text-xs flex-shrink-0 ${isHttps ? 'text-amber-400' : 'text-slate-500'}`}>
          {isHttps ? '⚠' : '🔗'}
        </span>
        {/* URL 표시 */}
        <span className="flex-1 font-mono text-sm text-cyan-300 truncate select-all">{url}</span>
        {/* 복사 버튼 */}
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:text-white'
          }`}
        >
          {copied ? '✓ 복사됨' : '📋 복사'}
        </button>
      </div>
      {/* https 안내 */}
      {isHttps && (
        <div className="bg-slate-900 px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-amber-400 text-xs">⚠</span>
          <span className="text-xs text-slate-500">"연결이 안전하지 않습니다" 경고가 뜨면 → <strong className="text-slate-400">고급</strong> 클릭 → <strong className="text-slate-400">{url.replace('https://', '').split('/')[0]}(으)로 이동</strong> 클릭</span>
        </div>
      )}
    </div>
  );
}
