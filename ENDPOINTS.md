# Endpoints do Projeto (Sistema de pedidos)

## Visão Geral

Este documento descreve todos os endpoints HTTP implementados no backend do Orders Delivery, incluindo métodos HTTP, autenticação, validação e requisições/respostas.

## Tabela de Endpoints

| Método | Endpoint | Descrição | Autenticação | Role | Validação | Exemplos |
|--------|----------|-------------|--------------|------|-----------|----------|
| POST | `/users` | Criar um novo usuário | Nenhuma | - | Zod (createUserSchema) | [Ver Requisição](#1-post--users)<br>[Ver Resposta](#1-post--users) |
| POST | `/session` | Autenticar usuário e obter token JWT | Nenhuma | - | Zod (authUserSchema) | [Ver Requisição](#2-post--session)<br>[Ver Resposta](#2-post--session) |
| GET | `/me` | Obter dados do usuário logado | Bearer JWT | USER | Nenhuma | [Ver Requisição](#3-get--me)<br>[Ver Resposta](#3-get--me) |
| GET | `/categoryall` | Listar todas as categorias | Bearer JWT | USER | Nenhuma | [Ver Requisição](#4-get--categoryall)<br>[Ver Resposta](#4-get--categoryall) |
| GET | `/category/product` | Listar produtos de uma categoria específica | Bearer JWT | USER | Zod (listProductsByCategorySchema) | [Ver Requisição](#5-get--category-product)<br>[Ver Resposta](#5-get--category-product) |
| GET | `/products` | Listar todos os produtos com filtros opcionais | Bearer JWT | USER | Zod (listProductsSchema) | [Ver Requisição](#6-get--products)<br>[Ver Resposta](#6-get--products) |
| GET | `/order/details` | Obter detalhes de um pedido específico | Bearer JWT | USER | Zod (detailsOrderSchema) | [Ver Requisição](#7-get--order-details)<br>[Ver Resposta](#7-get--order-details) |
| GET | `/orders` | Listar todos os pedidos com filtro opcional `draft` | Bearer JWT | USER | Nenhuma | [Ver Requisição](#8-get--orders)<br>[Ver Resposta](#8-get--orders) |
| POST | `/order/add` | Adicionar item a um pedido | Bearer JWT | USER | Zod (addItemSchema) | [Ver Requisição](#9-post--order-add)<br>[Ver Resposta](#9-post--order-add) |
| DELETE | `/order/remove` | Remover item de um pedido | Bearer JWT | USER | Zod (removeItemSchema) | [Ver Requisição](#10-delete--order-remove)<br>[Ver Resposta](#10-delete--order-remove) |
| PUT | `/order/send` | Enviar pedido para produção | Bearer JWT | USER | Zod (sendOrderSchema) | [Ver Requisição](#11-put--order-send)<br>[Ver Resposta](#11-put--order-send) |
| PUT | `/order/finish` | Finalizar pedido da produção | Bearer JWT | USER | Zod (finishOrderSchema) | [Ver Requisição](#12-put--order-finish)<br>[Ver Resposta](#12-put--order-finish) |
| DELETE | `/order` | Excluir pedido | Bearer JWT | USER | Zod (deleteOrderSchema) | [Ver Requisição](#13-delete--order)<br>[Ver Resposta](#13-delete--order) |
| POST | `/category` | Criar uma nova categoria | Bearer JWT | ADMIN | Zod (createCategorySchema) | [Ver Requisição](#14-post--category)<br>[Ver Resposta](#14-post--category) |
| POST | `/product` | Criar um novo produto com upload de imagem | Bearer JWT | ADMIN | Zod (createProductSchema) | [Ver Requisição](#15-post--product)<br>[Ver Resposta](#15-post--product) |
| DELETE | `/product` | Desativar/arquivar produto (soft delete) | Bearer JWT | ADMIN | Nenhuma | [Ver Requisição](#16-delete--product)<br>[Ver Resposta](#16-delete--product) |

## Autenticação

### JWT Token
- **Tipo**: Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Localização**: Todos os endpoints que exigem autenticação

### Requisitos de Role
- **USER**: Qualquer usuário autenticado pode acessar
- **ADMIN**: Requer `User.role === ADMIN`

## Endpoints Públicos

### 1. POST /users
**Descrição**: Criar um novo usuário
**Autenticação**: Nenhuma
**Validação**: Zod (createUserSchema)

#### Exemplo de Requisição:
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-do-usuario",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "role": "USER",
  "created_at": "2026-07-22T10:00:00.000Z"
}
```

### 2. POST /session
**Descrição**: Autenticar usuário e obter token JWT
**Autenticação**: Nenhuma
**Validação**: Zod (authUserSchema)

#### Exemplo de Requisição:
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

#### Exemplo de Resposta:
```json
{
  "token": "jwt-token-aqui",
  "user": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "role": "USER"
  }
}
```

## Endpoints Privados (Qualquer Role Autenticada)

### 3. GET /me
**Descrição**: Obter dados do usuário logado
**Autenticação**: Bearer JWT
**Validação**: Nenhuma

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3333/me
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-do-usuario",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "role": "USER",
  "created_at": "2026-07-22T10:00:00.000Z"
}
```

### 4. GET /categoryall
**Descrição**: Listar todas as categorias
**Autenticação**: Bearer JWT
**Validação**: Nenhuma

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3333/categoryall
```

#### Exemplo de Resposta:
```json
[
  {
    "id": "uuid-da-categoria-1",
    "name": "Lanches",
    "created_at": "2026-07-22T10:00:00.000Z"
  },
  {
    "id": "uuid-da-categoria-2",
    "name": "Bebidas",
    "created_at": "2026-07-22T10:00:00.000Z"
  }
]
```

### 5. GET /category/product
**Descrição**: Listar produtos de uma categoria específica
**Autenticação**: Bearer JWT
**Validação**: Zod (listProductsByCategorySchema)

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3333/category/product?category_id=uuid-da-categoria-1"
```

#### Exemplo de Resposta:
```json
[
  {
    "id": "uuid-do-produto-1",
    "name": "Hambúrguer Clássico",
    "price": 29.99,
    "description": "Hambúrguer tradicional com carne, alface, tomate e queijo",
    "banner": "https://res.cloudinary.com/cloud-name/image/upload/products/hamburger.jpg",
    "category_id": "uuid-da-categoria-1",
    "disabled": false,
    "created_at": "2026-07-22T10:00:00.000Z"
  }
]
```

### 6. GET /products
**Descrição**: Listar todos os produtos com filtros opcionais
**Autenticação**: Bearer JWT
**Validação**: Zod (listProductsSchema)

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3333/products?disabled=false&page=1&pageSize=10"
```

#### Exemplo de Resposta:
```json
{
  "data": [
    {
      "id": "uuid-do-produto-1",
      "name": "Hambúrguer Clássico",
      "price": 29.99,
      "description": "Hambúrguer tradicional com carne, alface, tomate e queijo",
      "banner": "https://res.cloudinary.com/cloud-name/image/upload/products/hamburger.jpg",
      "category_id": "uuid-da-categoria-1",
      "disabled": false,
      "created_at": "2026-07-22T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 7. GET /order/details
**Descrição**: Obter detalhes de um pedido específico
**Autenticação**: Bearer JWT
**Validação**: Zod (detailsOrderSchema)

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3333/order/details?order_id=uuid-do-pedido-1"
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-do-pedido-1",
  "user_id": "uuid-do-usuario-1",
  "status": "draft",
  "total": 89.97,
  "created_at": "2026-07-22T10:00:00.000Z",
  "updated_at": "2026-07-22T10:00:00.000Z",
  "items": [
    {
      "id": "uuid-do-item-1",
      "order_id": "uuid-do-pedido-1",
      "product_id": "uuid-do-produto-1",
      "quantity": 2,
      "price": 29.99,
      "product": {
        "id": "uuid-do-produto-1",
        "name": "Hambúrguer Clássico",
        "price": 29.99,
        "banner": "https://res.cloudinary.com/cloud-name/image/upload/products/hamburger.jpg"
      }
    }
  ]
}
```

### 8. GET /orders
**Descrição**: Listar todos os pedidos com filtro opcional `draft`
**Autenticação**: Bearer JWT
**Validação**: Nenhuma

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3333/orders?draft=false"
```

#### Exemplo de Resposta:
```json
[
  {
    "id": "uuid-do-pedido-1",
    "user_id": "uuid-do-usuario-1",
    "status": "draft",
    "total": 89.97,
    "created_at": "2026-07-22T10:00:00.000Z",
    "updated_at": "2026-07-22T10:00:00.000Z"
  }
]
```

### 9. POST /order/add
**Descrição**: Adicionar item a um pedido
**Autenticação**: Bearer JWT
**Validação**: Zod (addItemSchema)

#### Exemplo de Requisição:
```json
{
  "order_id": "uuid-do-pedido-1",
  "product_id": "uuid-do-produto-1",
  "quantity": 2
}
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-do-item-1",
  "order_id": "uuid-do-pedido-1",
  "product_id": "uuid-do-produto-1",
  "quantity": 2,
  "price": 29.99,
  "created_at": "2026-07-22T10:00:00.000Z"
}
```

### 10. DELETE /order/remove
**Descrição**: Remover item de um pedido
**Autenticação**: Bearer JWT
**Validação**: Zod (removeItemSchema)

#### Exemplo de Requisição:
```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"order_id": "uuid-do-pedido-1", "product_id": "uuid-do-produto-1"}' \
     http://localhost:3333/order/remove
```

#### Exemplo de Resposta:
```json
{
  "message": "Item removido do pedido com sucesso"
}
```

### 11. PUT /order/send
**Descrição**: Enviar pedido para produção
**Autenticação**: Bearer JWT
**Validação**: Zod (sendOrderSchema)

#### Exemplo de Requisição:
```json
{
  "order_id": "uuid-do-pedido-1"
}
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-do-pedido-1",
  "status": "sent",
  "updated_at": "2026-07-22T10:30:00.000Z"
}
```

### 12. PUT /order/finish
**Descrição**: Finalizar pedido da produção
**Autenticação**: Bearer JWT
**Validação**: Zod (finishOrderSchema)

#### Exemplo de Requisição:
```json
{
  "order_id": "uuid-do-pedido-1"
}
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-do-pedido-1",
  "status": "finished",
  "updated_at": "2026-07-22T11:00:00.000Z"
}
```

### 13. DELETE /order
**Descrição**: Excluir pedido
**Autenticação**: Bearer JWT
**Validação**: Zod (deleteOrderSchema)

#### Exemplo de Requisição:
```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"order_id": "uuid-do-pedido-1"}' \
     http://localhost:3333/order
```

#### Exemplo de Resposta:
```json
{
  "message": "Pedido excluído com sucesso"
}
```

## Endpoints Privados (Role ADMIN)

### 14. POST /category
**Descrição**: Criar uma nova categoria
**Autenticação**: Bearer JWT + ADMIN Role
**Validação**: Zod (createCategorySchema)

#### Exemplo de Requisição:
```json
{
  "name": "Sobremesas"
}
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-da-categoria-3",
  "name": "Sobremesas",
  "created_at": "2026-07-22T10:00:00.000Z"
}
```

### 15. POST /product
**Descrição**: Criar um novo produto com upload de imagem
**Autenticação**: Bearer JWT + ADMIN Role
**Validação**: Zod (createProductSchema)
**Upload**: multipart/form-data (campo: file)

#### Exemplo de Requisição:
```bash
curl -X POST -H "Authorization: Bearer <token>" \
     -H "Content-Type: multipart/form-data" \
     -F "name=Hambúrguer Especial" \
     -F "price=39.99" \
     -F "description=Hambúrguer especial com bacon e cebola caramelizada" \
     -F "category_id=uuid-da-categoria-1" \
     -F "file=@hamburguer.jpg" \
     http://localhost:3333/product
```

#### Exemplo de Resposta:
```json
{
  "id": "uuid-do-produto-2",
  "name": "Hambúrguer Especial",
  "price": 39.99,
  "description": "Hambúrguer especial com bacon e cebola caramelizada",
  "banner": "https://res.cloudinary.com/cloud-name/image/upload/products/hamburger_special.jpg",
  "category_id": "uuid-da-categoria-1",
  "disabled": false,
  "created_at": "2026-07-22T10:00:00.000Z"
}
```

### 16. DELETE /product
**Descrição**: Desativar/arquivar produto (soft delete)
**Autenticação**: Bearer JWT + ADMIN Role
**Validação**: Nenhuma

#### Exemplo de Requisição:
```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"id": "uuid-do-produto-1"}' \
     http://localhost:3333/product
```

#### Exemplo de Resposta:
```json
{
  "message": "Produto desativado com sucesso"
}
```

## Estrutura de Respostas de Erro

Todos os endpoints seguem este formato de erro:

```json
{
  "error": "Mensagem de erro detalhada"
}
```

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado
- **400**: Requisição inválida (validação Zod falhou)
- **401**: Não autorizado (JWT ausente ou inválido)
- **403**: Proibido (role ADMIN requerida)
- **404**: Não encontrado
- **500**: Erro interno do servidor

## Middlewares Aplicados

### Ordem de Execução (para cada endpoint):

1. **Autenticação**: `userIsAuthenticated` (se necessário)
2. **Autorização**: `isAdminRole` (se necessário)
3. **Validação**: `validateSchema` (se necessário)
4. **Upload**: `multer.single('file')` (para `/product`)
5. **Controller**: `new Controller().handle`
6. **Service**: `new Service().execute`
7. **Prisma**: Operação no banco de dados

## Schema de Dados

### User
- `id`: UUID
- `name`: string
- `email`: string (único)
- `password`: string (hash)
- `role`: enum (USER, ADMIN)
- `created_at`: DateTime

### Category
- `id`: UUID
- `name`: string
- `created_at`: DateTime

### Product
- `id`: UUID
- `name`: string
- `price`: decimal
- `description`: string
- `banner`: string (URL Cloudinary)
- `category_id`: UUID (FK)
- `disabled`: boolean
- `created_at`: DateTime

### Order
- `id`: UUID
- `user_id`: UUID (FK)
- `status`: enum (draft, sent, finished)
- `total`: decimal
- `created_at`: DateTime
- `updated_at`: DateTime

### Item
- `id`: UUID
- `order_id`: UUID (FK)
- `product_id`: UUID (FK)
- `quantity`: integer
- `price`: decimal
- `created_at`: DateTime