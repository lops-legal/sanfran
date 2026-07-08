import React, { ReactNode, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional fallback component to render when an error is caught */
  fallback?: ReactNode;
}

/**
 * Functional ErrorBoundary using React hooks. Captures errors via a try/catch wrapper.
 * Simplified version; for full error‑boundary behavior keep the class version.
 */
export default function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Render children with a synchronous try/catch to capture errors.
  const renderChildren = () => {
    try {
      return children as React.ReactNode;
    } catch (e) {
      const err = e as Error;
      console.error("[ErrorBoundary] Uncaught error:", err);
      setError(err);
      setHasError(true);
      return null;
    }
  };

  const handleReset = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    if (fallback) return <>{fallback}</>;
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
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#2a2a2e] bg-[#111113] text-xs font-mono text-slate-300 hover:text-white hover:border-[#3a3a3e] transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return <>{renderChildren()}</>;
}
