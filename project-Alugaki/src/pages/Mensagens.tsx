import { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";
import { mensagensData, type Mensagem } from "../mocks/mensagensData";
import { Bell, CheckCircle2, X, Filter, CheckCheck } from "lucide-react";

type Message = Mensagem;

// Componente principal de Mensagens
export function Mensagens() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todas");
  const [mostrarApenasNaoLidas, setMostrarApenasNaoLidas] = useState(false);

  // Carregar mensagens dos dados mockados
  useEffect(() => {
    // Converter timestamps de string para Date se necessário
    const mensagensFormatadas = mensagensData.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
    }));
    setMessages(mensagensFormatadas);
  }, []);

  // Função para marcar mensagem como lida
  const markAsRead = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  // Função para abrir modal de detalhes
  const openMessageDetails = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  // Função para fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Função para deletar mensagem
  const deleteMessage = (messageId: string) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    closeModal();
  };

  // Função para marcar todas como lidas
  const markAllAsRead = () => {
    setMessages(prevMessages =>
      prevMessages.map(msg => ({ ...msg, isRead: true }))
    );
  };

  // Função para deletar todas as lidas
  const deleteAllRead = () => {
    setMessages(prevMessages => prevMessages.filter(msg => !msg.isRead));
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

  // Obter ícone por categoria
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Aluguel':
        return '🏠';
      case 'Financeiro':
        return '💰';
      case 'Avaliação':
        return '⭐';
      case 'Sistema':
        return '🔔';
      case 'Lembrete':
        return '📌';
      case 'Atualização':
        return '🔄';
      default:
        return '📧';
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

            <div className="modal-buttons">
              <button 
                className="btn-cancelar"
                onClick={() => deleteMessage(selectedMessage.id)}
              >
                Excluir
              </button>
              <button 
                className="btn-enviar"
                onClick={closeModal}
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