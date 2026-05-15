# BACKEND JS — Orders Delivery

Uma API com features e recursos **pedidos, cardápio, usuários com hash, sessões** (fluxo restaurante → balcão de mesa) desenvolvida com ecossistema Javascript.

| **Modelo de dados**
PostgreSQL via Prisma: usuários, categorias, produtos, pedidos e itens.

**HTTP implementado** 
`POST /users` (persistência real) e `POST /session` (**esboço** de login, sem token/sessão).

**Domínio cardápio/pedido**
Modelos e tabelas prontos.

Público-alvo desta documentação: **Tech Lead**, **Desenvolvedor Sênior** e **Arquiteto de Software**.

---


## STACK

| Camada | Tecnologia | Uso no repositório |
|--------|------------|-------------------|
| Runtime | Node.js | `type: "module"` (ESM). |
| HTTP | Express 5 | App, JSON body, roteador central, handler de erro global. |
| Linguagem | TypeScript 6 | `strict` e opções adicionais em `tsconfig.json`. |
| Execução dev | tsx | `tsx watch --env-file=.env src/server.ts` — carrega `.env` no processo da API. |
| ORM | Prisma 7 | Schema, migrações, client gerado. |
| Client DB | `pg` + `@prisma/adapter-pg` | Pool/driver nativo; `PrismaClient` instanciado com adapter em `src/prisma/index.ts`. |
| Banco | PostgreSQL | Datasource; URL em `prisma.config.ts` e runtime. |
| Validação | Zod 4 | Schemas por rota; middleware `validateSchema`. |
| Segurança (senha) | bcrypt | Hash na criação de usuário (`CreateUserService`), custo **8**. |
| Config/CLI | dotenv | `import "dotenv/config"` em `prisma.config.ts` para comandos Prisma (migração, generate). |
| CORS | cors | Middleware global em `src/server.ts`. |

Tipagens de desenvolvimento: 
`@types/node`, `@types/express`, `@types/cors`, `@types/pg`, `@types/bcrypt`.

---

## ARQUITETURA HTTP

Fluxo padrão: 
**rota → validação Zod → controller → service → Prisma (quando aplicável)**.

```mermaid
flowchart
  http [Camada HTTP]
    R[routes] --> V[validateSchema Zod] --> C[controllers] --> S[services] --> P[PrismaClient]
```

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
```

- **`DATABASE_URL`:** 
Lida em runtime por `src/prisma/index.ts` e pela CLI Prisma via `prisma.config.ts` (que usa `dotenv/config`).
- **`PORT`:** 
`src/server.ts` usa `process.env.PORT` com fallback **3333**.

**Dupla origem de env:** 
em desenvolvimento, o script `dev` injeta o mesmo arquivo com `--env-file=.env` (tsx); o Prisma em CLI carrega variáveis via `prisma.config.ts` + dotenv. Mantenha um único `.env` na raiz para evitar divergência.


### 3. PRISMA: generate e migrações
O client é gerado em **`src/generated/prisma`** (`output` no `schema.prisma`).

```bash
npx prisma generate
```

Aplicar schema ao banco:
- **Desenvolvimento:** `npx prisma migrate dev`
- **CI / deploy:** `npx prisma migrate deploy`

Migração inicial: 
`prisma/migrations/20260512205022_init/`.

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
| **User** | `users` | UUID; `email` único; `password` persistido como hash (app); `Role` `STAFF` \| `ADMIN` (default `STAFF`); timestamps. |
| **Category** | `categories` | Nome; <1:N> com produtos. |
| **Product** | `products` | FK `category_id` com `ON DELETE CASCADE`; `price` inteiro em **centavos**; `description`, `banner`; `disabled` — `true` = fora do cardápio (default `false`). |
| **Order** | `orders` | `table` (mesa); `status` bool — `false` pendente / `true` pronto; `draft` bool — `false` rascunho / `true` enviado à cozinha (default `true` no banco; semântica e nome legados, ver comentários no schema); `name` opcional. |
| **Item** | `items` | `amount`; FKs `order_id` e `product_id` com CASCADE. No Prisma: relação `Order.itens` → `@map("items")`. |

---

## API

### Validação (comum)
- Middleware `validateSchema`: valida `body`, `query` e `params` contra o schema Zod da rota.
- **Erro Zod:** `400` com corpo `{ "error": "Erro de validação!", "details": [ { "message": "..." } ] }`.


### `POST /users`
- **Pipeline:** `validateSchema(createUserSchema)` → `CreateUserController` → `CreateUserService`.
- **Corpo (JSON):**

| Campo | Regras (conforme `userSchema.ts`) |
|--------|-------------------------------------|
| `name` | string, mínimo **3** caracteres após `trim`. |
| `email` | `z.email`, regex adicional (caracteres em minúsculas no local-part conforme regex), `trim`, `toLowerCase`. |
| `password` | string, mínimo **6** caracteres, `trim` (sem `toLowerCase` obrigatório; sem regra de “obrigar dígito + letra” no Zod atual). |

- **Sucesso:** `CreateUserService` verifica e-mail duplicado (`findFirst`), aplica **`bcrypt.hash`**, persiste com **`prisma.user.create`** e devolve JSON com `id`, `name`, `email`, `role`, `createdAt` (sem `password`). O controller usa **`res.json(...)`** sem status explícito ⇒ **200** padrão do Express (não **201**; evolução possível em PR futuro).
- **Conflito:** e-mail já existente ⇒ `throw new Error("O usuário já existe!")` ⇒ tratado pelo handler global (vide abaixo).


### `POST /session`
- **Intenção:** login “por sessão” (comentário na rota); implementação ainda **não** persiste sessão nem emite JWT/cookie.
- **Pipeline:** `validateSchema(authUserSchema)` → `AuthUserController` → `AuthUserService`.
- **Corpo:** mesmas regras gerais de `email` e `password` que em `authUserSchema` (espelha validação de login).
- **Comportamento atual:** serviço faz `console.log` e retorna string fixa **`"Usuário LOGADO"`** em JSON. **Roadmap típico:** comparar hash com `bcrypt.compare`, JWT ou sessão server-side, refresh, revogação — definir com produto/segurança.

### Handler global de erros (`src/server.ts`)

---


## ESTRUTURA DE PASTAS

```
backend/
├── prisma.config.ts              # defineConfig Prisma: schema, migrations, datasource URL
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── server.ts
│   ├── routes.ts
│   ├── prisma/
│   │   └── index.ts              # PrismaClient + adapter pg
│   ├── generated/prisma/         # client gerado (não editar à mão)
│   ├── middlewares/
│   │   └── validateSchema.ts
│   ├── schemas/
│   │   └── userSchema.ts         # createUserSchema, authUserSchema
│   ├── controllers/user/
│   │   ├── CreateUserController.ts
│   │   └── AuthUserController.ts
│   └── services/user/
│       ├── CreateUserService.ts
│       └── AuthUserService.ts
├── package.json
└── tsconfig.json
```

---


## ESTADO DO PROJETO

**Feito**
- Modelagem relacional + migração inicial alinhada ao schema.
- Express 5, TypeScript estrito, CORS, JSON parser.
- Validação centralizada com Zod e middleware reutilizável.
- Prisma 7, output customizado em `src/generated/prisma`, adapter **`pg`**.
- **`POST /users`** com persistência, unicidade de e-mail e hash de senha.

**Em progresso / esboço**
- **`POST /session`:** contrato HTTP e validação prontos; lógica de autenticação e sessão ainda placeholder.

**Não iniciado (exemplos)**
- Rotas HTTP para categorias, produtos, pedidos e itens.
- Health check, versionamento de API, métricas, rate limit.

---


## DECISÕES TÉCNICAS
- **Prisma 7:** URL do datasource concentrada em **`prisma.config.ts`**, não no bloco `datasource` do `schema.prisma` além do `provider`.
- **Adapter `pg`:** desacopla o client do driver; facilita políticas de pool e ambientes que exigem driver nativo.
- **Validação:** um middleware recebe schemas Zod distintos por rota (`createUserSchema`, `authUserSchema`).
- **Consistência de imports:** parte do código ainda importa módulos locais **sem** sufixo `.js` (ex.: `AuthUserController` → `AuthUserService`, `CreateUserService` → `prisma`).
