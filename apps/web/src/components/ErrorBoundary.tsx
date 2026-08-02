import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const { error } = this.state;
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Algo deu errado</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6 font-light leading-relaxed">
            Ocorreu um erro inesperado ao renderizar este componente.
            Tente recarregar ou voltar à página anterior.
          </p>
          {error && (
            <pre className="text-[10px] font-mono text-red-400/60 bg-red-500/5 border border-red-500/10 px-4 py-2 rounded max-w-lg overflow-x-auto mb-6">
              {error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#2a2a2e] bg-[#111113] text-xs font-mono text-slate-300 hover:text-white hover:border-[#3a3a3e] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
