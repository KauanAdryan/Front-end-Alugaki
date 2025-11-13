import { Navbar } from "../components/Navbar"
import { Filtros } from "../components/filterBar"

const equipamentosData = [
  { id: 1, nome: "Guitarra Elétrica – Stratocaster", preco: 35, local: "São Paulo" },
  { id: 2, nome: "Baixo – 4003", preco: 45, local: "Rio de Janeiro" },
  { id: 3, nome: "Amplificador – JCM800", preco: 25, local: "São Paulo" },
  { id: 4, nome: "Sistema de PA – L1 Pro8", preco: 60, local: "Belo Horizonte" },
  { id: 5, nome: "Teclado – Korg X50", preco: 50, local: "Curitiba" },
];

export function Homepage() {
  return (
    <div className="page-container">
      <Navbar />

      <header className="explore-header">
        <h1>Encontre o Equipamento Ideal</h1>
        <p>Explore uma vasta gama de equipamentos disponíveis para aluguel.</p>
      </header>

      <Filtros />

      <div className="cards">
        {equipamentosData.map((item) => (
          <div key={item.id} className="card">
            <h3>{item.nome}</h3>
            <p>R${item.preco}/dia</p>
            <small>{item.local}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

