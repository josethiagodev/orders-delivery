# BACKEND JS — Orders Delivery

Uma API desenvolvida com o ecossistema Javascript:
**pedidos, cardápio, usuários com hash e sessão JWT** (fluxo > restaurante → balcão de mesa).

**Modelo de dados**
- PostgreSQL via Prisma: usuários, categorias, produtos, pedidos e itens. |

**HTTP implementado**
- `POST /users`, `POST /session` (JWT), `GET /me`, `POST /category` (rota protegida/privada). |

**Domínio cardápio/pedido**
- Tabelas completas; endpoint HTTP apenas para **categoria** (criação). Produtos, pedidos e itens ainda sem rotas. |

**Autenticação**
- jsonwebtoken` + middleware `userIsAuthenticated` (Bearer); |

**HTTP implementado** 
- `POST /users` (persistência real) e `POST /session`.

---


## STACKS USADAS

| Camada | Tecnologia | Uso no repositório |

| Runtime | Node.js | `type: "module"` (ESM). |
| HTTP | Express 5 | App, JSON body, roteador central, handler de erro global. |
| Linguagem | TypeScript 6 | `strict` e opções adicionais em `tsconfig.json`. |
| Execução dev | tsx | `tsx watch --env-file=.env src/server.ts` — carrega `.env` no processo da API. |
| ORM | Prisma 7 | Schema, migrações, client gerado. |
| Client Database (DB) | `pg` + `@prisma/adapter-pg` | Pool/driver nativo; `PrismaClient` instanciado com adapter em `src/prisma/index.ts`. |
| Banco | PostgreSQL | Datasource; URL em `prisma.config.ts` e runtime. |
| Validação | Zod 4 | Schemas por rota; middleware `validateSchema`. |
| Segurança (senha) | bcrypt | Hash na criação (`CreateUserService`); `compare` no login (`AuthUserService`). |
| Auth | jsonwebtoken | Emissão em `/session`; verificação em `userIsAuthenticated`. |
| Config/CLI | dotenv | `import "dotenv/config"` em `prisma.config.ts` para comandos Prisma (migração, generate). |
| CORS | cors | Middleware global em `src/server.ts`. |

Tipagens (TS) de desenvolvimento:
`@types/node`, `@types/express`, `@types/cors`, `@types/pg`, `@types/bcrypt`, `@types/jsonwebtoken`.

---


## ARQUITETURA HTTP

**Rotas públicas (com validação Zod quando aplicável):**
`Rota → validateSchema → Controller → Service → Prisma`

**Rotas privadas:**
`Rota → userIsAuthenticated (JWT Bearer) → Controller → Service → Prisma`

---


## PRÉ-REQUISITOS

- Node.js compatível com o `package.json`.
- PostgreSQL acessível.
- Arquivo `.env` na raiz do backend (não versionado).

---


## CONFIGURAÇÃO

### 1. Dependências

```bash
npm install
```


### 2. Variáveis de ambiente

Crie `.env` na raiz deste pacote. Exemplo com placeholders:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO"
PORT=3333
JWT_SECRET="sua-chave-secreta-forte-aqui"
```

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Runtime em `src/prisma/index.ts`; CLI Prisma via `prisma.config.ts` (`dotenv/config`). |
| `PORT` | `src/server.ts` — fallback **3333**. |
| `JWT_SECRET` | Assinatura e `verify` em `AuthUserService` e `userIsAuthenticated`. Obrigatória para `/session`, `/me` e `/category`. |

**Dupla origem de env:** o script `dev` injeta `.env` com `--env-file` (tsx); a CLI Prisma carrega via `prisma.config.ts` + dotenv. Mantenha um único `.env` na raiz.


### 3. PRISMA (generate e migrate)

O client é gerado em **`src/generated/prisma`** (`output` no `schema.prisma`).

```bash
npx prisma generate
```

Aplicar schema ao banco:

- **Desenvolvimento:** `npx prisma migrate dev`
- **CI / deploy:** `npx prisma migrate deploy`

Migração inicial: `prisma/migrations/20260512205022_init/`.

---


## EXECUTAR SERVIDOR

```bash
npm run dev
```

---


## MODELAGEM DE DADOS

Domínio: **cardápio** (categoria → produto) e **pedido** (pedido → itens).

| Modelo | Tabela | O que importa no desenho |
|--------|--------|-------------------------|
| **User** | `users` | UUID; `email` único; `password` como hash (app); `Role` `STAFF` \| `ADMIN` (default `STAFF`); timestamps. |
| **Category** | `categories` | Nome; 1:N com produtos. |
| **Product** | `products` | FK `category_id` com `ON DELETE CASCADE`; `price` em **centavos**; `description`, `banner`; `disabled` — `true` = fora do cardápio (default `false`). |
| **Order** | `orders` | `table` (mesa); `status` bool — `false` pendente / `true` pronto; `draft` bool — semântica legada no schema (ver comentários em `schema.prisma`); `name` opcional. |
| **Item** | `items` | `amount`; FKs `order_id` e `product_id` com CASCADE. Relação Prisma `Order.itens` → `@map("items")`. |

---


## API

### Validação (comum)

- Middleware `validateSchema`: valida `body`, `query` e `params` contra o schema Zod da rota.
- **Erro Zod:** `400` — `{ "error": "Erro de validação!", "details": [ { "message": "..." } ] }`.

### Autenticação (rotas protegidas)

- Header: `Authorization: Bearer <token>`.
- Middleware `userIsAuthenticated`: `jwt.verify` com `JWT_SECRET`; define `req.user_id` a partir do claim `sub` (id do usuário).
- **401** — `{ "error": "Token não fornecido!" }` ou `{ "error": "Token inválido!" }`.

---

### `POST /users`

- **Pipeline:** `validateSchema(createUserSchema)` → `CreateUserController` → `CreateUserService`.

| Campo | Regras (`userSchema.ts`) |
|--------|---------------------------|
| `name` | string, mínimo **3** após `trim`. |
| `email` | `z.email`, regex (minúsculas no local-part), `trim`, `toLowerCase`. |
| `password` | string, mínimo **6**, `trim`. |

---

### `POST /session`

- **Auth:** não.
- **Pipeline:** `validateSchema(authUserSchema)` → `AuthUserController` → `AuthUserService`.
- **Corpo:** `email` e `password` (mesmas regras de `authUserSchema`).

- **Sucesso `200`:** `{ id, name, email, role, token }`.
  - Token JWT: payload `{ name, email }`, **`subject`** = `user.id`, `expiresIn: "1h"`, secret `JWT_SECRET`.
- **Falha de credenciais:** `400` — `"Email/Senha é obrigatório"` (usuário inexistente ou senha incorreta — mensagem única).

---

### `GET /me`

- **Auth:** Bearer JWT.
- **Pipeline:** `userIsAuthenticated` → `DetailUserController` → `DetailUserService`.
- **Sucesso `200`:** `{ id, name, email, role, createdAt }`.
- **Usuário inexistente:** `400` — `"Usuário não encontrado!"`.

---

### `POST /category`

- **Auth:** Bearer JWT.
- **Pipeline:** `userIsAuthenticated` → `CreateCategoryController` → `CreateCategoryService`.
- **Corpo:** `{ "name": string }` — **sem validação Zod** no estado atual.
- **Sucesso `201`:** `{ id, name, createdAt }`.
- **Falha persistência:** `400` — `"Erro ao criar categoria!"`.

---


## ESTRUTURA DE PASTAS

```
backend/
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── server.ts
│   ├── routes.ts
│   ├── @types/express/index.d.ts    # Request.user_id
│   ├── prisma/index.ts
│   ├── generated/prisma/            # client gerado (não editar)
│   ├── middlewares/
│   │   ├── validateSchema.ts
│   │   └── userIsAuthenticated.ts
│   ├── schemas/
│   │   └── userSchema.ts
│   ├── controllers/
│   │   ├── user/
│   │   │   ├── CreateUserController.ts
│   │   │   ├── AuthUserController.ts
│   │   │   └── DetailUserController.ts
│   │   └── category/
│   │       └── CreateCategoryController.ts
│   └── services/
│       ├── user/
│       │   ├── CreateUserService.ts
│       │   ├── AuthUserService.ts
│       │   └── DetailUserService.ts
│       └── category/
│           └── CreateCategoryService.ts
├── package.json
└── tsconfig.json
```

---


## ESTADO DO PROJETO

**Feito**
- Modelagem relacional + migração inicial.
- Express 5, TypeScript estrito, CORS, JSON parser.
- Validação Zod (`createUserSchema`, `authUserSchema`) e middleware reutilizável.
- Prisma 7, client em `src/generated/prisma`, adapter **`pg`**.
- **`POST /users`** — persistência, unicidade de e-mail, hash bcrypt.
- **`POST /session`** — login com `bcrypt.compare` + JWT (1h).
- **`GET /me`** — perfil do usuário autenticado.
- **`POST /category`** — criação de categoria (rota protegida).
- Middleware `userIsAuthenticated` e tipagem `Request.user_id`.


**Em progresso**
- Validação Zod para `POST /category`.
- RBAC por `role` (`ADMIN` vs `STAFF`) em rotas de domínio.
- Padronização de status HTTP (ex.: `201` em `/users`, `404` para não encontrado).
- Refresh token, revogação e rotação de `JWT_SECRET`.
- Consistência de imports ESM (sufixo `.js`).

---


## DECISÕES TÉCNICAS

- **Prisma 7:** URL do datasource em **`prisma.config.ts`**, não no bloco `datasource` do `schema.prisma` além do `provider`.
- **Adapter `pg`:** client desacoplado do driver; pool e políticas por ambiente.
- **JWT:** `sub` = id do usuário; payload inclui `name` e `email`; expiração fixa **1h**; sem refresh/blacklist no momento.
- **Rotas protegidas:** identidade propagada via `req.user_id` após `verify`; autenticação sem autorização por papel ainda.
- **Validação:** schemas Zod por rota onde aplicável; categoria aceita `body` sem schema (débito consciente).
- **Imports ESM:** mistura de imports com e sem sufixo `.js` entre módulos locais — alinhar em refatoração futura.
