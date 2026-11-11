import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function cartLabel(count: number) {
  if (count === 1) {
    return "Carrinho, 1 item";
  }
  return `Carrinho, ${count} itens`;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span aria-hidden="true">🧁</span> Doce Ninho
      </Link>
      <nav>
        <NavLink to="/" end>
          Cardápio
        </NavLink>
        <NavLink to="/carrinho" className="cart-link" aria-label={cartLabel(count)}>
          <span aria-hidden="true">Carrinho</span>
          {count > 0 && (
            <span className="cart-badge" aria-hidden="true">
              {count}
            </span>
          )}
        </NavLink>
        {user ? (
          <div className="account">
            <button
              type="button"
              className="account-trigger"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => setAccountOpen((open) => !open)}
            >
              {user.name}
            </button>
            {accountOpen && (
              <div className="account-menu" role="menu">
                <NavLink to="/historico" role="menuitem" onClick={() => setAccountOpen(false)}>
                  Meus pedidos
                </NavLink>
                {user.role === "ADMIN" && (
                  <NavLink to="/admin" role="menuitem" onClick={() => setAccountOpen(false)}>
                    Painel
                  </NavLink>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="menu-item"
                  onClick={() => {
                    setAccountOpen(false);
                    logout();
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login">Entrar</NavLink>
            <NavLink to="/cadastro" className="cta-link">
              Cadastrar
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
