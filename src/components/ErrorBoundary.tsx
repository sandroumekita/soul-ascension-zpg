import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Soul Ascension] Erro capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-extrabold text-red-400 mb-2">Erro Inesperado</h2>
            <p className="text-sm text-slate-400 mb-4">
              Algo deu errado no Soul Ascension. Tente recarregar a página.
            </p>
            <p className="text-xs text-red-300/70 bg-red-950/40 p-3 rounded-lg border border-red-800/40 font-mono mb-4 text-left break-all">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition text-sm"
              >
                🔄 Recarregar Página
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('soul_ascension_save_v1');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition text-sm border border-slate-700"
              >
                🗑️ Resetar Dados
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
