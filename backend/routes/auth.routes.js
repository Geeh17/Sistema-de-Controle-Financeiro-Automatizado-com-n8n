const { Router } = require("express");
const { registrar, login } = require("../controllers/auth.controller");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

const router = Router();

router.post("/registrar", authLimiter, registrar);
router.post("/login", authLimiter, login);

module.exports = router;
