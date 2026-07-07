# Automações n8n

Este projeto usa [n8n](https://n8n.io) para duas automações, que se conectam
na API do backend usando login normal (email/senha) — nenhuma alteração foi
necessária no backend para isso.

## Workflows disponíveis

### 1. `alerta-saldo-baixo.json`

Roda todo dia às 8h, consulta `GET /transacoes/saldo` e envia um email de
alerta se o saldo estiver abaixo do limite configurado.

**Como configurar:**
1. No n8n, vá em **Workflows → Import from File** e selecione
   `workflows/alerta-saldo-baixo.json`.
2. Abra o node **Configuração** e edite:
   - `api_url` — URL onde o backend está rodando (ex: `http://localhost:3000`)
   - `email_login` / `senha_login` — credenciais de um usuário já cadastrado
     na aplicação
   - `limite_alerta` — valor mínimo de saldo aceitável (ex: `100`)
   - `email_destino` — para onde o alerta deve ser enviado
3. Configure uma credencial SMTP no n8n (**Credentials → New → SMTP**) e
   selecione-a no node **Enviar Email de Alerta**.
4. Ative o workflow (toggle **Active** no canto superior direito).

> ⚠️ **Segurança:** não commite o workflow depois de preencher a senha real.
> Se for versionar, mantenha os valores de exemplo (`COLOQUE_A_SENHA_AQUI`) e
> preencha só localmente após importar.

### 2. `importar-transacoes-csv.json`

Lê um arquivo CSV local, valida cada linha e cria as transações na API via
`POST /transacoes`. Linhas inválidas (descrição vazia, valor ≤ 0, tipo
diferente de `RECEITA`/`DESPESA`) são ignoradas automaticamente — não geram
erro, só não são enviadas.

**Formato do CSV esperado** (veja `exemplo-transacoes.csv`):

```csv
descricao,valor,tipo,categoria,data
Salário,5000.00,RECEITA,Trabalho,2026-07-01
Supermercado,320.50,DESPESA,Alimentação,2026-07-02
```

- `categoria` e `data` são opcionais
- `data` no formato `AAAA-MM-DD` (se omitido, a API usa a data atual)
- `tipo` não diferencia maiúsculas/minúsculas (o workflow normaliza para
  maiúsculo automaticamente)

**Como configurar:**
1. Importe `workflows/importar-transacoes-csv.json` no n8n.
2. Abra o node **Configuração** e edite `api_url`, `email_login`,
   `senha_login` e `caminho_csv` (caminho completo do arquivo no servidor
   onde o n8n está rodando).
3. Clique em **Execute Workflow** para rodar manualmente sempre que quiser
   importar um novo arquivo.

## Limitações conhecidas

- As credenciais de login ficam armazenadas em texto simples dentro do
  workflow (node **Configuração**). Para múltiplos usuários ou uso em
  produção, o ideal seria o backend expor autenticação por API key
  dedicada para integrações — não implementado nesta versão.
- O workflow de importação não faz upload de arquivo pela interface do
  n8n; ele lê um caminho de arquivo local no servidor onde o n8n roda.
