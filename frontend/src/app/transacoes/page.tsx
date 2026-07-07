"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import TransacaoModal from "@/components/ui/TransacaoModal";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Transacao, Paginacao } from "@/types";
import { formatarMoeda, formatarData } from "@/lib/utils";

export default function TransacoesPage() {
  const { usuario } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.set("tipo", filtroTipo);
      params.set("pagina", String(pagina));
      params.set("limite", "20");
      const res = await api.get(`/transacoes?${params}`);
      setTransacoes(res.data.dados);
      setPaginacao(res.data.paginacao);
    } catch (e: any) {
      setErro(e.response?.data?.error || "Erro ao carregar transações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuario) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, filtroTipo, pagina]);

  // Volta pra primeira página sempre que o filtro de tipo muda
  useEffect(() => {
    setPagina(1);
  }, [filtroTipo]);

  async function deletar(id: string) {
    if (!confirm("Remover esta transação?")) return;
    try {
      await api.delete(`/transacoes/${id}`);
      carregar();
    } catch (e: any) {
      setErro(e.response?.data?.error || "Erro ao remover transação.");
    }
  }

  function abrirEditar(t: Transacao) {
    setEditando(t);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  // Busca por texto é aplicada só na página atual (filtro client-side)
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
            <p className="text-subtle text-sm mt-0.5">
              {paginacao?.total ?? 0} registro(s)
            </p>
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
              placeholder="Buscar por descrição ou categoria (nesta página)..."
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

        {erro && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
            {erro}
          </div>
        )}

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
              {!loading && filtradas.map((t) => (
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

        {/* Paginação */}
        {paginacao && paginacao.totalPaginas > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-subtle">
              Página {paginacao.pagina} de {paginacao.totalPaginas}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1}
                className="btn-ghost flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Anterior
              </button>
              <button
                onClick={() => setPagina((p) => Math.min(paginacao.totalPaginas, p + 1))}
                disabled={pagina >= paginacao.totalPaginas}
                className="btn-ghost flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
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
