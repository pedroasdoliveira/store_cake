import type { Product } from "../types";

export function chargedPrice(product: Pick<Product, "price" | "salePrice">) {
  return typeof product.salePrice === "number" ? product.salePrice : product.price;
}
