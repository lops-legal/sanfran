import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Marketplace from "./components/Marketplace";
import SkillDetailRoute from "./pages/SkillDetailRoute";
import AdminDashboard from "./pages/AdminDashboard";
import ConsentBanner from "./components/ConsentBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast"; // <-- named import, não default
import { LegalSkill } from "./types";

function SkillsPage() {
  const navigate = useNavigate();
  return (
    <Marketplace
      onSelectSkill={(skill) => navigate(`/skills/${skill.slug || skill.id}`)}
    />
  );
}

export default function App() {
  const handlePublishSkill = (_newSkill: LegalSkill) => {
    // Skills publicadas passam a vir do Supabase; recarregar catálogo se necessário.
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary/30 selection:text-white">
        <Navbar />

        <main className="flex-1 w-full relative flex flex-col">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/skills/:slug" element={<SkillDetailRoute />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route
                path="/integrate"
                element={
                  <div className="p-10 text-center">
                    <h1 className="text-3xl font-serif">Integrate API</h1>
                    <p className="mt-4 text-muted">Developer portal coming soon.</p>
                  </div>
                }
              />
              <Route
                path="/docs"
                element={
                  <div className="p-10 text-center">
                    <h1 className="text-3xl font-serif">Documentation</h1>
                    <p className="mt-4 text-muted">Docs coming soon.</p>
                  </div>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>

        <ConsentBanner />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}