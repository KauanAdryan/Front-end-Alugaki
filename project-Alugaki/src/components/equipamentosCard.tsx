import { useNavigate } from "react-router-dom";
import { type Equipamento } from "../mocks/equipamentosData";

interface EquipamentoCardProps {
  equipamento: Equipamento;
  showAlugarButton?: boolean;
}

export function EquipamentoCard({ equipamento, showAlugarButton = true }: EquipamentoCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/equipamento/${equipamento.id}`);
  };

  return (
    <div 
      className={`card ${!equipamento.disponivel ? 'indisponivel' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-image">
        <img 
          src={equipamento.imagem} 
          alt={equipamento.nome}
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null; // evita loop infinito
            target.src = 'https://via.placeholder.com/320x220?text=Sem+Imagem';
          }}
        />
        {!equipamento.disponivel && (
          <div className="badge-indisponivel">Indisponível</div>
        )}
      </div>
      
      <div className="card-content">
        <h3>{equipamento.nome}</h3>
        
        <div className="card-preco">
          <strong>R${equipamento.preco}</strong>
          <span>/dia</span>
        </div>
        
        <div className="card-local">
          <small>{equipamento.local}</small>
        </div>
        
        {showAlugarButton && (
          <button 
            className={`btn-alugar ${!equipamento.disponivel ? 'btn-disabled' : ''}`}
            disabled={!equipamento.disponivel}
            onClick={(e) => {
              e.stopPropagation();
              if (equipamento.disponivel) {
                handleCardClick();
              }
            }}
          >
            {equipamento.disponivel ? 'Alugar Agora' : 'Indisponível'}
          </button>
        )}
      </div>
    </div>
  );
}