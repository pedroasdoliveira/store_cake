export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  discountPercent?: number;
  salePrice?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface SaveProductPayload {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  discountPercent: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type UserRole = "CUSTOMER" | "ADMIN";

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

export interface DeliveryAddress {
  id: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ZipCodeAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}
