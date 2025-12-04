import { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";
import { type Mensagem } from "../mocks/mensagensData";
import { notificationService } from "../services/notificationService";
import { aluguelService } from "../services/rentalService";
import { Bell, X, Filter, CheckCheck } from "lucide-react";

type Message = Mensagem;

// Componente principal de Mensagens
export function Mensagens() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todas");
  const [mostrarApenasNaoLidas, setMostrarApenasNaoLidas] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erroConfirmacao, setErroConfirmacao] = useState("");
  const [devolvendo, setDevolvendo] = useState(false);
  const usuarioId = notificationService.getUsuarioIdLocal();

  // Carregar mensagens (mock + extras salvos)
  useEffect(() => {
    const todas = notificationService.getAll(usuarioId);
    setMessages(todas);
  }, [usuarioId]);

  // Função para marcar mensagem como lida
  const markAsRead = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
    notificationService.markAsRead(messageId);
  };

  // Função para abrir modal de detalhes
  const openMessageDetails = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  // Tentar preencher aluguelId faltante ao abrir notificação de aluguel
  useEffect(() => {
    const tentarPreencherAluguel = async () => {
      if (
        !selectedMessage ||
        selectedMessage.category !== "Aluguel" ||
        selectedMessage.aluguelId ||
        !selectedMessage.produtoId
      ) {
        return;
      }
      try {
        const pendentes = await aluguelService.listarPorStatus(2);
        const match = pendentes.find((a: any) => {
          const prodId =
            a.produtoIdProduto ??
            a.produto_id_produto ??
            a.idProduto ??
            a.produtoId;
          const sameProd = Number(prodId) === Number(selectedMessage.produtoId);
          if (usuarioId != null) {
            const userId =
              a.usuarioIdUsuario ??
              a.usuario_id_usuario ??
              a.idUsuario ??
              a.usuarioId;
            return sameProd && Number(userId) === Number(usuarioId);
          }
          return sameProd;
        });
        if (match) {
          const novoId =
            match.idAluguel ??
            match.id_aluguel ??
            match.id ??
            match.aluguelId;
          if (novoId) {
            notificationService.update(selectedMessage.id, { aluguelId: Number(novoId) });
            setSelectedMessage(prev =>
              prev ? { ...prev, aluguelId: Number(novoId) } : prev
            );
          }
        }
      } catch (error) {
        console.error("Não foi possível obter aluguel pendente:", error);
      }
    };

    tentarPreencherAluguel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMessage]);

  // Função para fechar modal
  const closeModal = () => {
    setErroConfirmacao("");
    setConfirmando(false);
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Função para deletar mensagem
  const deleteMessage = (messageId: string) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    notificationService.delete(messageId);
    closeModal();
  };

  // Função para marcar todas como lidas
  const markAllAsRead = () => {
    setMessages(prevMessages =>
      prevMessages.map(msg => ({ ...msg, isRead: true }))
    );
    notificationService.markAllAsRead();
  };

  // Função para deletar todas as lidas
  const deleteAllRead = () => {
    setMessages(prevMessages => prevMessages.filter(msg => !msg.isRead));
    notificationService.deleteAllRead();
  };

  const handleConfirmar = async () => {
    if (!selectedMessage?.aluguelId) {
      setErroConfirmacao("Aluguel não identificado.");
      return;
    }
    setConfirmando(true);
    setErroConfirmacao("");
    try {
      const resp = await aluguelService.confirmarAluguel(selectedMessage.aluguelId, {
        produtoId: selectedMessage.produtoId,
        usuarioId,
      });
      const usedId = (resp as any)?.usedAluguelId ?? selectedMessage.aluguelId;
      if (usedId && usedId !== selectedMessage.aluguelId) {
        notificationService.update(selectedMessage.id, { aluguelId: usedId });
        setSelectedMessage(prev =>
          prev ? { ...prev, aluguelId: usedId } : prev
        );
      }
      // Marca como lida e atualiza lista
      markAsRead(selectedMessage.id);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === selectedMessage.id ? { ...msg, isRead: true } : msg
        )
      );
      // Solicita refresh global dos produtos para refletir status (Home/MyItens)
      window.dispatchEvent(new CustomEvent('produtos:refresh'));
      setConfirmando(false);
      setIsModalOpen(false);
    } catch (error: any) {
      setConfirmando(false);
      const mensagemErro =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível confirmar o aluguel.";
      setErroConfirmacao(mensagemErro);
      if (mensagemErro.toLowerCase().includes("não encontrado")) {
        // limpa a notificação inválida
        deleteMessage(selectedMessage.id);
      }
    }
  };

  const handleConfirmarDevolucao = async () => {
    if (!selectedMessage?.aluguelId) {
      setErroConfirmacao("Aluguel não identificado.");
      return;
    }
    setDevolvendo(true);
    setErroConfirmacao("");
    try {
      await aluguelService.atualizarStatus(selectedMessage.aluguelId, 1);
      markAsRead(selectedMessage.id);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === selectedMessage.id ? { ...msg, isRead: true } : msg
        )
      );
      window.dispatchEvent(new CustomEvent('produtos:refresh'));
      setDevolvendo(false);
      setIsModalOpen(false);
    } catch (error: any) {
      setDevolvendo(false);
      setErroConfirmacao(
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível confirmar a devolução."
      );
    }
  };

  // Filtrar mensagens
  const mensagensFiltradas = messages.filter(msg => {
    if (filtroCategoria !== "Todas" && msg.category !== filtroCategoria) {
      return false;
    }
    if (mostrarApenasNaoLidas && msg.isRead) {
      return false;
    }
    return true;
  });

  // Obter categorias únicas
  const categorias = ["Todas", ...Array.from(new Set(messages.map(msg => msg.category)))];

  // Formatar data
  const formatDate = (date: Date) => {
    const agora = new Date();
    const diffMs = agora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Ícone por categoria
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Aluguel':
        return '🔔';
      case 'Financeiro':
        return '💰';
      case 'Avaliação':
        return '⭐';
      case 'Sistema':
        return '🖥️';
      case 'Lembrete':
        return '⏰';
      case 'Atualização':
        return '⬆️';
      default:
        return '✉️';
    }
  };

  return (
    <div className="page-container">
        <Navbar />
      {/* Cabeçalho */}
      <div className="explore-header">
        <h1>Notificações</h1>
        <p>Suas mensagens e notificações</p>
      </div>

      {/* Barra de ações e filtros */}
      <div className="messages-actions">
        <div className="messages-filters">
          <div className="filter-group">
            <Filter size={18} />
            <select 
              value={filtroCategoria} 
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="filter-select"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <label className="filter-checkbox">
            <input 
              type="checkbox" 
              checked={mostrarApenasNaoLidas}
              onChange={(e) => setMostrarApenasNaoLidas(e.target.checked)}
            />
            <span>Apenas não lidas</span>
          </label>
        </div>
        <div className="messages-buttons">
          <button 
            className="btn-action btn-mark-all"
            onClick={markAllAsRead}
            disabled={messages.filter(msg => !msg.isRead).length === 0}
          >
            <CheckCheck size={18} />
            Marcar todas como lidas
          </button>
          <button 
            className="btn-action btn-delete-read"
            onClick={deleteAllRead}
            disabled={messages.filter(msg => msg.isRead).length === 0}
          >
            <X size={18} />
            Limpar lidas
          </button>
        </div>
      </div>

      {/* Contador de mensagens */}
      <div className="messages-info">
        <p>
          {mensagensFiltradas.length} notificação(s) 
          {filtroCategoria !== "Todas" && ` em ${filtroCategoria}`}
          {mostrarApenasNaoLidas && " não lidas"}
        </p>
      </div>

      {/* LISTA de Mensagens (Vertical) */}
      <div className="messages-list">
        {mensagensFiltradas.length === 0 ? (
          <div className="no-messages">
            <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Nenhuma notificação encontrada</p>
          </div>
        ) : (
          mensagensFiltradas.map(message => (
          <div
            key={message.id}
            className={`message-item ${!message.isRead ? 'unread' : ''}`}
            onClick={() => openMessageDetails(message)}
          >
            <div className="message-icon">
              <span className="category-icon">{getCategoryIcon(message.category)}</span>
            </div>
            <div className="message-content-wrapper">
              <div className="message-header">
                <h3>{message.title}</h3>
                {!message.isRead && <span className="unread-badge">Nova</span>}
              </div>
              <p className="message-sender">De: {message.sender}</p>
              <p className="message-preview">
                {message.content.length > 120 
                  ? `${message.content.substring(0, 120)}...` 
                  : message.content
                }
              </p>
              <div className="message-footer">
                <small className="message-category">{message.category}</small>
                <small className="message-time">
                  {formatDate(message.timestamp)}
                </small>
              </div>
            </div>
            {!message.isRead && <div className="unread-indicator"></div>}
          </div>
        ))
        )}
      </div>

      {/* Modal de Detalhes da Mensagem */}
      {isModalOpen && selectedMessage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMessage.title}</h2>
            
            <div className="message-details">
              <div className="detail-row">
                <strong>Remetente:</strong>
                <span>{selectedMessage.sender}</span>
              </div>
              
              <div className="detail-row">
                <strong>Categoria:</strong>
                <span>{selectedMessage.category}</span>
              </div>
              
              <div className="detail-row">
                <strong>Data:</strong>
                <span>{formatDate(selectedMessage.timestamp)}</span>
              </div>
            </div>

            <div className="message-content">
              <p>{selectedMessage.content}</p>
            </div>

            {erroConfirmacao && (
              <div style={{ color: "red", marginBottom: "0.5rem" }}>
                {erroConfirmacao}
              </div>
            )}

            <div className="modal-buttons">
              <button 
                className="btn-cancelar"
                onClick={() => deleteMessage(selectedMessage.id)}
              >
                Excluir
              </button>
              {selectedMessage.category === "Aluguel" &&
                selectedMessage.aluguelId &&
                (!selectedMessage.recipientId || Number(selectedMessage.recipientId) === Number(usuarioId)) && (
                <button 
                  className="btn-enviar"
                  onClick={handleConfirmar}
                  disabled={confirmando}
                >
                  {confirmando ? "Confirmando..." : "Confirmar aluguel"}
                </button>
              )}
              {selectedMessage.category === "Devolucao" &&
                selectedMessage.aluguelId &&
                (!selectedMessage.recipientId || Number(selectedMessage.recipientId) === Number(usuarioId)) && (
                <button 
                  className="btn-enviar"
                  onClick={handleConfirmarDevolucao}
                  disabled={devolvendo}
                >
                  {devolvendo ? "Confirmando..." : "Confirmar devolução"}
                </button>
              )}
              <button 
                className="btn-enviar"
                onClick={closeModal}
                disabled={confirmando || devolvendo}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
