"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X, User as UserIcon, LogOut, Shield, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";

const MOBILE_NAV_ID = "mobile-nav-menu";

export default function Navbar() {
  const [showSlack, setShowSlack] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slack-banner-dismissed") !== "true";
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();

  const dismissSlack = () => {
    localStorage.setItem("slack-banner-dismissed", "true");
    setShowSlack(false);
  };

  const navLinks = [
    { label: "Skills", path: "/skills" },
    { label: "Integrate", path: "/integrate" },
    { label: "Docs", path: "/docs" },
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
    closeMobileMenu();
  }, [pathname]);

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
      {showSlack && (
        <div className="w-full bg-gradient-to-r from-[#4A154B] to-[#611f69] text-[#FBFAF9]">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
            <div className="flex flex-1 items-center justify-center gap-2 text-center text-xs sm:text-sm">
              <span className="hidden sm:inline">Join the sanfran.md Slack community today!</span>
              <span className="sm:hidden">Join our Slack community!</span>
              <a
                className="ml-2 rounded-full bg-[#FBFAF9]/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FBFAF9]/30"
                href="https://sanfranmd.slack.com/join/shared_invite/zt-44ys5kr75-li43f~B2o4TGQLsDwqc0rQ#/shared-invite/email"
              >
                Join Slack
              </a>
            </div>
            <button
              onClick={dismissSlack}
              className="ml-4 p-1 text-[#FBFAF9]/60 transition-colors hover:text-[#FBFAF9]"
              aria-label="Fechar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight font-serif text-foreground">
              sanfran<span className="text-primary">.md</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
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

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 overflow-hidden"
                  aria-label="User menu"
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
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {role === "admin" ? "Administrador" : "Usuário"}
                      </p>
                    </div>

                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
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
                className="hidden sm:inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dim transition-colors"
              >
                Entrar
              </button>
            )}

            <button
              type="button"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border text-foreground hover:bg-card transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-controls={MOBILE_NAV_ID}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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
            aria-label="Mobile navigation"
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
                      isActive ? "bg-primary/8 text-primary" : "text-muted hover:bg-card hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!user && (
                <button
                  onClick={openAuthModal}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dim transition-colors"
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
