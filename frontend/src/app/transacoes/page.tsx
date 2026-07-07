"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import TransacaoModal from "@/components/ui/TransacaoModal";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Transacao } from "@/types";
import { formatarMoeda, formatarData } from "@/lib/utils";

export default function TransacoesPage() {
  const { usuario } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  async function carregar() {
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.set("tipo", filtroTipo);
      const res = await api.get(`/transacoes?${params}`);
      setTransacoes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuario) carregar();
  }, [usuario, filtroTipo]);

  async function deletar(id: string) {
    if (!confirm("Remover esta transação?")) return;
    await api.delete(`/transacoes/${id}`);
    carregar();
  }

  function abrirEditar(t: Transacao) {
    setEditando(t);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  const filtradas = transacoes.filter((t) =>
    t.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    (t.categoria ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transações</h1>
            <p className="text-subtle text-sm mt-0.5">{transacoes.length} registro(s)</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Transação
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição ou categoria..."
              className="input pl-9"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="input w-40"
          >
            <option value="">Todos</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-subtle text-xs uppercase tracking-widest px-6 py-4 font-normal">Descrição</th>
                <th className="text-left text-subtle text-xs uppercase tracking-widest px-6 py-4 font-normal">Categoria</th>
                <th className="text-left text-subtle text-xs uppercase tracking-widest px-6 py-4 font-normal">Data</th>
                <th className="text-left text-subtle text-xs uppercase tracking-widest px-6 py-4 font-normal">Tipo</th>
                <th className="text-right text-subtle text-xs uppercase tracking-widest px-6 py-4 font-normal">Valor</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-subtle">Carregando...</td>
                </tr>
              )}
              {!loading && filtradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-subtle">Nenhuma transação encontrada</td>
                </tr>
              )}
              {filtradas.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-text">{t.descricao}</td>
                  <td className="px-6 py-4 text-subtle">{t.categoria ?? "—"}</td>
                  <td className="px-6 py-4 text-subtle font-mono text-xs">{formatarData(t.data)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      t.tipo === "RECEITA"
                        ? "bg-accent/10 text-accent"
                        : "bg-danger/10 text-danger"
                    }`}>
                      {t.tipo}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-semibold ${
                    t.tipo === "RECEITA" ? "text-accent" : "text-danger"
                  }`}>
                    {t.tipo === "RECEITA" ? "+" : "-"}{formatarMoeda(Number(t.valor))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirEditar(t)}
                        className="p-1.5 text-subtle hover:text-text hover:bg-white/5 rounded-md transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deletar(t.id)}
                        className="p-1.5 text-subtle hover:text-danger hover:bg-danger/5 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && (
        <TransacaoModal
          transacao={editando}
          onClose={fecharModal}
          onSalvo={carregar}
        />
      )}
    </AppLayout>
  );
}
