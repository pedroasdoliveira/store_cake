import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Cadastro } from "./pages/Cadastro";
import { Carrinho } from "./pages/Carrinho";
import { Catalogo } from "./pages/Catalogo";
import { Checkout } from "./pages/Checkout";
import { Historico } from "./pages/Historico";
import { Login } from "./pages/Login";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/historico" element={<Historico />} />
        </Routes>
      </main>
    </div>
  );
}
