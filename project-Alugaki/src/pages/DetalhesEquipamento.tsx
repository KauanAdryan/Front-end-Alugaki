import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Star, MapPin, User } from "lucide-react";
import { equipamentosData } from "../mocks/equipamentosData";

export function DetalhesEquipamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const equipamento = equipamentosData.find(
    (eq) => eq.id === parseInt(id || "0")
  );

  if (!equipamento) {
    return (
      <div className="page-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Equipamento não encontrado</h2>
          <button 
            onClick={() => navigate("/")}
            style={{
              marginTop: "1rem",
              padding: "10px 20px",
              backgroundColor: "#000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  const handleAlugar = () => {
    if (equipamento.disponivel) {
      // Aqui você pode adicionar a lógica de aluguel
      alert("Funcionalidade de aluguel em desenvolvimento!");
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="detalhes-container">
        <div className="detalhes-imagem">
          <img 
            src={equipamento.imagem} 
            alt={equipamento.nome}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/600x400?text=Sem+Imagem';
            }}
          />
          {!equipamento.disponivel && (
            <div className="badge-indisponivel-detalhes">Indisponível</div>
          )}
        </div>

        <div className="detalhes-info">
          <h1>{equipamento.nome}</h1>
          
          <div className="detalhes-avaliacao">
            <Star size={20} fill="currentColor" />
            <span>{equipamento.avaliacao}</span>
          </div>

          <div className="detalhes-preco">
            <strong>R$ {equipamento.preco}</strong>
            <span>/dia</span>
          </div>

          <div className="detalhes-local">
            <MapPin size={18} />
            <span>{equipamento.local}</span>
          </div>

          {equipamento.descricao && (
            <div className="detalhes-descricao">
              <h3>Descrição</h3>
              <p>{equipamento.descricao}</p>
            </div>
          )}

          {equipamento.proprietario && (
            <div className="detalhes-proprietario">
              <User size={18} />
              <span>Proprietário: {equipamento.proprietario}</span>
            </div>
          )}

          <div className="detalhes-categoria">
            <span>Categoria: <strong>{equipamento.categoria}</strong></span>
          </div>

          <button 
            className={`btn-alugar-detalhes ${!equipamento.disponivel ? 'btn-disabled' : ''}`}
            onClick={handleAlugar}
            disabled={!equipamento.disponivel}
          >
            {equipamento.disponivel ? 'Alugar Agora' : 'Indisponível'}
          </button>

          <button 
            className="btn-voltar"
            onClick={() => navigate("/")}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

