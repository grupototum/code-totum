import { useState } from 'react';
import { Brain, ArrowRight, Github, Star, GitFork, FileCode, AlertCircle } from 'lucide-react';

interface RepoInfo {
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  topics: string[];
}

interface AnalysisResult {
  status: 'idle' | 'loading' | 'complete' | 'error';
  repo?: RepoInfo;
  analysis?: string;
  error?: string;
}

const exampleRepos = [
  { owner: 'grupototum', repo: 'ERP', description: 'ERP Totum' },
  { owner: 'grupototum', repo: 'code-totum', description: 'Este app' },
  { owner: 'facebook', repo: 'react', description: 'A JavaScript library for building UI' },
];

export default function Ada() {
  const [repoInput, setRepoInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult>({ status: 'idle' });

  const handleAnalyze = async () => {
    if (!repoInput.trim()) return;
    const parts = repoInput.trim().replace('https://github.com/', '').split('/');
    if (parts.length < 2) {
      setAnalysis({ status: 'error', error: 'Formato inválido. Use: owner/repository' });
      return;
    }
    const [owner, repo] = parts;
    setAnalysis({ status: 'loading' });

    try {
      // 1. Buscar info do repositório via GitHub API pública
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!repoRes.ok) throw new Error(`Repositório não encontrado (${repoRes.status})`);
      const repoData: RepoInfo = await repoRes.json();

      // 2. Buscar linguagens
      const langsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
      const langs = langsRes.ok ? await langsRes.json() : {};
      const langList = Object.entries(langs as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang);

      // 3. Analisar via Ollama
      const prompt = `Analise este repositório GitHub e dê um relatório técnico em PT-BR:

Nome: ${repoData.full_name}
Descrição: ${repoData.description || 'N/A'}
Linguagem principal: ${repoData.language || 'N/A'}
Todas as linguagens: ${langList.join(', ') || 'N/A'}
Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count} | Issues abertas: ${repoData.open_issues_count}
Tamanho: ${Math.round(repoData.size / 1024)} MB
Topics: ${repoData.topics?.join(', ') || 'N/A'}

Forneça:
1. Avaliação de complexidade (Baixa/Média/Alta) com justificativa
2. 3 pontos de atenção técnica específicos para ESTE repositório
3. 3 sugestões de melhoria específicas para ESTE repositório

Seja direto e específico, não genérico.`;

      const ollamaRes = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral', prompt, stream: false }),
      });

      const text = await ollamaRes.text();
      const ollamaData = JSON.parse(text);
      const analysisText = ollamaData.response || 'Análise indisponível.';

      setAnalysis({ status: 'complete', repo: repoData, analysis: analysisText });
    } catch (err) {
      setAnalysis({ status: 'error', error: err instanceof Error ? err.message : 'Erro desconhecido' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain size={24} /> ADA
        </h2>
        <p className="text-sm text-gray-400">Analisador inteligente de código com IA</p>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto w-full">
          <div className="mb-8 space-y-4">
            <label className="block text-sm font-medium text-white mb-3">Repositório GitHub</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="owner/repository (ex: grupototum/ERP)"
                className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition"
                style={{ background: 'rgba(30, 30, 40, 0.5)' }}
              />
              <button
                onClick={handleAnalyze}
                disabled={analysis.status === 'loading' || !repoInput.trim()}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition hover:opacity-80 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #9333ea 0%, #6d28d9 100%)' }}
              >
                <span>Analisar com ADA</span>
                {analysis.status === 'loading' ? <div className="animate-spin">⌛</div> : <ArrowRight size={18} />}
              </button>
            </div>

            {analysis.status === 'error' && (
              <div className="p-4 rounded-lg border border-red-500/30 bg-red-900/20 flex gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{analysis.error}</p>
              </div>
            )}

            {analysis.status === 'loading' && (
              <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-900/20">
                <p className="text-sm text-purple-300">⏳ Buscando dados e analisando com Mistral... (pode levar 30-60s)</p>
              </div>
            )}

            {analysis.status === 'complete' && analysis.repo && (
              <div className="space-y-4 mt-4">
                {/* Repo info card */}
                <div className="p-4 rounded-lg border border-white/10" style={{ background: 'rgba(10,10,10,0.4)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Github size={16} className="text-purple-400" />
                    <span className="font-medium text-white">{analysis.repo.full_name}</span>
                    {analysis.repo.language && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/30">
                        {analysis.repo.language}
                      </span>
                    )}
                  </div>
                  {analysis.repo.description && (
                    <p className="text-sm text-gray-400 mb-3">{analysis.repo.description}</p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Star size={12} /> {analysis.repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork size={12} /> {analysis.repo.forks_count}</span>
                    <span className="flex items-center gap-1"><FileCode size={12} /> {Math.round(analysis.repo.size / 1024)} MB</span>
                    <span className="flex items-center gap-1"><AlertCircle size={12} /> {analysis.repo.open_issues_count} issues</span>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="p-4 rounded-lg border border-purple-500/20" style={{ background: 'rgba(147,51,234,0.05)' }}>
                  <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Análise ADA</h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
                </div>

                <button
                  onClick={() => setAnalysis({ status: 'idle' })}
                  className="text-xs text-gray-500 hover:text-gray-300 transition"
                >
                  ← Nova análise
                </button>
              </div>
            )}
          </div>

          {analysis.status === 'idle' && (
            <div>
              <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">Exemplos</h3>
              <div className="grid gap-2">
                {exampleRepos.map((r) => (
                  <button
                    key={`${r.owner}/${r.repo}`}
                    onClick={() => setRepoInput(`${r.owner}/${r.repo}`)}
                    className="p-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition text-left flex items-center gap-3"
                    style={{ background: 'rgba(10,10,10,0.4)' }}
                  >
                    <Github size={14} className="text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{r.owner}/{r.repo}</p>
                      <p className="text-xs text-gray-500 truncate">{r.description}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-500 shrink-0 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
