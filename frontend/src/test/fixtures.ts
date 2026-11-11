import type { AuthUser, CartItem, Order, Product } from "../types";

export const redVelvet: Product = {
  id: 1,
  name: "Red Velvet",
  description: "Massa aveludada com cream cheese.",
  price: 12.9,
  imageUrl: "https://example.com/red-velvet.jpg",
  category: "Clássicos",
};

export const chocolate: Product = {
  id: 2,
  name: "Chocolate Belga",
  description: "Cupcake intenso de chocolate.",
  price: 13.5,
  imageUrl: "https://example.com/chocolate.jpg",
  category: "Chocolate",
};

export const cartItem: CartItem = { ...redVelvet, quantity: 2 };

export interface DemoAccount extends AuthUser {
  password: string;
}

export const adminUser: DemoAccount = {
  userId: 1,
  name: "Administrador",
  email: "admin@doceninho.com",
  role: "ADMIN",
  password: "admin123",
};

export const anaUser: DemoAccount = {
  userId: 2,
  name: "Ana Cupcake",
  email: "ana@loja.com",
  role: "CUSTOMER",
  password: "cliente123",
};

export const brunoUser: DemoAccount = {
  userId: 3,
  name: "Bruno Ninho",
  email: "bruno@loja.com",
  role: "CUSTOMER",
  password: "cliente123",
};

export const claraUser: DemoAccount = {
  userId: 4,
  name: "Clara Doce",
  email: "clara@loja.com",
  role: "CUSTOMER",
  password: "cliente123",
};

export const demoCustomers: DemoAccount[] = [anaUser, brunoUser, claraUser];

export const loggedUser: AuthUser = anaUser;

export const confirmedOrder: Order = {
  id: 42,
  userId: 7,
  street: "Rua das Flores",
  number: "100",
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
