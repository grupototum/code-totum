import React from 'react';
import { Button } from './../../components/ui/button';

interface CodeBlockProps {
  code: string;
  language?: string;
  onCopy?: () => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'plaintext',
  onCopy,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-lg overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
        <span className="text-xs font-mono text-slate-400">{language}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="text-xs"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};
