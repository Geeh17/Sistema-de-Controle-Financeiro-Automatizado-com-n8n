export type TipoTransacao = "RECEITA" | "DESPESA";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: string | null;
  data: string;
  usuarioId: string;
  criadoEm: string;
}

export interface Saldo {
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
}

export interface ResumoMensal {
  mes: number;
  ano: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  porCategoria: Record<string, { receitas: number; despesas: number }>;
  transacoes: Transacao[];
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
