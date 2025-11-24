import { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";
import { mensagensData, type Mensagem } from "../mocks/mensagensData";

type Message = Mensagem;

// Componente principal de Mensagens
export function Mensagens() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Formatar data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="page-container">
        <Navbar />
      {/* Cabeçalho */}
      <div className="explore-header">
        <h1>Caixa de Entrada</h1>
        <p>Suas mensagens e notificações</p>
      </div>

      {/* Contador de mensagens não lidas */}
      <div className="messages-info">
        <p>
          {messages.filter(msg => !msg.isRead).length} mensagem(s) não lida(s)
        </p>
      </div>

      {/* LISTA de Mensagens (Vertical) */}
      <div className="messages-list">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message-item ${!message.isRead ? 'unread' : ''}`}
            onClick={() => openMessageDetails(message)}
          >
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
        ))}
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