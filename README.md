# API de Produtos

## 📌 Descrição

API REST desenvolvida com Node.js, Express e SQLite para gerenciamento de produtos com autenticação JWT e relacionamento com categorias.

## 🚀 Tecnologias

* Node.js
* Express
* SQLite
* JWT

## 🔐 Autenticação

Endpoint de login:
POST /login

```json
{
  "usuario": "admin",
  "senha": "123"
}
```

## 📦 Endpoints

### 🔹 GET /api/produtos

Lista todos os produtos com suas categorias.

### 🔹 GET /api/produtos/:id

Busca produto por ID.

### 🔹 POST /api/produtos

(Requer token)

```json
{
  "nome": "Notebook",
  "preco": 3000,
  "categoria_id": 1
}
```

### 🔹 PUT /api/produtos/:id

(Requer token)

### 🔹 DELETE /api/produtos/:id

(Requer token)

## 🔒 Como usar o token

No Postman:
Authorization → Bearer Token

## 📊 Categorias disponíveis

1 - Informática
2 - Eletrônicos
3 - Casa
