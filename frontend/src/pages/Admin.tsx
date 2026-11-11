import { useState } from "react";
import { CatalogManager } from "../components/admin/CatalogManager";
import { OrderManager } from "../components/admin/OrderManager";
import { ProductManager } from "../components/admin/ProductManager";
import { PromotionManager } from "../components/admin/PromotionManager";
import { StoreSettingsForm } from "../components/admin/StoreSettingsForm";

type AdminSection = "catalogos" | "produtos" | "promocoes" | "pedidos" | "loja";

export function Admin() {
  const [section, setSection] = useState<AdminSection>("catalogos");

  return (
    <section className="panel">
      <h1>Painel da loja</h1>
      <p>Gerencie a vitrine, os preços e os descontos dos cupcakes.</p>
      <div className="filters" role="tablist">
        <button
          type="button"
          className={section === "catalogos" ? "chip active" : "chip"}
          onClick={() => setSection("catalogos")}
        >
          Catálogos
        </button>
        <button
          type="button"
          className={section === "produtos" ? "chip active" : "chip"}
          onClick={() => setSection("produtos")}
        >
          Produtos
        </button>
        <button
          type="button"
          className={section === "promocoes" ? "chip active" : "chip"}
          onClick={() => setSection("promocoes")}
        >
          Promoções
        </button>
        <button
          type="button"
          className={section === "pedidos" ? "chip active" : "chip"}
          onClick={() => setSection("pedidos")}
        >
          Pedidos
        </button>
        <button
          type="button"
          className={section === "loja" ? "chip active" : "chip"}
          onClick={() => setSection("loja")}
        >
          Loja
        </button>
      </div>
      {section === "catalogos" && <CatalogManager />}
      {section === "produtos" && <ProductManager />}
      {section === "promocoes" && <PromotionManager />}
      {section === "pedidos" && <OrderManager />}
      {section === "loja" && <StoreSettingsForm />}
    </section>
  );
}
