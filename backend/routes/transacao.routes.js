const { Router } = require("express");
const {
  criar,
  listar,
  buscarPorId,
  editar,
  deletar,
  saldo,
  resumoMensal,
} = require("../controllers/transacao.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const router = Router();

// Todas as rotas de transação exigem usuário autenticado
router.use(autenticar);

router.post("/", criar);
router.get("/", listar);
router.get("/saldo", saldo);
router.get("/resumo", resumoMensal);
router.get("/:id", buscarPorId);
router.put("/:id", editar);
router.delete("/:id", deletar);

module.exports = router;
