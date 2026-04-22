import { useState, useEffect } from 'react';
import { Save, Trash2, Eye, EyeOff } from 'lucide-react';

interface ApiConfig {
  claudeApiKey: string;
  openaiApiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('system');
  const [config, setConfig] = useState<ApiConfig>({
    claudeApiKey: '',
    openaiApiKey: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'mistral',
  });
  const [showKeys, setShowKeys] = useState({
    claude: false,
    openai: false,
  });
  const [saved, setSaved] = useState(false);

  // Load config from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('totum-api-keys');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('totum-api-keys', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todas as configurações?')) {
      localStorage.removeItem('totum-api-keys');
      setConfig({
        claudeApiKey: '',
        openaiApiKey: '',
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'mistral',
      });
    }
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    return key.substring(0, 8) + '*'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
        <p className="text-sm text-gray-400">Gerencie suas integrações e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-6 mt-6">
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'system'
              ? 'text-white border-b-2'
              : 'text-gray-400 hover:text-white'
          }`}
          style={activeTab === 'system' ? { borderBottomColor: '#ff006e' } : {}}
        >
          Sistema
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'appearance'
              ? 'text-white border-b-2'
              : 'text-gray-400 hover:text-white'
          }`}
          style={activeTab === 'appearance' ? { borderBottomColor: '#ff006e' } : {}}
        >
          Aparência
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'about'
              ? 'text-white border-b-2'
              : 'text-gray-400 hover:text-white'
          }`}
          style={activeTab === 'about' ? { borderBottomColor: '#ff006e' } : {}}
        >
          Sobre
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'system' && (
          <div className="space-y-6 max-w-2xl">
            {/* Claude API Key */}
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <label className="block text-sm font-medium text-white mb-2">Claude API Key</label>
              <div className="flex gap-2">
                <input
                  type={showKeys.claude ? 'text' : 'password'}
                  value={config.claudeApiKey}
                  onChange={(e) => setConfig({ ...config, claudeApiKey: e.target.value })}
                  placeholder="sk-ant-..."
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, claude: !showKeys.claude })}
                  className="px-3 py-2 text-gray-400 hover:text-white transition"
                >
                  {showKeys.claude ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Obtenha em: https://console.anthropic.com</p>
            </div>

            {/* OpenAI API Key */}
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <label className="block text-sm font-medium text-white mb-2">OpenAI API Key</label>
              <div className="flex gap-2">
                <input
                  type={showKeys.openai ? 'text' : 'password'}
                  value={config.openaiApiKey}
                  onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                  className="px-3 py-2 text-gray-400 hover:text-white transition"
                >
                  {showKeys.openai ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Obtenha em: https://platform.openai.com</p>
            </div>

            {/* Ollama Configuration */}
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <label className="block text-sm font-medium text-white mb-2">Ollama Host URL</label>
              <input
                type="text"
                value={config.ollamaUrl}
                onChange={(e) => setConfig({ ...config, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-2">URL do servidor Ollama (local ou remoto via VPS)</p>
            </div>

            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <label className="block text-sm font-medium text-white mb-2">Modelo Ollama Padrão</label>
              <input
                type="text"
                value={config.ollamaModel}
                onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value })}
                placeholder="mistral"
                className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <h3 className="text-white font-medium mb-2">TOTUM CODE</h3>
              <p className="text-gray-400 text-sm">v1.0.0</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
              <h3 className="text-white font-medium mb-2">Sobre</h3>
              <p className="text-gray-400 text-sm">
                Workspace de desenvolvimento alimentado por IA. Integrado com Claude, OpenAI e modelos locais via Ollama.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
