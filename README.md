# BACKEND JS — Orders & Delivery

- API HTTP em Node.js para **pedidos, cardápio e usuários** (restaurante => mesa). 
- O **modelo de dados** (PostgreSQL via Prisma) cobre usuários, categorias, produtos, pedidos e itens;
- A **camada HTTP** concentra-se na validação e roteamento para criar usuário.

---


## STACK

| Camada | Tecnologia | Uso no repositório |
|--------|------------|-------------------|
| Runtime | Node.js (ESM) |
| HTTP | Express 5 |
| Linguagem | TypeScript 6 |
| Dev | tsx |
| ORM | Prisma 7 |
| Banco | PostgreSQL | Datasource |
| Validação | Zod 4 | Schemas |
| CORS | Middleware global |

---


## PRÉ-REQUISITOS

- Node.js compatível com as dependências do `package.json`.
- Instância **PostgreSQL** acessível.
- Arquivo `.env` na raiz do backend (não versionado).

---


## CONFIGURAÇÃO

### 1. Dependências

```bash
npm install
```


### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz deste pacote. Exemplo **apenas com placeholders** (ajuste host, usuário, senha e porta):

```env
# URL JDBC-style do PostgreSQL (usuário, senha, host, porta, database, parâmetros SSL se necessário)
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO"

# Porta HTTP do Express (opcional; se omitida, o código usa 3333)
PORT=3333
```

- `DATABASE_URL` é lida por `prisma.config.ts` (migrações / CLI) e por `src/prisma/index.ts` (runtime do client).
- `PORT` é usada em `src/server.ts` (`process.env.PORT` com fallback **3333**).

Não há `/.env.example` versionado; use o bloco acima como referência.


### 3. Prisma: migrações e client gerado

O client Prisma é gerado em `src/generated/prisma`. 

Após clonar ou alterar o schema:

```bash
npx prisma generate
```

Aplicar schema ao banco:
- **Desenvolvimento:** `npx prisma migrate dev`
- **CI / deploy:** `npx prisma migrate deploy`

A migração inicial está em `prisma/migrations/20260512205022_init/`.

---

## EXECUÇÃO

```bash
npm run dev
```

Equivale a `tsx watch --env-file=.env src/server.ts`. Não existe rota dedicada de health check (ex.: `/health`); valide manualmente com `POST /users` ou ferramenta HTTP.

---


## MODELAGEM DE DADOS

Desenho voltado a **pedido por mesa** e **cardápio**:

- **User** (`users`): `id` (UUID), `name`, `email` único, `password`, enum `role` (`STAFF` | `ADMIN`), timestamps.
- **Category** (`categories`) → **Product** (`products`): um produto pertence a uma categoria; `price` é **inteiro em centavos**; `description`, `banner`, `disabled` (boolean, default `false` no SQL), FK `category_id` com `ON DELETE CASCADE`.
- **Order** (`orders`) → **Item** (`items`): pedido com `table` (inteiro), `status` (boolean, default `false`), `draft` (boolean, default `true`), `name` opcional; item com `amount` e FKs para `order` e `product`, com cascata em exclusões.

---


## API (MÉTODO POST /users)

- **Middleware:** valida os dados do body e estrutura query/params esperada pelo schema.
- **Corpo (JSON):**

| Campo | Regras (resumo) |
|-------|-----------------|
| `name` | string, mínimo 3 caracteres, `trim`, `toLowerCase`. |
| `email` | formato e-mail (Zod), obrigatório, `trim`, `toLowerCase`. |
| `password` | mínimo 6 caracteres, `trim`, `toLowerCase`, deve conter letra minúscula e dígito. |

- **Respostas de validação:** `400` com `{ error, details: [{ message }] }` em caso de `ZodError`.
- **Resposta atual de sucesso:** o controller chama `CreateUserService`, que hoje é **stub** e retorna mensagem fixa em texto; **não há persistência** nem uso de `PrismaClient` nesse fluxo ainda.

---


## ESTRUTURA DE PASTAS

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── prisma.config.ts          # raiz do projeto; datasource URL
│   └── migrations/
├── src/
│   ├── server.ts                 # bootstrap Express
│   ├── routes.ts                 # registro de rotas
│   ├── prisma/index.ts           # singleton PrismaClient + adapter pg
│   ├── middlewares/
│   │   └── validateSchema.ts
│   ├── schemas/
│   │   └── userSchema.ts
│   ├── controllers/user/
│   └── services/user/
└── package.json
```

Fluxo atual: **HTTP → Zod → Controller → Service**. 

---


## ESTADO DO PROJETO

**Feito:** 
- modelagem relacional dos dados e migração inicial; 
- Express 5 + TypeScript estrito; 
- validação com Zod; 
- rota de `POST /users`;
- Prisma 7 com output customizado e adapter `pg`.


---

## DECISÕES TÉCNICAS

- **ESM:** imports com sufixo `.js` nos arquivos TypeScript compiláveis para alinhar ao output ESM.
- **Prisma 7:** URL do datasource fora do `schema.prisma`, em `prisma.config.ts`, alinhado ao modelo de configuração atual do Prisma.
- **Driver adapter `pg`:** conexão via `pg` explícita no `PrismaClient`, útil para ambientes que exigem pool/driver nativo.
- **Validação centralizada:** um middleware recebe schemas Zod reutilizáveis por rota.