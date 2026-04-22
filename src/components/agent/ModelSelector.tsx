import { Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Model {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'ollama' | 'google';
}

const DEFAULT_MODELS: Model[] = [
  { id: 'claude-opus-4-5',            name: 'Claude Opus 4.5',   provider: 'anthropic' },
  { id: 'claude-sonnet-4-5',          name: 'Claude Sonnet 4.5', provider: 'anthropic' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'gpt-4o',                     name: 'GPT-4o',            provider: 'openai'    },
  { id: 'gpt-4o-mini',               name: 'GPT-4o Mini',       provider: 'openai'    },
  { id: 'mistral',                    name: 'Mistral (Ollama)',   provider: 'ollama'    },
];

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'text-orange-400',
  openai:    'text-green-400',
  ollama:    'text-purple-400',
  google:    'text-blue-400',
};

interface ModelSelectorProps {
  selected: string;
  onSelect: (model: string) => void;
  models?: Model[];
}

export function ModelSelector({ selected, onSelect, models = DEFAULT_MODELS }: ModelSelectorProps) {
  const current = models.find(m => m.id === selected) || models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800">
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">{current?.name}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 text-zinc-200">
        {(['anthropic', 'openai', 'ollama'] as const).map(provider => {
          const providerModels = models.filter(m => m.provider === provider);
          if (!providerModels.length) return null;
          return (
            <div key={provider}>
              <DropdownMenuLabel className={`text-xs uppercase tracking-wider ${PROVIDER_COLORS[provider]}`}>
                {provider}
              </DropdownMenuLabel>
              {providerModels.map(m => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className={`cursor-pointer hover:bg-zinc-800 ${m.id === selected ? 'bg-zinc-800' : ''}`}
                >
                  {m.name}
                  {m.id === selected && <span className="ml-auto text-pink-500">✓</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-zinc-700" />
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
