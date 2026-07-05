# Orders Delivery — Documentação de Contexto

Documento técnico de referência do backend. 
Complementa o [README.md](./README.md), que concentra setup e guia operacional.

---

## Visão Geral

API REST construída em Node.js e TypeScript para gestão de comércios e deliveries com **pedidos em mesa** (balcão). O sistema cobre autenticação de usuários, gestão de cardápio (categorias e produtos) e fluxo de pedidos com itens.


### Escopo atual

| Área | Estado |
|------|--------|
| Modelagem de dados (Prisma + PostgreSQL) | Completa — User, Category, Product, Order, Item |
| Endpoints HTTP | Parcial — **6 rotas** ativas |
| Autenticação JWT | Implementada (`/session`, `/me`) |
| RBAC (role `ADMIN`) | Implementado em `POST /category` e `POST /product` |
| Categorias | Criação (ADMIN) + listagem (`GET /categoryall`, qualquer role autenticada) |
| Produtos | Parcial — `POST /product` com upload Cloudinary; sem listagem, edição ou desativação |
| Pedidos e itens | Modelados no banco; **sem rotas HTTP** |


### Público-alvo

Desenvolvedores que precisam entender a arquitetura, convenções e estado real do projeto sem percorrer todo o código-fonte.

---


## Arquitetura

O backend segue uma **arquitetura em camadas horizontais**, organizada por domínio (`user`, `category`, `product`). Cada caso de uso possui controller e service dedicados.

```mermaid
flowchart TD
  Client[Cliente HTTP] --> Server[server.ts]
  Server --> Routes[routes.ts]
  Routes --> MW[Middlewares]
  MW --> Ctrl[Controllers]
  Ctrl --> Svc[Services]
  Svc --> Prisma[prismaClient]
  Prisma --> DB[(PostgreSQL)]
  Svc --> Cloudinary[Cloudinary CDN]
  Svc -->|throw Error| ErrHandler[Error middleware global]
  MW -->|ZodError| ValErr[400 validação]
  MW -->|JWT ou RBAC fail| AuthErr[401]
```


### Camadas e responsabilidades

| Camada | Responsabilidade | Convenção |
|--------|------------------|-----------|
| **Routes** | Encadeia middlewares e vincula handlers | [`src/routes.ts`](./src/routes.ts) |
| **Controllers** | Extrai dados da requisição, chama service, responde HTTP | Classe com método `handle(req, res)` |
| **Services** | Regras de negócio, acesso ao banco, bcrypt, JWT, upload Cloudinary | Classe com método `execute(...)` |
| **Config** | Integrações externas (Multer, Cloudinary) | [`src/config/`](./src/config/) |
| **Middlewares** | Validação Zod, autenticação JWT, autorização RBAC | Funções/factories reutilizáveis |
| **Schemas** | Contratos de entrada validados com Zod | Um arquivo por domínio |


### Pipelines por tipo de rota

**Rotas públicas (com validação):**
```
Rota → validateSchema → Controller → Service → Prisma
```

**Rotas privadas (qualquer role autenticada):**
```
Rota → userIsAuthenticated → Controller → Service → Prisma
```

**Rotas privadas (role ADMIN):**
```
Rota → userIsAuthenticated → isAdminRole → validateSchema → Controller → Service → Prisma
```

**Rotas privadas (role ADMIN + multipart):**
```
Rota → userIsAuthenticated → isAdminRole → multer.single('file') → validateSchema → Controller → Service → Cloudinary → Prisma
```


### Decisões arquiteturais

- **ESM nativo:** `"type": "module"` no `package.json`; imports locais usam sufixo `.js` (parcialmente inconsistente entre módulos).
- **Prisma 7 + adapter `pg`:** client desacoplado do driver PostgreSQL nativo.
- **JWT sem `role` no payload:** autorização admin consulta o banco a cada request protegido por `isAdminRole`.
- **Sem camada de repositório:** services acessam `prismaClient` diretamente.
- **Sem injeção de dependência:** controllers instanciam services inline.
- **Upload em memória:** Multer `memoryStorage` envia buffer direto ao Cloudinary; URL pública gravada em `Product.banner`.


### Domínios

| Domínio | HTTP | Banco |
|---------|------|-------|
| `user` | Sim — cadastro, login, perfil | Sim |
| `category` | Sim — criação (ADMIN) + listagem | Sim |
| `product` | Parcial — `POST /product` (ADMIN + Cloudinary) | Sim |
| `order` | Não | Sim |
| `item` | Não | Sim |

---


## Tecnologias e Versões

### Runtime e linguagem

| Item | Valor |
|------|-------|
| Runtime | Node.js (ESM — `"type": "module"`) |
| Linguagem | TypeScript **6.0.3** |
| Target de compilação | ES2023 |
| Modo strict | Ativado (`strict: true` + checks adicionais) |
| Execução em dev | `tsx watch --env-file=.env src/server.ts` |


### Dependências de produção

| Pacote | Versão instalada | Papel |
|--------|------------------|-------|
| **express** | 5.2.1 | Framework HTTP, roteador, parser JSON |
| **@prisma/client** | 7.8.0 | ORM — client gerado |
| **@prisma/adapter-pg** | 7.8.0 | Adapter Prisma para driver `pg` |
| **pg** | 8.20.0 | Driver PostgreSQL nativo |
| **zod** | 4.4.3 | Validação de schemas de entrada |
| **bcrypt** | 6.0.0 | Hash e comparação de senhas |
| **jsonwebtoken** | 9.0.3 | Emissão e verificação de JWT |
| **cors** | 2.8.6 | CORS global |
| **dotenv** | 17.4.2 | Carregamento de variáveis (CLI Prisma) |
| **multer** | 2.1.1 | Upload multipart em memória (campo `file`, 4 MB, JPEG/JPG/PNG) |
| **cloudinary** | 2.10.0 | CDN — upload de banner de produto (pasta `products`) |


### Dependências de desenvolvimento

| Pacote | Versão instalada | Papel |
|--------|------------------|-------|
| **typescript** | 6.0.3 | Compilador TS |
| **tsx** | 4.21.0 | Execução TS em dev com hot reload |
| **prisma** | 7.8.0 | CLI — schema, migrate, generate |
| **@types/node** | ^25.7.0 | Tipagens Node |
| **@types/express** | ^5.0.6 | Tipagens Express 5 |
| **@types/cors** | ^2.8.19 | Tipagens CORS |
| **@types/pg** | ^8.20.0 | Tipagens pg |
| **@types/bcrypt** | ^6.0.0 | Tipagens bcrypt |
| **@types/jsonwebtoken** | ^9.0.10 | Tipagens JWT |
| **@types/multer** | ^2.1.0 | Tipagens Multer |


### Pré-requisitos externos

- **PostgreSQL** acessível via `DATABASE_URL`
- **Conta Cloudinary** — obrigatória para `POST /product` (upload de banner)


### Scripts disponíveis

```json
"dev": "tsx watch --env-file=.env src/server.ts"
```

Não há scripts `build`, `start` ou `test` configurados no momento.

---


## Estrutura de Pastas

```
backend/
├── CONTEXT.md                  # Este documento
├── README.md                   # Setup e guia operacional
├── package.json
├── package-lock.json
├── tsconfig.json               # Configuração TypeScript
├── prisma.config.ts            # Config Prisma 7 (URL do banco)
├── prisma/
│   ├── schema.prisma           # Modelos e enums
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260512205022_init/
│           └── migration.sql   # Migração inicial
├── src/
│   ├── server.ts               # Entry point — Express app
│   ├── routes.ts               # Definição centralizada de rotas
│   ├── @types/
│   │   └── express/
│   │       └── index.d.ts      # Extensão Request.user_id
│   ├── prisma/
│   │   └── index.ts            # PrismaClient + adapter pg
│   ├── generated/
│   │   └── prisma/             # Client gerado (gitignored)
│   ├── config/
│   │   ├── multer.ts           # memoryStorage, 4MB, JPEG/JPG/PNG
│   │   └── cloudinary.ts       # Credenciais via env
│   ├── middlewares/
│   │   ├── validateSchema.ts   # Validação Zod reutilizável
│   │   ├── userIsAuthenticated.ts  # JWT Bearer
│   │   └── isAdminRole.ts      # RBAC ADMIN
│   ├── schemas/
│   │   ├── userSchema.ts       # createUserSchema, authUserSchema
│   │   ├── categorySchema.ts   # createCategorySchema
│   │   └── productSchema.ts    # createProductSchema
│   ├── controllers/
│   │   ├── user/
│   │   │   ├── CreateUserController.ts
│   │   │   ├── AuthUserController.ts
│   │   │   └── DetailUserController.ts
│   │   ├── category/
│   │   │   ├── CreateCategoryController.ts
│   │   │   └── ListAllCategoryController.ts
│   │   └── product/
│   │       └── CreateProductController.ts
│   └── services/
│       ├── user/
│       │   ├── CreateUserService.ts
│       │   ├── AuthUserService.ts
│       │   └── DetailUserService.ts
│       ├── category/
│       │   ├── CreateCategoryService.ts
│       │   └── ListAllCategoryService.ts
│       └── product/
│           └── CreateProductService.ts
└── dist/                       # Build legado/desatualizado — não usar como referência
```


### Observações

- **`src/generated/prisma`** é gerado por `npx prisma generate` e está no `.gitignore`. Rode o generate após clone ou em CI.
- **`.env`** não é versionado; é obrigatório para runtime e CLI Prisma.
- **`dist/`** contém artefatos compilados desatualizados (ex.: rota legada `GET /users` que não existe em `src/routes.ts`).

---


## Modelagem do Banco de Dados

**ORM:** Prisma 7  
**Banco:** PostgreSQL  
**Schema:** [`prisma/schema.prisma`](./prisma/schema.prisma)  
**Migração inicial:** `prisma/migrations/20260512205022_init/`


### Diagrama de relações

```mermaid
erDiagram
  Category ||--o{ Product : "possui"
  Order ||--o{ Item : "contém"
  Product ||--o{ Item : "referenciado_em"
```

> **User** não possui relação direta com Category no schema; a criação de categorias é autorizada por role `ADMIN` na camada HTTP, não por FK.


### Entidades

#### User → tabela `users`

| Campo | Tipo | Detalhes |
|-------|------|----------|
| `id` | UUID | PK, `@default(uuid())` |
| `name` | String | Nome do usuário |
| `email` | String | Único (`@unique`) |
| `password` | String | Hash bcrypt (aplicação) |
| `role` | Enum `Role` | `STAFF` (default) ou `ADMIN` |
| `createdAt` / `updatedAt` | DateTime | Timestamps automáticos |


#### Category → tabela `categories`

| Campo | Tipo | Detalhes |
|-------|------|----------|
| `id` | UUID | PK |
| `name` | String | Nome da categoria |
| `products` | Relação | 1:N com Product |


#### Product → tabela `products`

| Campo | Tipo | Detalhes |
|-------|------|----------|
| `id` | UUID | PK |
| `name` | String | Nome do produto |
| `price` | Int | Valor em **centavos** |
| `description` | String | Descrição |
| `banner` | String | URL pública do Cloudinary (`secure_url`) |
| `disabled` | Boolean | Default `false` — ver nota abaixo |
| `category_id` | UUID | FK → Category, `ON DELETE CASCADE` |


#### Order → tabela `orders`

| Campo | Tipo | Detalhes |
|-------|------|----------|
| `id` | UUID | PK |
| `table` | Int | Número da mesa |
| `status` | Boolean | Default `false` — `false` = pendente, `true` = pronto |
| `draft` | Boolean | Default `true` — ver nota abaixo |
| `name` | String? | Nome opcional do cliente |
| `itens` | Relação | 1:N com Item (`@map("items")`) |


#### Item → tabela `items`

| Campo | Tipo | Detalhes |
|-------|------|----------|
| `id` | UUID | PK |
| `amount` | Int | Quantidade |
| `order_id` | UUID | FK → Order, `ON DELETE CASCADE` |
| `product_id` | UUID | FK → Product, `ON DELETE CASCADE` |


### Enum Role

```
STAFF  — operador padrão (default no cadastro)
ADMIN  — administrador (acesso a rotas protegidas por isAdminRole)
```


### Notas sobre campos booleanos

Os comentários em `schema.prisma` para `Product.disabled` e `Order.draft` podem estar **semanticamente invertidos** em relação ao nome do campo. Antes de integrar o frontend, alinhar a semântica esperada (ativo/inativo, rascunho/enviado) com o comportamento real no banco.


### Instanciação do Prisma Client

```typescript
// src/prisma/index.ts
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prismaClient = new PrismaClient({ adapter });
```

No Prisma 7, a URL do datasource fica em [`prisma.config.ts`](./prisma.config.ts), não no bloco `datasource` do schema (apenas `provider = "postgresql"`).

---


## Middlewares

### Middlewares globais

Definidos em [`src/server.ts`](./src/server.ts), aplicados a todas as requisições:

| Ordem | Middleware | Função |
|-------|------------|--------|
| 1 | `express.json()` | Parse do body JSON |
| 2 | `cors()` | CORS permissivo global |
| 3 | `router` | Rotas da aplicação |
| 4 | Error handler (4 parâmetros) | Captura erros lançados nos handlers |

**Error handler global:**

```typescript
app.use((error: Error, _, res, next) => {
  if (error instanceof Error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: "Erro no servidor interno!" });
});
```

Services lançam `throw new Error("mensagem")` para erros de negócio; o Express 5 propaga rejeições de handlers `async` para este middleware.


### Middlewares por rota

#### `validateSchema` — [`src/middlewares/validateSchema.ts`](./src/middlewares/validateSchema.ts)

Factory que recebe um schema Zod e valida `body`, `query` e `params` da requisição.

| Situação | Status | Resposta |
|----------|--------|----------|
| Validação OK | — | `next()` |
| Erro Zod | 400 | `{ error: "Erro de validação!", details: [{ message }] }` |
| Erro interno | 500 | `{ error: "Erro interno do servidor" }` |

#### `userIsAuthenticated` — [`src/middlewares/userIsAuthenticated.ts`](./src/middlewares/userIsAuthenticated.ts)

Extrai token Bearer do header `Authorization`, verifica com `JWT_SECRET` e define `req.user_id` a partir do claim `sub`.

| Situação | Status | Resposta |
|----------|--------|----------|
| Token ausente | 401 | `{ error: "Token não fornecido!" }` |
| Token inválido/expirado | 401 | `{ error: "Token inválido!" }` |
| Token válido | — | `req.user_id = sub` → `next()` |

**Débito técnico:** quando o token está ausente, o middleware responde 401 mas **não faz `return`**, o que pode causar erro ao chamar `authToken.split(" ")` na linha seguinte.

#### `isAdminRole` — [`src/middlewares/isAdminRole.ts`](./src/middlewares/isAdminRole.ts)

Executa após `userIsAuthenticated`. Consulta o usuário no banco e exige `role === "ADMIN"`.

| Situação | Status | Resposta |
|----------|--------|----------|
| `user_id` ausente | 401 | `{ error: "Usuário não tem permissão!" }` |
| Usuário inexistente | 401 | `{ error: "Usuário não tem permissão!" }` |
| Role diferente de ADMIN | 401 | `{ error: "Usuário não tem permissão!" }` |
| Role ADMIN | — | `next()` |

> A API usa **401** também para negação de papel. A convenção REST costuma reservar **403 Forbidden** para esse caso — backlog de padronização.

Rotas protegidas por `isAdminRole`: `POST /category`, `POST /product`.


### Tipagem Express

[`src/@types/express/index.d.ts`](./src/@types/express/index.d.ts) estende `Request` com:

```typescript
declare namespace Express {
  export interface Request {
    user_id: string;
  }
}
```

---

## Integrações Externas

Além do PostgreSQL, o backend integra serviços externos para upload de mídia de produtos.


### Multer — [`src/config/multer.ts`](./src/config/multer.ts)

| Propriedade | Valor |
|-------------|-------|
| Storage | `memoryStorage()` — buffer em memória, sem persistência em disco |
| Campo | `file` (via `uploadFiles.single('file')` em [`src/routes.ts`](./src/routes.ts)) |
| Limite | **4 MB** (`fileSize: 4 * 1024 * 1024`) |
| MIME permitidos | `image/jpeg`, `image/jpg`, `image/png` |

Erros de filtro ou tamanho lançam `Error` com mensagem descritiva → handler global retorna **400**.


### Cloudinary — [`src/config/cloudinary.ts`](./src/config/cloudinary.ts)

| Propriedade | Valor |
|-------------|-------|
| SDK | `cloudinary` v2 |
| Credenciais | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Upload | `upload_stream` em [`CreateProductService`](./src/services/product/CreateProductService.ts) |
| Pasta | `products` |
| `public_id` | `{timestamp}-{nomeArquivo}` (sem extensão) |
| Persistência | `secure_url` gravada em `Product.banner` |

Fluxo: Multer captura buffer → service envia stream ao Cloudinary → URL retornada → `product.create` no Prisma.

---


## Validação com Schemas

Validação centralizada com **Zod 4**. Schemas encapsulam a estrutura `{ body, query, params }` e são consumidos pelo middleware `validateSchema`.


### Padrão de uso

```typescript
// Definição do schema
export const createUserSchema = z.object({
  body: z.object({ name: z.string().min(3).trim(), /* ... */ })
});

// Encadeamento na rota
router.post("/users", validateSchema(createUserSchema), controller.handle);
```


### Schemas disponíveis

#### `createUserSchema` — [`src/schemas/userSchema.ts`](./src/schemas/userSchema.ts)

Rota: `POST /users`

| Campo | Regras |
|-------|--------|
| `name` | String, mínimo **3** caracteres após `trim` |
| `email` | `z.email()`, regex (minúsculas no local-part), `trim`, `toLowerCase()` |
| `password` | String, mínimo **6** caracteres, `trim` |

#### `authUserSchema` — [`src/schemas/userSchema.ts`](./src/schemas/userSchema.ts)

Rota: `POST /session`

| Campo | Regras |
|-------|--------|
| `email` | Mesmas regras de `createUserSchema.email` |
| `password` | Mesmas regras de `createUserSchema.password` |

#### `createCategorySchema` — [`src/schemas/categorySchema.ts`](./src/schemas/categorySchema.ts)

Rota: `POST /category`

| Campo | Regras |
|-------|--------|
| `name` | String, mínimo **2** caracteres após `trim`; `toLowerCase()`; regex `^[a-z]+$` (somente letras minúsculas) |

**Inconsistência documentada:** a regra usa `.min(2)`, mas a mensagem de erro menciona "Mínimo de **3** caracteres". Alinhar regra e mensagem em refatoração futura.

#### `createProductSchema` — [`src/schemas/productSchema.ts`](./src/schemas/productSchema.ts)

Rota: `POST /product` (campos do body em `multipart/form-data`)

| Campo | Regras |
|-------|--------|
| `name` | String, mínimo **2** caracteres, `trim` |
| `price` | String (multipart), mínimo **1** caractere, `trim` — coercido com `Number()` no service |
| `description` | String, mínimo **1** caractere, `trim` |
| `category_id` | String, `trim` |

> Campos multipart chegam como string. `price` ainda não usa `z.coerce.number()` — backlog de coerção tipada.


### Resposta de erro de validação

```json
{
  "error": "Erro de validação!",
  "details": [
    { "message": "Mínimo 3 caracteres no nome!" }
  ]
}
```


### Schemas pendentes

Não existem schemas Zod para **Order** ou **Item** — domínios ainda sem endpoints HTTP.

---


## Endpoints

**Base URL:** `http://localhost:{PORT}` — padrão **3333**

### Resumo

| Método | Path | Auth | Pipeline | Status sucesso |
|--------|------|------|----------|----------------|
| POST | `/users` | Não | validate → CreateUser | 200 |
| POST | `/session` | Não | validate → AuthUser | 200 |
| GET | `/me` | JWT | userIsAuthenticated → DetailUser | 200 |
| POST | `/category` | JWT + ADMIN | auth → isAdmin → validate → CreateCategory | 201 |
| GET | `/categoryall` | JWT | auth → ListAllCategory | 200 |
| POST | `/product` | JWT + ADMIN | auth → admin → multer → validate → CreateProduct → Cloudinary | 201 |

---


### POST `/users`

Cadastra um novo usuário.

**Auth:** não requerida.

**Body:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Pipeline:** `validateSchema(createUserSchema)` → `CreateUserController` → `CreateUserService`

**Lógica de negócio:**
- Verifica unicidade de e-mail
- Hash da senha com bcrypt (salt rounds: **8**)
- Role persistida como `STAFF` (default do banco; body não aceita `role`)

**Sucesso — 200:**

```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "STAFF",
  "createdAt": "2026-05-23T..."
}
```

**Erros:**

| Status | Mensagem | Causa |
|--------|----------|-------|
| 400 | `"Erro de validação!"` + `details` | Body inválido (Zod) |
| 400 | `"O usuário já existe!"` | E-mail duplicado |

---


### POST `/session`

Autentica usuário e retorna JWT.

**Auth:** não requerida.

**Body:**

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Pipeline:** `validateSchema(authUserSchema)` → `AuthUserController` → `AuthUserService`

**Lógica de negócio:**
- Busca usuário por e-mail
- Compara senha com `bcrypt.compare`
- Emite JWT com payload `{ name, email }`, `subject: user.id`, `expiresIn: "1h"`

**Sucesso — 200:**

```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "STAFF",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Erros:**

| Status | Mensagem | Causa |
|--------|----------|-------|
| 400 | `"Erro de validação!"` + `details` | Body inválido (Zod) |
| 400 | `"Email/Senha é obrigatório"` | Usuário inexistente ou senha incorreta |

> Mensagem única para ambos os casos — não revela se o e-mail existe (segurança básica).

---


### GET `/me`

Retorna perfil do usuário autenticado.

**Auth:** Bearer JWT (qualquer role: `STAFF` ou `ADMIN`).

**Header:** `Authorization: Bearer <token>`

**Pipeline:** `userIsAuthenticated` → `DetailUserController` → `DetailUserService`

**Sucesso — 200:**

```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "STAFF",
  "createdAt": "2026-05-23T..."
}
```

**Erros:**

| Status | Mensagem | Causa |
|--------|----------|-------|
| 401 | `"Token não fornecido!"` | Header ausente |
| 401 | `"Token inválido!"` | Token expirado ou inválido |
| 400 | `"Usuário não encontrado!"` | ID do token não existe no banco |

---


### POST `/category`

Cria uma nova categoria no cardápio.

**Auth:** Bearer JWT + role **ADMIN**.

**Header:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "name": "Pizzas"
}
```

**Pipeline:** `userIsAuthenticated` → `isAdminRole` → `validateSchema(createCategorySchema)` → `CreateCategoryController` → `CreateCategoryService`

**Sucesso — 201:**

```json
{
  "id": "uuid",
  "name": "Pizzas",
  "createdAt": "2026-05-23T..."
}
```

**Erros:**

| Status | Mensagem | Causa |
|--------|----------|-------|
| 401 | `"Token não fornecido!"` / `"Token inválido!"` | Falha de autenticação |
| 401 | `"Usuário não tem permissão!"` | Role diferente de ADMIN ou usuário inexistente |
| 400 | `"Erro de validação!"` + `details` | Body inválido (Zod) |
| 400 | `"Erro ao criar categoria!"` | Falha na persistência |

---


### GET `/categoryall`

Lista todas as categorias do cardápio.

**Auth:** Bearer JWT (qualquer role: `STAFF` ou `ADMIN`).

**Header:** `Authorization: Bearer <token>`

**Pipeline:** `userIsAuthenticated` → `ListAllCategoryController` → `ListAllCategoryService`

**Lógica de negócio:**
- `findMany` com `select: { id, name, createdAt }`
- Ordenação por `name` desc

**Sucesso — 200:**

```json
[
  { "id": "uuid", "name": "pizzas", "createdAt": "2026-05-23T..." },
  { "id": "uuid", "name": "bebidas", "createdAt": "2026-05-23T..." }
]
```

**Erros:**

| Status | Mensagem | Causa |
|--------|----------|-------|
| 401 | `"Token não fornecido!"` / `"Token inválido!"` | Falha de autenticação |
| 400 | `"Erro ao buscar as categorias!"` | Falha na consulta |

---


### POST `/product`

Cria um novo produto com upload de banner via Cloudinary.

**Auth:** Bearer JWT + role **ADMIN**.

**Header:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data` (não JSON)

**Campos:**

| Campo | Origem | Detalhes |
|-------|--------|----------|
| `file` | multipart | Obrigatório; JPEG/JPG/PNG; máx. **4 MB** |
| `name` | body | Validado por `createProductSchema` |
| `price` | body | String → `Number()` no service; persistido em **centavos** (`Int`) |
| `description` | body | Validado por `createProductSchema` |
| `category_id` | body | UUID; categoria deve existir no banco |

**Pipeline:** `userIsAuthenticated` → `isAdminRole` → `uploadFiles.single('file')` → `validateSchema(createProductSchema)` → `CreateProductController` → `CreateProductService` → Cloudinary → Prisma

**Lógica de negócio:**
- Valida existência da categoria (`findFirst` por `category_id`)
- Upload do buffer via `cloudinary.uploader.upload_stream` (pasta `products`)
- Persiste produto com `banner` = `secure_url` do Cloudinary

**Sucesso — 201:**

```json
{
  "id": "uuid",
  "name": "Pizza Margherita",
  "price": 4590,
  "description": "Molho, mussarela e manjericão",
  "category_id": "uuid",
  "banner": "https://res.cloudinary.com/.../products/....jpg",
  "createdAt": "2026-07-04T..."
}
```

**Erros:**

| Status | Mensagem | Causa |
|--------|----------|-------|
| 401 | `"Token não fornecido!"` / `"Token inválido!"` | Falha de autenticação |
| 401 | `"Usuário não tem permissão!"` | Role diferente de ADMIN ou usuário inexistente |
| 400 | `"Erro de validação!"` + `details` | Campos do body inválidos (Zod) |
| 400 | `"A imagem do produto é obrigatória!"` | Campo `file` ausente |
| 400 | `"Categoria não encontrada!"` | `category_id` inexistente |
| 400 | `"Erro ao fazer upload da imagem!"` | Falha no Cloudinary |
| 400 | Mensagem do Multer | Formato inválido ou arquivo acima de 4 MB |

### Token JWT — especificação

| Propriedade | Valor |
|-------------|-------|
| Algoritmo | HS256 (default jsonwebtoken) |
| Secret | `JWT_SECRET` (variável de ambiente) |
| Payload | `{ name, email }` |
| Subject (`sub`) | ID do usuário (UUID) |
| Expiração | 1 hora |
| Role no token | **Não incluída** — consultada no banco quando necessário |

---


## Fluxo de Requisição

### Boot da aplicação

```
npm run dev
  └── tsx watch --env-file=.env src/server.ts
        ├── Carrega .env (PORT, DATABASE_URL, JWT_SECRET, CLOUDINARY_*)
        ├── Instancia Express
        ├── Registra middlewares globais (json, cors, router)
        ├── Registra error handler
        └── app.listen(PORT || 3333)
```


### Fluxo: POST `/users` (rota pública com validação)

```mermaid
sequenceDiagram
  participant C as Cliente
  participant S as server.ts
  participant V as validateSchema
  participant Ctrl as CreateUserController
  participant Svc as CreateUserService
  participant P as prismaClient
  participant DB as PostgreSQL

  C->>S: POST /users { name, email, password }
  S->>V: parse body JSON
  alt body inválido
    V-->>C: 400 { error, details }
  else body válido
    V->>Ctrl: next()
    Ctrl->>Svc: execute({ name, email, password })
    Svc->>P: findFirst(email)
    alt email duplicado
      Svc-->>C: 400 "O usuário já existe!"
    else email livre
      Svc->>Svc: bcrypt.hash(password, 8)
      Svc->>P: user.create()
      P->>DB: INSERT users
      DB-->>P: user
      P-->>Svc: user (sem password)
      Svc-->>Ctrl: user
      Ctrl-->>C: 200 { id, name, email, role, createdAt }
    end
  end
```


### Fluxo: POST `/session` (login)

```
Cliente → validateSchema → AuthUserController → AuthUserService
  → findFirst(email) → bcrypt.compare → jwt.sign → 200 { ..., token }
```


### Fluxo: GET `/me` (rota privada)

```
Cliente → userIsAuthenticated (jwt.verify → req.user_id)
  → DetailUserController → DetailUserService → findFirst(id) → 200 { perfil }
```


### Fluxo: POST `/category` (rota privada ADMIN)

```
Cliente → userIsAuthenticated → isAdminRole (consulta role no DB)
  → validateSchema → CreateCategoryController → CreateCategoryService
  → category.create → 201 { id, name, createdAt }
```


### Fluxo: GET `/categoryall` (rota privada)

```
Cliente → userIsAuthenticated (jwt.verify → req.user_id)
  → ListAllCategoryController → ListAllCategoryService
  → category.findMany (orderBy name desc) → 200 [ { id, name, createdAt }, ... ]
```


### Fluxo: POST `/product` (rota privada ADMIN + multipart)

```
Cliente → userIsAuthenticated → isAdminRole
  → multer.single('file') (buffer em memória)
  → validateSchema(createProductSchema)
  → CreateProductController → CreateProductService
  → findFirst(category_id) → upload_stream(Cloudinary) → product.create → 201 { ..., banner }
```


### Tratamento de erros

```
Service lança throw new Error("mensagem")
  → Express 5 propaga para error middleware global
  → res.status(400).json({ error: "mensagem" })
```

Controllers **não** fazem `try/catch` — delegam tratamento ao middleware global.

---


## Configurações do Projeto

### Variáveis de ambiente

Arquivo `.env` na raiz do backend (não versionado):

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO"
PORT=3333
JWT_SECRET="sua-chave-secreta-forte-aqui"
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

| Variável | Onde é usada | Obrigatória para |
|----------|--------------|------------------|
| `DATABASE_URL` | `src/prisma/index.ts`, `prisma.config.ts` | Runtime e CLI Prisma |
| `PORT` | `src/server.ts` (fallback 3333) | Opcional |
| `JWT_SECRET` | `AuthUserService`, `userIsAuthenticated` | Rotas autenticadas (`/me`, `/category`, `/categoryall`, `/product`) |
| `CLOUDINARY_CLOUD_NAME` | `src/config/cloudinary.ts` | `POST /product` |
| `CLOUDINARY_API_KEY` | `src/config/cloudinary.ts` | `POST /product` |
| `CLOUDINARY_API_SECRET` | `src/config/cloudinary.ts` | `POST /product` |


### Dupla carga de variáveis

| Contexto | Mecanismo |
|----------|-----------|
| API em dev | `tsx --env-file=.env` (script `dev`) |
| CLI Prisma | `import "dotenv/config"` em `prisma.config.ts` |

Manter um único `.env` na raiz para ambos os contextos.


### Arquivos de configuração

| Arquivo | Propósito |
|---------|-----------|
| [`package.json`](./package.json) | Dependências, scripts, `"type": "module"` |
| [`tsconfig.json`](./tsconfig.json) | TS strict, target ES2023, outDir `dist`, rootDir `src` |
| [`prisma.config.ts`](./prisma.config.ts) | Schema path, migrations path, datasource URL (Prisma 7) |
| [`prisma/schema.prisma`](./prisma/schema.prisma) | Modelos; client output em `src/generated/prisma` |
| [`.gitignore`](./.gitignore) | Ignora `node_modules`, `.env`, client gerado |


### Comandos essenciais

```bash
# Instalar dependências
npm install

# Gerar Prisma Client (obrigatório após clone)
npx prisma generate

# Aplicar migrações (desenvolvimento)
npx prisma migrate dev

# Aplicar migrações (CI / deploy)
npx prisma migrate deploy

# Iniciar servidor em dev
npm run dev
```

Para setup detalhado, consulte o [README.md](./README.md).

---


## Estado do Projeto e Débitos Técnicos

### Implementado

- Modelagem relacional completa + migração inicial
- Express 5, TypeScript strict, CORS, JSON parser
- Validação Zod reutilizável (`validateSchema`)
- Prisma 7 com adapter `pg` e client em `src/generated/prisma`
- Cadastro de usuário com hash bcrypt e unicidade de e-mail
- Login com JWT (expiração 1h)
- Perfil do usuário autenticado (`GET /me`)
- Criação de categoria com JWT + RBAC ADMIN (`POST /category`)
- Listagem de categorias autenticada (`GET /categoryall`)
- Criação de produto com JWT + RBAC ADMIN + Multer + Cloudinary (`POST /product`)
- Schemas Zod: `createUserSchema`, `authUserSchema`, `createCategorySchema`, `createProductSchema`
- Config `multer` (memória, 4 MB, filtro MIME) e `cloudinary`
- Middlewares `userIsAuthenticated` e `isAdminRole`
- Tipagem `Request.user_id`


### Pendente (domínio)

- Product: listagem, edição e desativação (`disabled`)
- Endpoints HTTP para **Order** e **Item**
- Schemas Zod para Order e Item
- Coerção tipada de `price` (`z.coerce.number()` em multipart)
- RBAC em rotas futuras de pedidos/itens


### Débitos técnicos conhecidos

| Item | Descrição |
|------|-----------|
| `userIsAuthenticated` | Falta `return` após responder 401 quando token ausente |
| Status HTTP | `POST /users` retorna 200 (ideal: 201); negação de role usa 401 (ideal: 403) |
| Mensagem Zod categoria | `.min(2)` vs texto "3 caracteres" |
| Ordem do pipeline `/category` | Validação Zod roda após auth/RBAC — body inválido ainda consome JWT + lookup no banco |
| Ordem do pipeline `/product` | Zod roda após multer (correto para multipart); auth/RBAC ainda consome JWT antes da validação |
| Import path `multer` | `routes.ts` usa `"../src/config/multer"` em vez de `"./config/multer.js"` |
| Import ESM `productSchema` | Sem sufixo `.js` (inconsistente com outros imports locais) |
| `price` como string | Multipart + Zod string + `Number()` no service — risco de NaN |
| Imports ESM | Mistura de imports com e sem sufixo `.js` entre módulos |
| Semântica booleanos | Comentários de `disabled` e `draft` podem estar invertidos no schema |
| `dist/` desatualizado | Build legado não reflete `src/` |
| Sem `.env.example` | Ausência de template versionado para variáveis de ambiente |
| Scripts de deploy | Sem `build` / `start` no `package.json` |
| JWT | Sem refresh token, revogação ou rotação de secret |

---

*Documento gerado com base no estado do repositório em julho/2026.*