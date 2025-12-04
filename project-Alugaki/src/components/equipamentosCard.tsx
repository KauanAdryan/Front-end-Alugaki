import { useNavigate } from "react-router-dom";
import { type Equipamento } from "../mocks/equipamentosData";
import { getUsuarioSalvo } from "../utils/userStorage";

interface EquipamentoCardProps {
  equipamento: Equipamento;
  showAlugarButton?: boolean;
  onOpenDetails?: (equipamento: Equipamento) => void;
}

export function EquipamentoCard({ equipamento, showAlugarButton = true, onOpenDetails }: EquipamentoCardProps) {
  const navigate = useNavigate();
  const placeholderImg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">` +
        `<rect width="320" height="220" fill="#f2f2f2"/>` +
        `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-size="16" font-family="Arial, sans-serif">Sem imagem</text>` +
      `</svg>`
    );
  const imagemValida =
    equipamento.imagem &&
    typeof equipamento.imagem === "string" &&
    !equipamento.imagem.toLowerCase().includes("exemplo.com");
  const imagemSrc = imagemValida ? equipamento.imagem : placeholderImg;

  const statusAluguelIdStatus =
    (equipamento as any).statusAluguelIdStatus ??
    (equipamento as any).status_aluguel_id_status ??
    null;
  const statusAlugado = Number(statusAluguelIdStatus) === 3;
  const statusReservado = Number(statusAluguelIdStatus) === 2;
  const indisponivelPorStatus = statusAlugado || statusReservado;
  const usuarioLogadoId = (() => {
    const parsed = getUsuarioSalvo();
    if (!parsed) return null;
    return parsed.id ?? parsed.idUsuario ?? parsed.usuarioId ?? parsed.usuario_id_usuario ?? null;
  })();
  const donoId =
    (equipamento as any).usuarioId ??
    (equipamento as any).usuario_id_usuario ??
    (equipamento as any).usuarioIdUsuario ??
    (equipamento as any).idUsuario;
  const isOwner = usuarioLogadoId != null && donoId != null && Number(usuarioLogadoId) === Number(donoId);

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(equipamento);
      return;
    }
    navigate(`/equipamento/${equipamento.id}`);
  };

  return (
    <div 
      className={`card ${(!equipamento.disponivel || indisponivelPorStatus) ? 'indisponivel' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-image">
        <img 
          src={imagemSrc} 
          alt={equipamento.nome}
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null; // evita loop infinito
            target.src = placeholderImg;
          }}
        />
        {statusAlugado && <div className="badge-indisponivel">Alugado</div>}
        {statusReservado && <div className="badge-indisponivel" style={{ backgroundColor: '#ff9800' }}>Reservado</div>}
        {!equipamento.disponivel && !indisponivelPorStatus && (
          <div className="badge-indisponivel">Indisponível</div>
        )}
        {isOwner && !indisponivelPorStatus && (
          <div className="badge-indisponivel" style={{ backgroundColor: '#2196f3' }}>Meu item</div>
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
            className={`btn-alugar ${(!equipamento.disponivel || indisponivelPorStatus) ? 'btn-disabled' : ''}`}
            disabled={!equipamento.disponivel || indisponivelPorStatus || isOwner}
            onClick={(e) => {
              e.stopPropagation();
              if (equipamento.disponivel && !indisponivelPorStatus && !isOwner) {
                handleCardClick();
              }
            }}
          >
            {!equipamento.disponivel
              ? 'Indisponível'
              : statusReservado
                ? 'Reservado'
                : statusAlugado
                  ? 'Alugado'
                  : isOwner
                    ? 'Seu item'
                    : 'Alugar Agora'}
          </button>
        )}
      </div>
    </div>
  );
}
