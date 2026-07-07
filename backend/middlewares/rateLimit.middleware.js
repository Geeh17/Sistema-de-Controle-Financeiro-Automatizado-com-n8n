const rateLimit = require("express-rate-limit");

/**
 * Limite mais rígido para rotas sensíveis (login/registro), mitigando
 * ataques de força bruta e enumeração de contas.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

/**
 * Limite geral para o restante da API.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});

module.exports = { authLimiter, apiLimiter };
