# Loja de Cupcakes — PIT II

Aplicação full-stack de uma loja de cupcakes com **front-end** e **back-end** separados.

- Vitrine de produtos (nome, preço, imagem, descrição e categoria)
- Carrinho persistido no `localStorage`
- Cadastro e login com mensagens de sucesso/erro
- Checkout com endereço, pagamento e confirmação do pedido
- Histórico de pedidos do cliente

## Stack

| Camada | Tecnologia |
| --- | --- |
| Back-end | Java 17, Spring Boot 3.3, Spring Web, Spring Data JPA |
| Front-end | React 18, TypeScript, Vite |
| Banco | PostgreSQL 16 (Docker) |
| Testes | JUnit 5 e Mockito (API); Vitest, Testing Library e Playwright (front-end) |

## Estrutura

```text
.
├── backend/                 # API REST Spring Boot
├── frontend/                # SPA React + TypeScript
├── database/schema.sql      # Tabelas: users, products, orders, order_items
└── docker-compose.yml       # PostgreSQL
```

## Pré-requisitos

- Docker e Docker Compose
- JDK 17+
- Maven 3.9+ (opcional; o projeto inclui `./mvnw` na pasta `backend`)
- Node.js 18+

## 1. Subir o banco com Docker

Na raiz do repositório:

```bash
docker compose up -d
```

O container `cupcake-postgres` sobe o PostgreSQL em `localhost:5432` e executa `database/schema.sql` na primeira inicialização.

- Banco: `cupcake_store`
- Usuário: `cupcake`
- Senha: `cupcake123`

Para conferir se o banco está pronto:

```bash
docker compose ps
```

## 2. Executar o back-end

```bash
cd backend
./mvnw spring-boot:run
```

A API fica em `http://localhost:8080`.

Na primeira execução, o `DataSeeder` cadastra 6 cupcakes se a tabela `products` estiver vazia.

### Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/orders`
- `GET /api/orders?userId={id}`

O CORS está liberado para `http://localhost:5173`.

## 3. Executar o front-end

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`.

O carrinho é salvo automaticamente no `localStorage` (chave `cupcake-cart`) e permanece após recarregar a página.

## 4. Executar os testes

### Back-end (JUnit 5 + Mockito)

```bash
cd backend
./mvnw test
```

Os testes cobrem os serviços de autenticação, produtos e pedidos (repositórios mockados).

### Front-end — componentes e requisições (Vitest)

```bash
cd frontend
npm test
```

Cobre componentes (vitrine, carrinho, login, checkout, histórico), persistência do carrinho no `localStorage` e o cliente HTTP da API.

### Front-end — fluxos end-to-end (Playwright)

Na primeira execução, instale o navegador:

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

Os testes E2E sobem o Vite e simulam a API REST, então não dependem do Java nem do PostgreSQL. Eles percorrem vitrine, carrinho, cadastro, checkout e histórico.

## Fluxo sugerido para demonstração

1. Acesse a vitrine e adicione cupcakes ao carrinho.
2. Crie uma conta em **Cadastrar**.
3. Finalize o pedido em **Checkout** informando endereço e forma de pagamento.
4. Confira o número do pedido e o valor total.
5. Consulte os pedidos em **Pedidos**.
