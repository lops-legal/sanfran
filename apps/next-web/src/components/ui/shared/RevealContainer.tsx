import React from "react";

interface RevealContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Mantidos por compatibilidade; o conteúdo não é mais escondido antes de entrar na tela. */
  delay?: number;
  threshold?: number;
}

/**
 * Antes escondia o conteúdo (opacity 0) até hidratar e entrar no viewport,
 * o que deixava o título da home invisível no carregamento. Agora é só um wrapper.
 */
export function RevealContainer({ children, className = "" }: RevealContainerProps) {
  return <div className={className}>{children}</div>;
}
