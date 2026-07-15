import React, { useEffect, useState } from "react";
import { Shield, ShieldAlert, User, Check, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseAdapter";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redireciona se não for admin
    if (role !== "admin") {
      navigate("/");
      return;
    }

    fetchProfiles();
  }, [role, navigate]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Erro ao buscar perfis:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (profileId: string, currentRole: string) => {
    if (!window.confirm(`Mudar permissão deste usuário?`)) return;
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profileId);
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, role: newRole } : p));
    } catch (err) {
      alert("Erro ao alterar cargo. Verifique suas permissões de admin.");
    }
  };

  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel de Administração</h1>
            <p className="text-muted text-sm mt-1">Gerencie acessos e cargos dos usuários da plataforma.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Usuários Cadastrados ({profiles.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted uppercase bg-muted/10 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-mono">Usuário</th>
                  <th className="px-6 py-4 font-mono">Email / Username</th>
                  <th className="px-6 py-4 font-mono">Cargo</th>
                  <th className="px-6 py-4 font-mono text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">Carregando...</td>
                  </tr>
                ) : profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{p.display_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">{p.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                        p.role === "admin" 
                          ? "bg-red-500/10 text-red-400 border-red-500/20" 
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {p.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {p.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleRole(p.id, p.role)}
                        disabled={p.id === user?.id} // não pode alterar o próprio cargo
                        className="text-xs font-medium px-3 py-1.5 rounded bg-muted/50 text-foreground hover:bg-muted transition-colors disabled:opacity-30"
                      >
                        {p.role === "admin" ? "Rebaixar para Usuário" : "Promover a Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
