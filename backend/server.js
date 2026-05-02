require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

/* Criar transação */
app.post("/transacoes", async (req, res) => {
  try {
    const { descricao, valor, tipo, usuarioId } = req.body;

    const transacao = await prisma.transacao.create({
      data: {
        descricao,
        valor,
        tipo,
        usuarioId,
      },
    });

    res.json(transacao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Listar transações */
app.get("/transacoes/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const transacoes = await prisma.transacao.findMany({
      where: { usuarioId },
      orderBy: { data: "desc" },
    });

    res.json(transacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Saldo */
app.get("/saldo/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const receitas = await prisma.transacao.aggregate({
      where: { usuarioId, tipo: "RECEITA" },
      _sum: { valor: true },
    });

    const despesas = await prisma.transacao.aggregate({
      where: { usuarioId, tipo: "DESPESA" },
      _sum: { valor: true },
    });

    const saldo = (receitas._sum.valor || 0) - (despesas._sum.valor || 0);

    res.json({ saldo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("🔥 API rodando na porta 3000"));
