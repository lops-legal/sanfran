"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Conta criada! Verifique seu email para confirmar o cadastro.");
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao conectar com Google.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 rounded-md p-1 text-muted transition-colors hover:bg-muted/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 id="auth-modal-title" className="text-2xl font-bold text-foreground">
            {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {isLogin
              ? "Entre para salvar skills e participar da comunidade."
              : "Junte-se ao sanfran.md e compartilhe suas skills."}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background font-medium text-foreground transition-colors hover:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <img src="/Google__G__logo.svg.webp" alt="Google" className="h-5 w-5" />
          Continuar com Google
        </button>

        <div className="relative my-6 flex items-center">
          <div className="h-px w-full bg-border" aria-hidden="true" />
          <span className="absolute left-1/2 -translate-x-1/2 bg-card px-3 text-xs uppercase tracking-wide text-muted">
            Ou continue com email
          </span>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4" noValidate>
          <div>
            <label htmlFor="auth-email" className="sr-only">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="sr-only">Senha</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                id="auth-password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-white transition-colors hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="font-medium text-primary hover:underline focus:outline-none"
          >
            {isLogin ? "Crie uma agora" : "Faça login"}
          </button>
        </div>
      </div>
    </div>
  );
}
