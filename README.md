# BACKEND JS — Orders Delivery

- Backend para gerenciar os pedidos dos clientes via balcão de mesa para comércios locais e deliverys online.
- Node.js com TypeScript + Express (framework web).
- Prisma ORM (comunicação com banco de dados PostgreSQL) + Zod (validação de dados).

**Features**
- Pedidos, Cardápio (categorias e produtos), usuários com hash e sessão JWT.

**Modelo de dados**
- PostgreSQL via Prisma (usuários, categorias, produtos, pedidos e itens).

**HTTP implementado**
- `POST /users`, `POST /session` (JWT), `GET /me`, `POST /category` (JWT + role `ADMIN` + Zod).
- `GET /categoryall` (JWT — listagem de categorias).
- `POST /product` (JWT + `ADMIN` + multipart + Zod + upload Cloudinary).
- `GET /products` (JWT + query `disabled` via Zod — listagem de produtos).

**Domínio cardápio/pedido**
- Categorias: criação (`POST /category`) e listagem (`GET /categoryall`).
- Produtos: criação com banner via Cloudinary (`POST /product`) e listagem com filtro `disabled` (`GET /products`). Pendente edição e desativação.
- Pedidos e itens: modelados no banco; **sem rotas HTTP**.

**Autenticação e autorização**
- `jsonwebtoken` + `userIsAuthenticated` (Bearer JWT).
- `isAdminRole` — RBAC parcial: `POST /category` e `POST /product` exigem `User.role === ADMIN`.

---


## STACKS USADAS

| Camada | Tecnologia | Uso no repositório |
|--------|------------|-------------------|
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
| Upload | multer 2 | `memoryStorage`; campo `file`; limite **4 MB**; JPEG/JPG/PNG. |
| Mídia/CDN | cloudinary 2 | Upload de banner de produto; pasta `products`; URL em `Product.banner`. |

Tipagens (TS) de desenvolvimento:
`@types/node`, `@types/express`, `@types/cors`, `@types/pg`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/multer`.

---


## ARQUITETURA HTTP

**Rotas públicas (validação Zod quando aplicável):**
`Rota → validateSchema → Controller → Service → Prisma`

**Rotas privadas (qualquer role autenticada):**
`Rota → userIsAuthenticated (JWT Bearer) → Controller → Service → Prisma`

**Rotas privadas (validação de query — qualquer role autenticada):**
`Rota → userIsAuthenticated → validateSchema → Controller → Service → Prisma`

**Rotas privadas (role `ADMIN`):**
`Rota → userIsAuthenticated → isAdminRole → validateSchema → Controller → Service → Prisma`

**Rotas privadas (role `ADMIN` + multipart):**
`Rota → userIsAuthenticated → isAdminRole → multer.single('file') → validateSchema → Controller → Service → Cloudinary → Prisma`

---


## PRÉ-REQUISITOS

- Node.js compatível com o `package.json`.
- PostgreSQL acessível.
- Conta Cloudinary (upload de imagens de produto).
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
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Runtime em `src/prisma/index.ts`; CLI Prisma via `prisma.config.ts` (`dotenv/config`). |
| `PORT` | `src/server.ts` — fallback **3333**. |
| `JWT_SECRET` | Assinatura e `verify` em `AuthUserService` e `userIsAuthenticated`. Obrigatória para rotas autenticadas. |
| `CLOUDINARY_CLOUD_NAME` | `src/config/cloudinary.ts` — identificador da conta. |
| `CLOUDINARY_API_KEY` | Idem — chave pública da API. |
| `CLOUDINARY_API_SECRET` | Idem — segredo para upload autenticado. |

**Dupla origem de env:** o script `dev` injeta `.env` com `--env-file` (tsx); a CLI Prisma carrega via `prisma.config.ts` + dotenv. Mantenha um único `.env` na raiz.



### 3. PRISMA (generate e migrate)

O client é gerado em **`src/generated/prisma`** (`output` no `schema.prisma`; pasta gitignored — rode `generate` após clone/CI).

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

Script disponível: apenas `dev` (sem `build`/`start` no `package.json` no momento).

---


## MODELAGEM DE DADOS

Domínio: **cardápio** (categoria → produto) e **pedido** (pedido → itens).

| Modelo | Tabela | O que importa no desenho |
|--------|--------|-------------------------|

| **User** | `users` | UUID; `email` único; `password` como hash (app); `Role` `STAFF` \| `ADMIN` (default `STAFF`); timestamps. Cadastro não aceita `role` no body. |
| **Category** | `categories` | Nome; 1:N com produtos. |
| **Product** | `products` | FK `category_id` com `ON DELETE CASCADE`; `price` em **centavos**; `description`, `banner`; `disabled` — ver comentários em `schema.prisma` (alinhar semântica antes do front). |
| **Order** | `orders` | `table` (mesa); `status` boolean — `false` pendente / `true` pronto; `draft` bool — default `true` no banco; ver comentários em `schema.prisma`; `name` opcional. |
| **Item** | `items` | `amount`; FKs `order_id` e `product_id` com CASCADE. Relação Prisma `Order.itens` → `@map("items")`. |

---


## API

### Validação (comum)

- Middleware `validateSchema`: valida `body`, `query` e `params` contra o schema Zod da rota.
- **Erro Zod:** `400` — `{ "error": "Erro de validação!", "details": [ { "message": "..." } ] }`.

### Autenticação e autorização

**Autenticação (`userIsAuthenticated`)**
- Header: `Authorization: Bearer <token>`.
- `jwt.verify` com `JWT_SECRET`; define `req.user_id` a partir do claim `sub` (id do usuário).
- **401** — `{ "error": "Token não fornecido!" }` ou `{ "error": "Token inválido!" }`.

**Autorização (`isAdminRole`)**
- Executa após `userIsAuthenticated`; consulta `User` no banco pelo `req.user_id`.
- Exige `role === ADMIN`; caso contrário ou usuário inexistente: **401** — `{ "error": "Usuário não tem permissão!" }`.
- Hoje a API usa **401** também para negação de papel (convenção REST costuma usar **403** — backlog de padronização).
- Rotas que usam `isAdminRole`: `POST /category`, `POST /product`.
- `GET /me`, `GET /categoryall`, `GET /products`: qualquer role autenticada (`STAFF` ou `ADMIN`).

---

### `POST /users`

- **Auth:** não.
- **Pipeline:** `validateSchema(createUserSchema)` → `CreateUserController` → `CreateUserService`.
- **Role:** persistida como `STAFF` (default do banco; body não envia `role`).

| Campo | Regras (`userSchema.ts`) |
|--------|---------------------------|
| `name` | string, mínimo **3** após `trim`. |
| `email` | `z.email`, regex (minúsculas no local-part), `trim`, `toLowerCase`. |
| `password` | string, mínimo **6**, `trim`. |

- **Sucesso `200`:** `{ id, name, email, role, createdAt }` (sem senha).
- **E-mail duplicado:** `400` — `"O usuário já existe!"`.

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

- **Auth:** Bearer JWT (qualquer role).
- **Pipeline:** `userIsAuthenticated` → `DetailUserController` → `DetailUserService`.
- **Sucesso `200`:** `{ id, name, email, role, createdAt }`.
- **Usuário inexistente:** `400` — `"Usuário não encontrado!"`.

---

### `POST /category`

- **Auth:** Bearer JWT + role **`ADMIN`** (`isAdminRole`).
- **Pipeline:** `userIsAuthenticated` → `isAdminRole` → `validateSchema(createCategorySchema)` → `CreateCategoryController` → `CreateCategoryService`.

| Campo | Regras (`categorySchema.ts`) |
|--------|------------------------------|
| `name` | string; mínimo **2** após `trim`; `toLowerCase()`; regex `^[a-z]+$` (somente letras minúsculas). Mensagem Zod cita 3 caracteres — alinhar regra/mensagem. |

- **Sucesso `201`:** `{ id, name, createdAt }`.
- **Validação:** `400` — `{ "error": "Erro de validação!", "details": [ { "message": "..." } ] }`.
- **Sem permissão / usuário inexistente:** `401` — `"Usuário não tem permissão!"`.
- **Falha persistência:** `400` — `"Erro ao criar categoria!"`.

---

### `GET /categoryall`

- **Auth:** Bearer JWT (qualquer role).
- **Pipeline:** `userIsAuthenticated` → `ListAllCategoryController` → `ListAllCategoryService`.
- **Sucesso `200`:** `[ { id, name, createdAt }, ... ]` — ordenado por `name` desc.
- **Falha:** `400` — `"Erro ao buscar as categorias!"`.

---

### `POST /product`

- **Auth:** Bearer JWT + role **`ADMIN`** (`isAdminRole`).
- **Content-Type:** `multipart/form-data` (não JSON).
- **Pipeline:** `userIsAuthenticated` → `isAdminRole` → `uploadFiles.single('file')` → `validateSchema(createProductSchema)` → `CreateProductController` → `CreateProductService` → Cloudinary → Prisma.

| Campo | Origem | Regras (`productSchema.ts`) |
|--------|--------|----------------------------|
| `file` | multipart | Obrigatório; JPEG/JPG/PNG; máx. **4 MB**. |
| `name` | body | string, mínimo **2** após `trim`. |
| `price` | body | string (multipart), mínimo **1**, `trim` — coercido com `Number()` no service; persistido em **centavos** (`Int`). |
| `description` | body | string, mínimo **1** após `trim`. |
| `category_id` | body | string, `trim`; categoria deve existir no banco. |

- **Upload:** Multer (`memoryStorage`) → Cloudinary (`folder: "products"`) → `banner` = `secure_url`.
- **Sucesso `201`:** `{ id, name, price, description, category_id, banner, createdAt }`.
- **Validação:** `400` — `{ "error": "Erro de validação!", "details": [ { "message": "..." } ] }`.
- **Sem imagem:** `400` — `"A imagem do produto é obrigatória!"`.
- **Categoria inexistente:** `400` — `"Categoria não encontrada!"`.
- **Falha upload:** `400` — `"Erro ao fazer upload da imagem!"`.
- **Formato inválido / tamanho:** erro Multer → handler global `400` com mensagem do filtro/limite.
- **Backlog:** coerção tipada de `price` (`z.coerce.number()`); risco de `NaN` com `Number()`.

---

### `GET /products`

- **Auth:** Bearer JWT (qualquer role).
- **Pipeline:** `userIsAuthenticated` → `validateSchema(listProductsSchema)` → `ListAllProductsController` → `ListAllProductsService`.

| Param | Regras (`productSchema.ts`) |
|--------|----------------------------|
| `disabled` | `"true"` ou `"false"`; opcional; default `"false"`; `.strict()` rejeita query params desconhecidos |

- **Sucesso `200`:** `[ { id, name, price, description, banner, disabled, category_id, createdAt, category: { id, name } }, ... ]` — ordenado por `name` desc.
- **Validação:** `400` — `{ "error": "Erro de validação!", "details": [ { "message": "..." } ] }`.
- **Falha:** `400` — `"Falha ao buscar os produtos!"`.
- **Backlog:** `listProductsSchema` faz `.transform()` em `disabled`, mas `validateSchema` não injeta o valor parseado em `req` — controller lê `req.query.disabled` como string.

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
│   ├── generated/prisma/            # client gerado (gitignored; npx prisma generate)
│   ├── config/
│   │   ├── multer.ts                # memoryStorage, 4MB, JPEG/JPG/PNG
│   │   └── cloudinary.ts            # credenciais via env
│   ├── middlewares/
│   │   ├── validateSchema.ts
│   │   ├── userIsAuthenticated.ts
│   │   └── isAdminRole.ts           # RBAC ADMIN
│   ├── schemas/
│   │   ├── userSchema.ts
│   │   ├── categorySchema.ts      # createCategorySchema
│   │   └── productSchema.ts       # createProductSchema, listProductsSchema
│   ├── controllers/
│   │   ├── user/
│   │   │   ├── CreateUserController.ts
│   │   │   ├── AuthUserController.ts
│   │   │   └── DetailUserController.ts
│   │   ├── category/
│   │   │   ├── CreateCategoryController.ts
│   │   │   └── ListAllCategoryController.ts
│   │   └── product/
│   │       ├── CreateProductController.ts
│   │       └── ListAllProductsController.ts
│   └── services/
│       ├── user/
│       │   ├── CreateUserService.ts
│       │   ├── AuthUserService.ts
│       │   └── DetailUserService.ts
│       ├── category/
│       │   ├── CreateCategoryService.ts
│       │   └── ListAllCategoryService.ts
│       └── product/
│           ├── CreateProductService.ts
│           └── ListAllProductsService.ts
├── package.json
└── tsconfig.json
```

---


## ESTADO DO PROJETO

**Feito**
- Modelagem relacional + migração inicial.
- Express 5, TypeScript estrito, CORS, JSON parser.
- Validação Zod (`createUserSchema`, `authUserSchema`, `createCategorySchema`, `createProductSchema`, `listProductsSchema`) e middleware reutilizável.
- Prisma 7, client em `src/generated/prisma`, adapter **`pg`**.
- **`POST /users`** — persistência, unicidade de e-mail, hash bcrypt.
- **`POST /session`** — login com `bcrypt.compare` + JWT (1h).
- **`GET /me`** — perfil do usuário autenticado (qualquer role).
- **`POST /category`** — criação de categoria (JWT + `ADMIN` + `createCategorySchema`).
- **`GET /categoryall`** — listagem de categorias (JWT, qualquer role).
- **`POST /product`** — criação de produto com upload Multer + Cloudinary (JWT + `ADMIN` + `createProductSchema`).
- **`GET /products`** — listagem de produtos com filtro `disabled` (JWT + `listProductsSchema`).
- Config `multer` (memória, 4 MB, filtro MIME) e `cloudinary`.
- Middleware `userIsAuthenticated`, `isAdminRole` e tipagem `Request.user_id`.

**Em progresso**
- RBAC em demais rotas de domínio (pedidos, itens) quando existirem endpoints.
- Edição e desativação de produtos.
- Coerção tipada de `price` (`z.coerce.number()` em multipart).
- `validateSchema` não repassa dados parseados/transformados para `req`.
- Naming REST: `GET /categoryall` vs `GET /products`.
- Padronização de status HTTP (`201` em `/users`, `403` vs `401` em autorização, `404` para não encontrado).
- Refresh token, revogação e rotação de `JWT_SECRET`.
- Consistência de imports ESM (sufixo `.js`).
- Padronizar path do import de `multer` em `routes.ts`.
- `return` explícito em `userIsAuthenticated` quando token ausente.
- Alinhar mensagem Zod de categoria (`.min(2)` vs texto “3 caracteres”).
- Ordem opcional do pipeline: validar `body`/`query` antes de `isAdminRole` (fail-fast sem consulta ao banco).


---


## DECISÕES TÉCNICAS

- **Prisma 7:** URL do datasource em **`prisma.config.ts`**, não no bloco `datasource` do `schema.prisma` além do `provider`.
- **Adapter `pg`:** client desacoplado do driver; pool e políticas por ambiente.
- **JWT:** `sub` = id do usuário; payload inclui `name` e `email`; expiração fixa **1h**; sem refresh/blacklist no momento; `role` não está no token — autorização admin consulta o banco por request.
- **Rotas protegidas:** identidade via `req.user_id` após `verify`; autorização por papel onde `isAdminRole` está encadeado (`POST /category`, `POST /product`).
- **Validação:** schemas Zod por rota (`userSchema`, `categorySchema`, `productSchema`); em `/category` o Zod roda após auth/RBAC (trade-off: corpo inválido ainda consome JWT + lookup no banco). `POST /product` valida body após multer; `GET /products` valida query após auth (mesmo trade-off com JWT).
- **Upload de produto:** arquivo não persiste em disco — Multer `memoryStorage` envia buffer direto ao Cloudinary via `upload_stream`; URL pública gravada em `Product.banner`.
- **Cloudinary:** credenciais exclusivamente via env; pasta `products`; `public_id` com timestamp + nome do arquivo.
- **Imports ESM:** mistura de imports com e sem sufixo `.js` entre módulos locais — alinhar em refatoração futura.