import { Star } from "lucide-react";
import { type Equipamento } from "../mocks/equipamentosData";

interface EquipamentoCardProps {
  equipamento: Equipamento;
}

export function EquipamentoCard({ equipamento }: EquipamentoCardProps) {
  return (
    <div className={`card ${!equipamento.disponivel ? 'indisponivel' : ''}`}>
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
        
        <div className="card-avaliacao">
          <Star size={16} fill="currentColor" />
          <span>{equipamento.avaliacao}</span>
        </div>
        
        <div className="card-preco">
          <strong>R${equipamento.preco}</strong>
          <span>/dia</span>
        </div>
        
        <div className="card-local">
          <small>{equipamento.local}</small>
        </div>
        
        <button 
          className={`btn-alugar ${!equipamento.disponivel ? 'btn-disabled' : ''}`}
          disabled={!equipamento.disponivel}
        >
          {equipamento.disponivel ? 'Alugar Agora' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}