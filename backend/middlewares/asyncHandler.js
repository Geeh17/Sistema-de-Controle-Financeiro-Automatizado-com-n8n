/**
 * Envolve uma função de rota assíncrona e encaminha qualquer erro
 * para o middleware de tratamento de erros (next(err)), eliminando
 * a necessidade de try/catch repetido em cada controller.
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
