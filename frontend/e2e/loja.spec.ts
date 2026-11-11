import { expect, test, type Page } from "@playwright/test";

const products = [
  {
    id: 1,
    name: "Red Velvet",
    description: "Massa aveludada com cream cheese.",
    price: 12.9,
    imageUrl: "https://placehold.co/400x300?text=Red+Velvet",
    category: "Clássicos",
  },
  {
    id: 2,
    name: "Chocolate Belga",
    description: "Cupcake intenso de chocolate.",
    price: 13.5,
    imageUrl: "https://placehold.co/400x300?text=Chocolate",
    category: "Chocolate",
  },
];

const createdOrder = {
  id: 42,
  userId: 7,
  street: "Rua das Flores",
  number: "100",
  complement: "",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  zipCode: "01000-000",
  paymentMethod: "PIX",
  status: "CONFIRMED",
  total: 25.8,
  createdAt: "2026-10-24T12:00:00",
  items: [
    {
      productId: 1,
      productName: "Red Velvet",
      quantity: 2,
      unitPrice: 12.9,
      subtotal: 25.8,
    },
  ],
};

async function mockBackend(page: Page) {
  await page.route("**/api/products**", async (route) => {
    await route.fulfill({ json: products });
  });

  await page.route("**/api/categories", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "Clássicos", description: "Receitas de sempre da casa." },
        { id: 2, name: "Chocolate", description: "Massas e coberturas de cacau." },
      ],
    });
  });

  await page.route("**/api/promotions", async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.route("**/api/store", async (route) => {
    await route.fulfill({
      json: {
        storeName: "Doce Ninho",
        headline: "Sabores pensados para adoçar o seu dia",
        description: "Escolha um cupcake, monte o carrinho e finalize o pedido com entrega em casa.",
        phone: "",
        contactEmail: "contato@doceninho.com",
      },
    });
  });

  await page.route("**/api/auth/register", async (route) => {
    await route.fulfill({
      status: 201,
      json: {
        userId: 7,
        name: "Ana Cupcake",
        email: "ana@loja.com",
        message: "Cadastro realizado com sucesso.",
      },
    });
  });

  const demoUsers = [
    { userId: 1, name: "Administrador", email: "admin@doceninho.com", role: "ADMIN", password: "admin123" },
    { userId: 2, name: "Ana Cupcake", email: "ana@loja.com", role: "CUSTOMER", password: "cliente123" },
    { userId: 3, name: "Bruno Ninho", email: "bruno@loja.com", role: "CUSTOMER", password: "cliente123" },
    { userId: 4, name: "Clara Doce", email: "clara@loja.com", role: "CUSTOMER", password: "cliente123" },
  ];

  await page.route("**/api/auth/login", async (route) => {
    const payload = route.request().postDataJSON() as { email: string; password: string };
    const account = demoUsers.find((user) => user.email === payload.email && user.password === payload.password);
    if (!account || payload.password === "errada") {
      await route.fulfill({
        status: 400,
        json: { message: "E-mail ou senha inválidos." },
      });
      return;
    }
    await route.fulfill({
      json: {
        userId: account.userId,
        name: account.name,
        email: account.email,
        role: account.role,
        message: "Login realizado com sucesso.",
      },
    });
  });

  const orders: Array<typeof createdOrder> = [];

  await page.route("**/viacep.com.br/**", async (route) => {
    await route.fulfill({
      json: {
        cep: "01001-000",
        logradouro: "Rua das Flores",
        bairro: "Centro",
        localidade: "São Paulo",
        uf: "SP",
      },
    });
  });

  await page.route("**/api/orders**", async (route) => {
    if (route.request().method() === "POST") {
      orders.push(createdOrder);
      await route.fulfill({ status: 201, json: createdOrder });
      return;
    }
    await route.fulfill({ json: orders });
  });
}

test.beforeEach(async ({ page }) => {
  await mockBackend(page);
});

test("exibe a vitrine e persiste o carrinho após recarregar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Red Velvet" })).toBeVisible();

  await page.getByRole("article").filter({ hasText: "Red Velvet" }).getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByRole("status")).toContainText("Red Velvet adicionado ao carrinho.");
  await expect(page.getByRole("link", { name: "Carrinho, 1 item" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: "Carrinho, 1 item" })).toBeVisible();
});

test("mostra erro visual no login inválido", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ana@loja.com");
  await page.getByLabel("Senha").fill("errada");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("status")).toHaveText("E-mail ou senha inválidos.");
});

test("percorre cadastro, carrinho, checkout e histórico", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("article").filter({ hasText: "Red Velvet" }).getByRole("button", { name: "Adicionar" }).click();
  await page.getByRole("article").filter({ hasText: "Red Velvet" }).getByRole("button", { name: "Adicionar" }).click();
  await page.getByRole("link", { name: "Carrinho, 2 itens" }).click();

  await expect(page.getByRole("heading", { name: "Seu carrinho" })).toBeVisible();
  await expect(page.getByText("Total", { exact: true }).locator("xpath=..")).toContainText("25,80");
  await page.getByRole("link", { name: "Finalizar compra" }).click();
  await expect(page.getByText("Faça login para finalizar o pedido.")).toBeVisible();

  await page.getByRole("link", { name: "Cadastrar" }).click();
  await page.getByLabel("Nome").fill("Ana Cupcake");
  await page.getByLabel("E-mail").fill("ana@loja.com");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("status")).toContainText("Cadastro realizado com sucesso.");
  await expect(page.getByRole("heading", { name: "Sabores pensados para adoçar o seu dia" })).toBeVisible();

  await page.getByRole("link", { name: "Carrinho, 2 itens" }).click();
  await page.getByRole("link", { name: "Finalizar compra" }).click();
  await page.getByLabel("CEP").fill("01001000");
  await expect(page.getByLabel("Rua")).toHaveValue("Rua das Flores");
  await expect(page.getByLabel("Cidade")).toHaveValue("São Paulo");
  await expect(page.getByLabel("UF")).toHaveValue("SP");
  await page.getByLabel("Número").fill("100");
  await page.getByRole("button", { name: "Salvar endereço" }).click();
  await expect(page.getByText(/Rua das Flores, 100/)).toBeVisible();
  await page.getByRole("button", { name: "Pagar" }).click();

  await expect(page.getByRole("heading", { name: "Pague com PIX" })).toBeVisible();
  await expect(page.getByText("#42")).toBeVisible();
  await expect(page.getByRole("timer")).toContainText(/15:00|14:59/);

  await page.getByRole("button", { name: "Ver meus pedidos" }).click();
  await expect(page.getByRole("heading", { name: "Pedido #42" })).toBeVisible();
  await expect(page.getByText("2 cupcakes")).toBeVisible();
  await expect(page.getByText("Seu pedido #42 foi recebido.")).toBeVisible();

  await page.getByRole("link", { name: "Detalhes" }).click();
  await expect(page).toHaveURL(/\/historico\/42$/);
  await expect(page.getByRole("listitem").filter({ hasText: "Pedido recebido" })).toHaveAttribute(
    "aria-current",
    "step"
  );
  await expect(page.getByText("2× Red Velvet")).toBeVisible();
  await expect(page.getByText("Pagamento: PIX")).toBeVisible();
  await expect(page.getByText("Grátis")).toBeVisible();
});
