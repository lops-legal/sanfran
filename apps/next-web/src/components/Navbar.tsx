"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X, User as UserIcon, LogOut, Shield, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";

const MOBILE_NAV_ID = "mobile-nav-menu";

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, role, isLoading, signOut } = useAuth();

  const navLinks = [
    { label: "Skills", path: "/skills" },
    { label: "Conectar", path: "/integrate" },
    { label: "Como funciona", path: "/docs" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    closeMobileMenu();
  };

  const openAuthModal = () => {
    closeMobileMenu();
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <div className="w-full flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Scale className="w-5 h-5 text-foreground" aria-hidden />
            <span className="text-lg font-semibold tracking-tight font-serif text-foreground">
              sanfran<span className="text-muted-foreground">.md</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-subtle animate-pulse" aria-hidden />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-subtle text-foreground hover:bg-subtle/80 transition-colors border border-border overflow-hidden"
                  aria-label="Menu do usuário"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {profile?.display_name || profile?.username || user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {role === "admin" ? "Administrador" : "Usuário"}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-subtle transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Minha Conta
                    </Link>

                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-subtle transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Painel Admin
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dim transition-colors"
              >
                Entrar
              </button>
            )}

            <button
              type="button"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border text-foreground hover:bg-card transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-controls={MOBILE_NAV_ID}
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            id={MOBILE_NAV_ID}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-md"
            aria-label="Navegação"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname?.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={closeMobileMenu}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-subtle text-foreground" : "text-muted hover:bg-card hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!isLoading && !user && (
                <button
                  onClick={openAuthModal}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dim transition-colors"
                >
                  Entrar
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
