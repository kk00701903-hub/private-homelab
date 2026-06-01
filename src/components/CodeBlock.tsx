import { useState, useCallback } from 'react';

interface CodeBlockProps {
  code: string;
  label?: string;
}

export default function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
        <span className="text-xs text-slate-400 font-mono">{label ?? 'Terminal'}</span>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <pre className="bg-slate-900 p-4 overflow-x-auto text-sm font-mono text-green-300 whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
