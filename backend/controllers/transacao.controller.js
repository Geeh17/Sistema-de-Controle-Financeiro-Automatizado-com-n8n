const { PrismaClient } = require("@prisma/client");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { AppError } = require("../utils/AppError");
const {
  criarTransacaoSchema,
  editarTransacaoSchema,
  listarTransacaoQuerySchema,
  resumoMensalQuerySchema,
} = require("../validators/transacao.validator");

const prisma = new PrismaClient();

/* Criar transação */
const criar = asyncHandler(async (req, res) => {
  const dados = criarTransacaoSchema.parse(req.body);
  const usuarioId = req.usuarioId;

  const transacao = await prisma.transacao.create({
    data: { ...dados, usuarioId },
  });

  return res.status(201).json(transacao);
});

/* Listar transações com filtros e paginação */
const listar = asyncHandler(async (req, res) => {
  const usuarioId = req.usuarioId;
  const { tipo, categoria, mes, ano, pagina, limite } = listarTransacaoQuerySchema.parse(req.query);

  const where = { usuarioId };
  if (tipo) where.tipo = tipo;
  if (categoria) where.categoria = categoria;
  if (mes && ano) {
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 1);
    where.data = { gte: inicio, lt: fim };
  }

  const [transacoes, total] = await Promise.all([
    prisma.transacao.findMany({
      where,
      orderBy: { data: "desc" },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.transacao.count({ where }),
  ]);

  return res.json({
    dados: transacoes,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  });
});

/* Buscar uma transação por ID */
const buscarPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuarioId;

  const transacao = await prisma.transacao.findFirst({ where: { id, usuarioId } });
  if (!transacao) {
    throw new AppError(404, "Transação não encontrada.");
  }

  return res.json(transacao);
});

/* Editar transação */
const editar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuarioId;
  const dados = editarTransacaoSchema.parse(req.body);

  const transacao = await prisma.transacao.findFirst({ where: { id, usuarioId } });
  if (!transacao) {
    throw new AppError(404, "Transação não encontrada.");
  }

  const atualizada = await prisma.transacao.update({
    where: { id },
    data: dados,
  });

  return res.json(atualizada);
});

/* Deletar transação */
const deletar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuarioId;

  const transacao = await prisma.transacao.findFirst({ where: { id, usuarioId } });
  if (!transacao) {
    throw new AppError(404, "Transação não encontrada.");
  }

  await prisma.transacao.delete({ where: { id } });

  return res.status(204).send();
});

/* Saldo atual */
const saldo = asyncHandler(async (req, res) => {
  const usuarioId = req.usuarioId;

  const [receitas, despesas] = await Promise.all([
    prisma.transacao.aggregate({
      where: { usuarioId, tipo: "RECEITA" },
      _sum: { valor: true },
    }),
    prisma.transacao.aggregate({
      where: { usuarioId, tipo: "DESPESA" },
      _sum: { valor: true },
    }),
  ]);

  const totalReceitas = Number(receitas._sum.valor) || 0;
  const totalDespesas = Number(despesas._sum.valor) || 0;

  return res.json({
    saldo: totalReceitas - totalDespesas,
    totalReceitas,
    totalDespesas,
  });
});

/* Resumo mensal */
const resumoMensal = asyncHandler(async (req, res) => {
  const usuarioId = req.usuarioId;
  const { mes, ano } = resumoMensalQuerySchema.parse(req.query);

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1);

  const [receitas, despesas, transacoes] = await Promise.all([
    prisma.transacao.aggregate({
      where: { usuarioId, tipo: "RECEITA", data: { gte: inicio, lt: fim } },
      _sum: { valor: true },
    }),
    prisma.transacao.aggregate({
      where: { usuarioId, tipo: "DESPESA", data: { gte: inicio, lt: fim } },
      _sum: { valor: true },
    }),
    prisma.transacao.findMany({
      where: { usuarioId, data: { gte: inicio, lt: fim } },
      orderBy: { data: "desc" },
    }),
  ]);

  const totalReceitas = Number(receitas._sum.valor) || 0;
  const totalDespesas = Number(despesas._sum.valor) || 0;

  const porCategoria = transacoes.reduce((acc, t) => {
    const cat = t.categoria || "Sem categoria";
    if (!acc[cat]) acc[cat] = { receitas: 0, despesas: 0 };
    if (t.tipo === "RECEITA") acc[cat].receitas += Number(t.valor);
    else acc[cat].despesas += Number(t.valor);
    return acc;
  }, {});

  return res.json({
    mes,
    ano,
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    porCategoria,
    transacoes,
  });
});

module.exports = { criar, listar, buscarPorId, editar, deletar, saldo, resumoMensal };
