const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { AppError } = require("../utils/AppError");
const { registrarSchema, loginSchema } = require("../validators/auth.validator");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const registrar = asyncHandler(async (req, res) => {
  const { nome, email, senha } = registrarSchema.parse(req.body);

  const emailExistente = await prisma.usuario.findUnique({ where: { email } });
  if (emailExistente) {
    throw new AppError(409, "Email já cadastrado.");
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: senhaHash },
    select: { id: true, nome: true, email: true, criadoEm: true },
  });

  return res.status(201).json(usuario);
});

const login = asyncHandler(async (req, res) => {
  const { email, senha } = loginSchema.parse(req.body);

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw new AppError(401, "Credenciais inválidas.");
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    throw new AppError(401, "Credenciais inválidas.");
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  return res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
});

module.exports = { registrar, login };
