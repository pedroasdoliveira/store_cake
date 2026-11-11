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

export interface StoreSettings {
  storeName: string;
  headline: string;
  description: string;
  phone: string;
  contactEmail: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discountPercent: number;
  active: boolean;
}

export interface SavePromotionPayload {
  title: string;
  description: string;
  discountPercent: number;
  active: boolean;
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
  customerName?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  transactionCode?: string;
  paymentStatus?: string;
  cardBrand?: string;
  cardLast4?: string;
  status: string;
  subtotal?: number;
  discountAmount?: number;
  promotionTitle?: string;
  deliveryNote?: string;
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
