const { ZodError } = require("zod");
const { Prisma } = require("@prisma/client");
const { AppError } = require("../utils/AppError");
function errorHandler(err, req, res, next) {
  // Erros de validação (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos.",
      detalhes: err.issues.map((i) => ({
        campo: i.path.join("."),
        mensagem: i.message,
      })),
    });
  }

  // Erros conhecidos do Prisma (ex: violação de unique constraint)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Registro já existe (violação de unicidade)." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Registro não encontrado." });
    }
  }

  // Erros de aplicação lançados intencionalmente (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Qualquer outro erro não previsto
  console.error("Erro não tratado:", err);
  return res.status(500).json({ error: "Erro interno do servidor." });
}

module.exports = { errorHandler };
