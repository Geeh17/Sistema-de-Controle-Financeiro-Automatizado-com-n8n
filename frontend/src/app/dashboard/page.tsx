"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import MetricCard from "@/components/ui/MetricCard";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Saldo, ResumoMensal } from "@/types";
import { formatarMoeda, nomeMes } from "@/lib/utils";

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  useEffect(() => {
    async function carregar() {
      setErro("");
      try {
        const [resSaldo, resResumo] = await Promise.all([
          api.get("/transacoes/saldo"),
          api.get(`/transacoes/resumo?mes=${mes}&ano=${ano}`),
        ]);
        setSaldo(resSaldo.data);
        setResumo(resResumo.data);
      } catch (e: any) {
        setErro(e.response?.data?.error || "Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }
    if (usuario) carregar();
  }, [usuario, mes, ano]);

  /* Montar dados do gráfico por categoria */
  const dadosGrafico = resumo
    ? Object.entries(resumo.porCategoria).map(([cat, vals]) => ({
        name: cat,
        Receitas: vals.receitas,
        Despesas: vals.despesas,
      }))
    : [];

  /* Últimas 5 transações */
  const ultimas = resumo?.transacoes.slice(0, 5) ?? [];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen text-subtle text-sm">
          Carregando...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <p className="text-subtle text-sm">Olá, {usuario?.nome} 👋</p>
          <h1 className="text-2xl font-bold mt-0.5">
            {nomeMes(mes)} {ano}
          </h1>
        </div>

        {erro && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
            {erro}
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            label="Saldo Total"
            valor={saldo?.saldo ?? 0}
            icon={Wallet}
            cor={saldo && saldo.saldo >= 0 ? "green" : "red"}
          />
          <MetricCard
            label="Receitas do Mês"
            valor={resumo?.totalReceitas ?? 0}
            icon={TrendingUp}
            cor="green"
          />
          <MetricCard
            label="Despesas do Mês"
            valor={resumo?.totalDespesas ?? 0}
            icon={TrendingDown}
            cor="red"
          />
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Gráfico */}
          <div className="col-span-3 card">
            <h2 className="text-sm font-semibold text-subtle uppercase tracking-widest mb-6">
              Receitas vs Despesas por Categoria
            </h2>
            {dadosGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dadosGrafico}>
                  <defs>
                    <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff87" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4757" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ff4757" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="name" tick={{ fill: "#6b6b80", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b6b80", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => formatarMoeda(v)}
                  />
                  <Area type="monotone" dataKey="Receitas" stroke="#00ff87" strokeWidth={2} fill="url(#gradReceita)" />
                  <Area type="monotone" dataKey="Despesas" stroke="#ff4757" strokeWidth={2} fill="url(#gradDespesa)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-subtle text-sm">
                Nenhuma transação neste mês
              </div>
            )}
          </div>

          {/* Últimas transações */}
          <div className="col-span-2 card">
            <h2 className="text-sm font-semibold text-subtle uppercase tracking-widest mb-4">
              Últimas Transações
            </h2>
            <div className="space-y-3">
              {ultimas.length === 0 && (
                <p className="text-subtle text-sm">Nenhuma transação</p>
              )}
              {ultimas.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text">{t.descricao}</p>
                    <p className="text-xs text-subtle">{t.categoria ?? "Sem categoria"}</p>
                  </div>
                  <span
                    className={`text-sm font-mono font-semibold ${
                      t.tipo === "RECEITA" ? "text-accent" : "text-danger"
                    }`}
                  >
                    {t.tipo === "RECEITA" ? "+" : "-"}{formatarMoeda(Number(t.valor))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
