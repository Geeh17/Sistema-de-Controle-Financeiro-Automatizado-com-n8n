/**
 * Erro de aplicação com status HTTP associado.
 * Use isto nos controllers em vez de montar res.status().json() na mão:
 *   throw new AppError(404, "Transação não encontrada.");
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
