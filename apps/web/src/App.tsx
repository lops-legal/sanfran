import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ConsentBanner from "./components/ConsentBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import { LegalSkill } from "./types";
import { Loader2 } from "lucide-react";

const Marketplace = lazy(() => import("./components/Marketplace"));
const SkillDetailRoute = lazy(() => import("./pages/SkillDetailRoute"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-24 text-muted">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span className="font-mono text-sm">Carregando…</span>
    </div>
  );
}

function SkillsPage() {
  const navigate = useNavigate();
  return (
    <Marketplace
      onSelectSkill={(skill) => navigate(`/skills/${skill.slug || skill.id}`)}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary/30 selection:text-white">
        <Navbar />

        <main className="flex-1 w-full relative flex flex-col">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/skills/:slug" element={<SkillDetailRoute />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route
                  path="/integrate"
                  element={
                    <div className="p-10 text-center">
                      <h1 className="text-3xl font-serif">Integração API</h1>
                      <p className="mt-4 text-muted">Portal do desenvolvedor em breve.</p>
                    </div>
                  }
                />
                <Route
                  path="/docs"
                  element={
                    <div className="p-10 text-center">
                      <h1 className="text-3xl font-serif">Documentação</h1>
                      <p className="mt-4 text-muted">Documentação em breve.</p>
                    </div>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <ConsentBanner />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}
