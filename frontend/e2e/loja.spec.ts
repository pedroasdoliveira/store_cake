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

  await page.route("**/api/auth/login", async (route) => {
    const payload = route.request().postDataJSON() as { email: string; password: string };
    if (payload.password === "errada") {
      await route.fulfill({
        status: 400,
        json: { message: "E-mail ou senha inválidos." },
      });
      return;
    }
    await route.fulfill({
      json: {
        userId: 7,
        name: "Ana Cupcake",
        email: payload.email,
        message: "Login realizado com sucesso.",
      },
    });
  });

  await page.route("**/api/orders**", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, json: createdOrder });
      return;
    }
    await route.fulfill({ json: [createdOrder] });
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
  await expect(page.getByRole("link", { name: "Carrinho (1)" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: "Carrinho (1)" })).toBeVisible();
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
  await page.getByRole("link", { name: "Carrinho (2)" }).click();

  await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();
  await expect(page.getByText(/Total:/)).toContainText("25,80");
  await page.getByRole("link", { name: "Finalizar pedido" }).click();
  await expect(page.getByText("Faça login para finalizar o pedido.")).toBeVisible();

  await page.getByRole("link", { name: "Cadastrar" }).click();
  await page.getByLabel("Nome").fill("Ana Cupcake");
  await page.getByLabel("E-mail").fill("ana@loja.com");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("status")).toContainText("Cadastro realizado com sucesso.");
  await expect(page.getByRole("heading", { name: "Sabores pensados para adoçar o seu dia" })).toBeVisible();

  await page.getByRole("link", { name: "Carrinho (2)" }).click();
  await page.getByRole("link", { name: "Finalizar pedido" }).click();
  await page.getByLabel("Rua").fill("Rua das Flores");
  await page.getByLabel("Número").fill("100");
  await page.getByLabel("Bairro").fill("Centro");
  await page.getByLabel("Cidade").fill("São Paulo");
  await page.getByLabel("CEP").fill("01000-000");
  await page.getByRole("button", { name: "Confirmar pedido" }).click();

  await expect(page.getByRole("heading", { name: "Pedido confirmado" })).toBeVisible();
  await expect(page.getByText("#42")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Pedido #42 confirmado");

  await page.getByRole("button", { name: "Ver histórico" }).click();
  await expect(page.getByRole("heading", { name: "Pedido #42" })).toBeVisible();
  await expect(page.getByText("2x Red Velvet")).toBeVisible();
});
