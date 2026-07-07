const { z } = require("zod");

const registrarSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

module.exports = { registrarSchema, loginSchema };
