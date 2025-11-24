import { Navbar } from "../components/Navbar"
import { Filtros } from "../components/filterBar"
import { equipamentosData } from "../mocks/equipamentosData"

export function MyItens() {
  // Filtrar apenas os itens do usuário logado (mockado)
  // Em produção, isso viria da API com base no usuário autenticado
  const meusItens = equipamentosData.filter(item => 
    item.proprietario === "Kauan Cássia" || item.id <= 3 // Mock: primeiros 3 itens são do usuário
  );

  return (
    <div className="page-container">
      <Navbar />

      <header className="explore-header">
        <h1>Meus Itens</h1>
        <p>Cadastre, atualize, edite e exclua os seus itens.</p>
      </header>

      <Filtros />

      <div className="cards">
        {meusItens.map((item) => (
          <div key={item.id} className="card">
            <h3>{item.nome}</h3>
            <p>R${item.preco}/dia</p>
            <small>{item.local}</small>
            <div style={{ marginTop: '10px' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: item.disponivel ? '#4CAF50' : '#f44336',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {item.disponivel ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
