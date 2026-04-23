import { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';

interface ApiConfig {
  ollamaModel: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('system');
  const [config, setConfig] = useState<ApiConfig>({
    ollamaModel: 'mistral',
  });
  const [saved, setSaved] = useState(false);

  // Load config from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('totum-config');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('totum-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todas as configurações?')) {
      localStorage.removeItem('totum-config');
      setConfig({ ollamaModel: 'mistral' });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
        <p className="text-sm text-gray-400">Gerencie suas integrações e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-6 mt-0">
        {['system', 'appearance', 'about'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === tab
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={activeTab === tab ? { borderBottomColor: '#ff006e' } : {}}
          >
            {tab === 'system' ? 'Sistema' : tab === 'appearance' ? 'Aparência' : 'Sobre'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'system' && (
          <div className="space-y-6 max-w-2xl">
            {/* Ollama info */}
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <h3 className="text-sm font-medium text-white mb-1">Ollama (VPS)</h3>
              <p className="text-xs text-gray-500 mb-3">
                O Ollama está configurado no servidor VPS e acessível via proxy <code className="text-pink-400">/api/ollama</code>.
                Não é necessária nenhuma URL manual.
              </p>
              <label className="block text-sm font-medium text-white mb-2">Modelo Padrão</label>
              <input
                type="text"
                value={config.ollamaModel}
                onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value })}
                placeholder="mistral"
                className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-500 mt-2">Ex: mistral, neural-chat, llama2</p>
            </div>

            {/* Save Status */}
            {saved && (
              <div className="p-3 rounded-lg bg-green-900/30 border border-green-500/30 text-green-300 text-sm">
                ✓ Configurações salvas com sucesso!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #ff006e 0%, #d7007d 100%)' }}
              >
                <Save size={18} /> Salvar
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 font-medium transition hover:bg-red-500/10"
              >
                <Trash2 size={18} /> Limpar
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="max-w-2xl">
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <h3 className="text-white font-medium mb-4">Tema</h3>
              <p className="text-gray-400 text-sm">Tema escuro aplicado globalmente. Modo claro em desenvolvimento.</p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl space-y-4">
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <h3 className="text-white font-medium mb-2">TOTUM AGENT</h3>
              <p className="text-gray-400 text-sm">v2.0.0</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <h3 className="text-white font-medium mb-2">Stack</h3>
              <p className="text-gray-400 text-sm">
                React + Vite + TypeScript · Ollama (Mistral) · OpenCode · WebSocket
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
