const { z } = require("zod");

const criarTransacaoSchema = z.object({
  descricao: z.string().trim().min(1, "Descrição é obrigatória").max(191),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  tipo: z.enum(["RECEITA", "DESPESA"], {
    error: "Tipo deve ser RECEITA ou DESPESA",
  }),
  categoria: z.string().trim().max(191).optional().nullable(),
  data: z.coerce.date().optional(),
});

const editarTransacaoSchema = criarTransacaoSchema.partial();

const listarTransacaoQuerySchema = z.object({
  tipo: z.enum(["RECEITA", "DESPESA"]).optional(),
  categoria: z.string().trim().optional(),
  mes: z.coerce.number().int().min(1).max(12).optional(),
  ano: z.coerce.number().int().min(2000).max(2100).optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
});

const resumoMensalQuerySchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(2000).max(2100),
});

module.exports = {
  criarTransacaoSchema,
  editarTransacaoSchema,
  listarTransacaoQuerySchema,
  resumoMensalQuerySchema,
};
