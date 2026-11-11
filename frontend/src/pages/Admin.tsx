import { useState } from "react";
import { CatalogManager } from "../components/admin/CatalogManager";
import { ProductManager } from "../components/admin/ProductManager";

type AdminSection = "catalogos" | "produtos";

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
      </div>
      {section === "catalogos" ? <CatalogManager /> : <ProductManager />}
    </section>
  );
}
