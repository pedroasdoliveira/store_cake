import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span aria-hidden="true">🧁</span> Doce Ninho
      </Link>
      <nav>
        <NavLink to="/">Vitrine</NavLink>
        <NavLink to="/carrinho">Carrinho ({count})</NavLink>
        {user ? (
          <>
            <NavLink to="/historico">Pedidos</NavLink>
            <span className="user-chip">{user.name}</span>
            <button type="button" className="link-button" onClick={logout}>
              Sair
            </button>
          </>
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
