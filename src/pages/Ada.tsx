import { useState } from 'react';
import { Brain, ArrowRight, Github } from 'lucide-react';

interface AnalysisResult {
  status: 'idle' | 'loading' | 'complete' | 'error';
  data?: {
    complexity: string;
    issues: string[];
    suggestions: string[];
  };
  error?: string;
}

const exampleRepos = [
  { owner: 'facebook', repo: 'react', description: 'A JavaScript library for building UI' },
  { owner: 'microsoft', repo: 'vscode', description: 'Visual Studio Code editor' },
  { owner: 'vercel', repo: 'next.js', description: 'The React Framework for Production' },
];

export default function Ada() {
  const [repoInput, setRepoInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult>({ status: 'idle' });

  const handleAnalyze = async () => {
    if (!repoInput.trim()) return;

    setAnalysis({ status: 'loading' });

    // Validate repo format (owner/repo)
    const parts = repoInput.trim().split('/');
    if (parts.length !== 2) {
      setAnalysis({
        status: 'error',
        error: 'Formato inválido. Use: owner/repository',
      });
      return;
    }

    try {
      // Simulated analysis - in production this would call an API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setAnalysis({
        status: 'complete',
        data: {
          complexity: 'Alta',
          issues: [
            'Possível falta de testes em alguns componentes',
            'Alguns arquivos excedem 500 linhas',
            'Documentação incompleta em algumas funções',
          ],
          suggestions: [
            'Refatorar componentes grandes em módulos menores',
            'Aumentar cobertura de testes unitários',
            'Adicionar JSDoc para melhor documentação',
          ],
        },
      });
    } catch (error) {
      setAnalysis({
        status: 'error',
        error: 'Erro ao analisar repositório',
      });
    }
  };

  const loadExample = (owner: string, repo: string) => {
    setRepoInput(`${owner}/${repo}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain size={24} /> ADA
          </h2>
          <p className="text-sm text-gray-400">Analisador inteligente de código com IA</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto w-full">
          {/* Input Section */}
          <div className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Repositório GitHub
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="owner/repository (ex: facebook/react)"
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
                  {analysis.status === 'loading' ? (
                    <div className="animate-spin">⌛</div>
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {analysis.status === 'error' && (
              <div className="p-4 rounded-lg border border-red-500/30 bg-red-900/20">
                <p className="text-sm text-red-300">{analysis.error}</p>
              </div>
            )}

            {/* Loading Message */}
            {analysis.status === 'loading' && (
              <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-900/20">
                <p className="text-sm text-purple-300">Analisando repositório...</p>
              </div>
            )}

            {/* Analysis Results */}
            {analysis.status === 'complete' && analysis.data && (
              <div className="space-y-4 mt-8 p-6 rounded-lg border border-white/10 backdrop-blur-sm" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
                <div>
                  <h3 className="text-white font-semibold mb-2">Complexidade Geral</h3>
                  <p className="text-sm text-gray-300">{analysis.data.complexity}</p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Problemas Identificados</h3>
                  <ul className="space-y-2">
                    {analysis.data.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Sugestões de Melhorias</h3>
                  <ul className="space-y-2">
                    {analysis.data.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Examples Section */}
          {analysis.status === 'idle' && (
            <>
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
                  Repositórios de Exemplo
                </h3>
                <div className="grid gap-3">
                  {exampleRepos.map((repo) => (
                    <button
                      key={`${repo.owner}/${repo.repo}`}
                      onClick={() => loadExample(repo.owner, repo.repo)}
                      className="p-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition text-left backdrop-blur-sm"
                      style={{ background: 'rgba(10, 10, 10, 0.4)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Github size={16} className="text-purple-400" />
                            <p className="font-medium text-white">
                              {repo.owner}/{repo.repo}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400">{repo.description}</p>
                        </div>
                        <ArrowRight size={16} className="text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-8 border-t border-white/10">
                <div className="text-center space-y-3">
                  <p className="text-xs text-gray-500">
                    ADA - Ada Lovelace Memorial
                  </p>
                  <p className="text-xs text-gray-500">
                    Powered by{' '}
                    <span className="text-purple-400">Codeflow</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
