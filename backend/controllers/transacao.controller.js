const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* Criar transação */
async function criar(req, res) {
  const { descricao, valor, tipo, categoria, data } = req.body;
  const usuarioId = req.usuarioId;

  if (!descricao || !valor || !tipo) {
    return res.status(400).json({ error: "Descrição, valor e tipo são obrigatórios." });
  }

  if (!["RECEITA", "DESPESA"].includes(tipo)) {
    return res.status(400).json({ error: "Tipo deve ser RECEITA ou DESPESA." });
  }

  if (Number(valor) <= 0) {
    return res.status(400).json({ error: "Valor deve ser maior que zero." });
  }

  const transacao = await prisma.transacao.create({
    data: {
      descricao,
      valor,
      tipo,
      categoria: categoria || null,
      data: data ? new Date(data) : undefined,
      usuarioId,
    },
  });

  return res.status(201).json(transacao);
}

/* Listar transações com filtros opcionais */
async function listar(req, res) {
  const usuarioId = req.usuarioId;
  const { tipo, categoria, mes, ano } = req.query;

  const where = { usuarioId };

  if (tipo) where.tipo = tipo;
  if (categoria) where.categoria = categoria;

  if (mes && ano) {
    const inicio = new Date(Number(ano), Number(mes) - 1, 1);
    const fim = new Date(Number(ano), Number(mes), 1);
    where.data = { gte: inicio, lt: fim };
  }

  const transacoes = await prisma.transacao.findMany({
    where,
    orderBy: { data: "desc" },
  });

  return res.json(transacoes);
}

/* Buscar uma transação por ID */
async function buscarPorId(req, res) {
  const { id } = req.params;
  const usuarioId = req.usuarioId;

  const transacao = await prisma.transacao.findFirst({
    where: { id, usuarioId },
  });

  if (!transacao) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  return res.json(transacao);
}

/* Editar transação */
async function editar(req, res) {
  const { id } = req.params;
  const usuarioId = req.usuarioId;
  const { descricao, valor, tipo, categoria, data } = req.body;

  const transacao = await prisma.transacao.findFirst({ where: { id, usuarioId } });
  if (!transacao) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  if (tipo && !["RECEITA", "DESPESA"].includes(tipo)) {
    return res.status(400).json({ error: "Tipo deve ser RECEITA ou DESPESA." });
  }

  if (valor && Number(valor) <= 0) {
    return res.status(400).json({ error: "Valor deve ser maior que zero." });
  }

  const atualizada = await prisma.transacao.update({
    where: { id },
    data: {
      ...(descricao && { descricao }),
      ...(valor && { valor }),
      ...(tipo && { tipo }),
      ...(categoria !== undefined && { categoria }),
      ...(data && { data: new Date(data) }),
    },
  });

  return res.json(atualizada);
}

/* Deletar transação */
async function deletar(req, res) {
  const { id } = req.params;
  const usuarioId = req.usuarioId;

  const transacao = await prisma.transacao.findFirst({ where: { id, usuarioId } });
  if (!transacao) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  await prisma.transacao.delete({ where: { id } });

  return res.status(204).send();
}

/* Saldo atual */
async function saldo(req, res) {
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
}

/* Resumo mensal */
async function resumoMensal(req, res) {
  const usuarioId = req.usuarioId;
  const { mes, ano } = req.query;

  if (!mes || !ano) {
    return res.status(400).json({ error: "Informe mes e ano como query params." });
  }

  const inicio = new Date(Number(ano), Number(mes) - 1, 1);
  const fim = new Date(Number(ano), Number(mes), 1);

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

  /* Agrupamento por categoria */
  const porCategoria = transacoes.reduce((acc, t) => {
    const cat = t.categoria || "Sem categoria";
    if (!acc[cat]) acc[cat] = { receitas: 0, despesas: 0 };
    if (t.tipo === "RECEITA") acc[cat].receitas += Number(t.valor);
    else acc[cat].despesas += Number(t.valor);
    return acc;
  }, {});

  return res.json({
    mes: Number(mes),
    ano: Number(ano),
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    porCategoria,
    transacoes,
  });
}

module.exports = { criar, listar, buscarPorId, editar, deletar, saldo, resumoMensal };
