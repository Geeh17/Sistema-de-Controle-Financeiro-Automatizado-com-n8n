require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { loadEnv } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const transacaoRoutes = require("./routes/transacao.routes");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const { errorHandler } = require("./middlewares/error.middleware");
const env = loadEnv();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/transacoes", transacaoRoutes);

// 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

// Middleware de erro deve ser o último a ser registrado
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API rodando na porta ${env.PORT} [${env.NODE_ENV}]`);
});
