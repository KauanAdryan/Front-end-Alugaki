import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { type Mensagem } from "../mocks/mensagensData";
import { notificationService } from "../services/notificationService";
import { aluguelService } from "../services/rentalService";
import { Bell, X, Filter, CheckCheck } from "lucide-react";

type Message = Mensagem;

export function Mensagens() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todas");
  const [mostrarApenasNaoLidas, setMostrarApenasNaoLidas] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erroConfirmacao, setErroConfirmacao] = useState("");
  const [devolvendo, setDevolvendo] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const usuarioId = notificationService.getUsuarioIdLocal();

  useEffect(() => {
    const todas = notificationService.getAll(usuarioId);
    setMessages(todas);
  }, [usuarioId]);

  useEffect(() => {
    const reload = () => {
      const todas = notificationService.getAll(usuarioId);
      setMessages(todas);
    };
    window.addEventListener("storage", reload);
    window.addEventListener("notificacoes:changed", reload);
    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener("notificacoes:changed", reload);
    };
  }, [usuarioId]);

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, isRead: true } : msg)));
    notificationService.markAsRead(messageId);
  };

  const openMessageDetails = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  useEffect(() => {
    const tentarPreencherAluguel = async () => {
      if (!selectedMessage || selectedMessage.category !== "Aluguel" || selectedMessage.aluguelId || !selectedMessage.produtoId) return;
      try {
        const pendentes = await aluguelService.listarPorStatus(2);
        const match = pendentes.find((a: any) => {
          const prodId = a.produtoIdProduto ?? a.produto_id_produto ?? a.idProduto ?? a.produtoId;
          return Number(prodId) === Number(selectedMessage.produtoId);
        });
        if (match) {
          const novoId = match.idAluguel ?? match.id_aluguel ?? match.id ?? match.aluguelId;
          if (novoId) {
            notificationService.update(selectedMessage.id, { aluguelId: Number(novoId) });
            setSelectedMessage(prev => (prev ? { ...prev, aluguelId: Number(novoId) } : prev));
          }
        }
      } catch (error) {
        console.error("Nao foi possivel obter aluguel pendente:", error);
      }
    };

    tentarPreencherAluguel();
  }, [selectedMessage]);

  const closeModal = () => {
    setErroConfirmacao("");
    setConfirmando(false);
    setDevolvendo(false);
    setCancelando(false);
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const markAllAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
    notificationService.markAllAsRead();
  };

  const deleteAllRead = () => {
    setMessages(prev => prev.filter(msg => !msg.isRead));
    notificationService.deleteAllRead();
  };

  const handleConfirmar = async () => {
    if (!selectedMessage?.aluguelId) {
      setErroConfirmacao("Aluguel nao identificado.");
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
      }
      markAsRead(selectedMessage.id);
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      window.dispatchEvent(new CustomEvent('produtos:refresh'));
      setConfirmando(false);
      setIsModalOpen(false);
    } catch (error: any) {
      setConfirmando(false);
      const mensagemErro =
        error?.response?.data?.message ||
        error?.message ||
        "Nao foi possivel confirmar o aluguel.";
      if (mensagemErro.toLowerCase().includes("nao encontrado")) {
        notificationService.delete(selectedMessage.id);
        setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
        window.dispatchEvent(new CustomEvent('produtos:refresh'));
        return;
      }
      setErroConfirmacao(mensagemErro);
    }
  };

  const handleConfirmarDevolucao = async () => {
    if (!selectedMessage?.aluguelId) {
      setErroConfirmacao("Aluguel nao identificado.");
      return;
    }
    setDevolvendo(true);
    setErroConfirmacao("");
    try {
      await aluguelService.atualizarStatus(selectedMessage.aluguelId, 1);
      markAsRead(selectedMessage.id);
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      window.dispatchEvent(new CustomEvent('produtos:refresh'));
      setDevolvendo(false);
      setIsModalOpen(false);
    } catch (error: any) {
      setDevolvendo(false);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Nao foi possivel confirmar a devolucao.";
      if (msg.toLowerCase().includes("nao encontrado")) {
        notificationService.delete(selectedMessage.id);
        setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
        window.dispatchEvent(new CustomEvent('produtos:refresh'));
        return;
      }
      setErroConfirmacao(msg);
    }
  };

  const handleRecusar = async () => {
    if (!selectedMessage?.aluguelId) {
      setErroConfirmacao("Aluguel nao identificado.");
      return;
    }
    setCancelando(true);
    setErroConfirmacao("");
    try {
      await aluguelService.atualizarStatus(selectedMessage.aluguelId, 1);
      markAsRead(selectedMessage.id);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === selectedMessage.id ? { ...msg, isRead: true } : msg
        )
      );
      // tenta avisar o locatario que a solicitacao foi recusada
      try {
        const aluguel = await aluguelService.getAluguelById(selectedMessage.aluguelId);
        const locatarioId =
          aluguel?.usuarioId ??
          aluguel?.usuario_id_usuario ??
          aluguel?.usuarioIdUsuario ??
          aluguel?.idUsuario;
        if (locatarioId != null) {
          notificationService.add({
            title: "Solicitacao recusada",
            content: `O aluguel do item foi recusado e o item voltou a ficar disponivel.`,
            category: "Aluguel",
            recipientId: Number(locatarioId),
            aluguelId: selectedMessage.aluguelId,
            produtoId: selectedMessage.produtoId,
          });
        }
      } catch (e) {
        // ignore erros ao notificar
      }
      window.dispatchEvent(new CustomEvent('produtos:refresh'));
      // remove notificacao atual apos comando
      notificationService.delete(selectedMessage.id);
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      setCancelando(false);
      setIsModalOpen(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Nao foi possivel recusar o aluguel.";
      if (msg.toLowerCase().includes("nao encontrado")) {
        notificationService.delete(selectedMessage.id);
        setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
        window.dispatchEvent(new CustomEvent('produtos:refresh'));
        setCancelando(false);
        setIsModalOpen(false);
        return;
      }
      setCancelando(false);
      setErroConfirmacao(msg);
    }
  };

  const mensagensFiltradas = messages.filter(msg => {
    if (filtroCategoria !== "Todas" && msg.category !== filtroCategoria) {
      return false;
    }
    if (mostrarApenasNaoLidas && msg.isRead) {
      return false;
    }
    return true;
  });

  const categorias = ["Todas", ...Array.from(new Set(messages.map(msg => msg.category)))];

  const formatDate = (date: Date) => {
    const agora = new Date();
    const diffMs = agora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins} min atras`;
    if (diffHours < 24) return `${diffHours}h atras`;
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atras`;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Aluguel":
        return "[A]";
      case "Financeiro":
        return "[$]";
      case "Avaliacao":
        return "[*]";
      case "Sistema":
        return "[S]";
      case "Lembrete":
        return "[L]";
      case "Atualizacao":
        return "[AT]";
      default:
        return "[?]";
    }
  };

  return (
    <div className="page-container">
        <Navbar />
      <div className="explore-header">
        <h1>Notificacoes</h1>
        <p>Suas mensagens e notificacoes</p>
      </div>

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
            <span>Apenas nao lidas</span>
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

      <div className="messages-info">
        <p>
          {mensagensFiltradas.length} notificacao(s) 
          {filtroCategoria !== "Todas" && ` em ${filtroCategoria}`}
          {mostrarApenasNaoLidas && " nao lidas"}
        </p>
      </div>

      <div className="messages-list">
        {mensagensFiltradas.length === 0 ? (
          <div className="no-messages">
            <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Nenhuma notificacao encontrada</p>
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

      {isModalOpen && selectedMessage && (() => {
        const isRecusada =
          (selectedMessage.title || "").toLowerCase().includes("recus") ||
          (selectedMessage.content || "").toLowerCase().includes("recus");
        const isDonoDaNotificacao =
          !selectedMessage.recipientId || Number(selectedMessage.recipientId) === Number(usuarioId);

        return (
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
                {selectedMessage.category === "Aluguel" &&
                  selectedMessage.aluguelId &&
                  isDonoDaNotificacao &&
                  !isRecusada && (
                  <>
                    <button 
                      className="btn-enviar"
                      onClick={handleConfirmar}
                      disabled={confirmando}
                    >
                      {confirmando ? "Confirmando..." : "Confirmar aluguel"}
                    </button>
                    <button 
                      className="btn-cancelar"
                      onClick={handleRecusar}
                      disabled={cancelando}
                    >
                      {cancelando ? "Cancelando..." : "Nao alugar"}
                    </button>
                  </>
                )}

                {selectedMessage.category === "Aluguel" &&
                  selectedMessage.aluguelId &&
                  isDonoDaNotificacao &&
                  isRecusada && (
                  <button
                    className="btn-cancelar"
                    onClick={() => {
                      notificationService.delete(selectedMessage.id);
                      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
                      closeModal();
                    }}
                  >
                    Excluir notificacao
                  </button>
                )}

                {selectedMessage.category === "Devolucao" &&
                  selectedMessage.aluguelId &&
                  isDonoDaNotificacao && (
                  <button 
                    className="btn-enviar"
                    onClick={handleConfirmarDevolucao}
                    disabled={devolvendo}
                  >
                    {devolvendo ? "Confirmando..." : "Confirmar devolucao"}
                  </button>
                )}

                {selectedMessage.category !== "Aluguel" && selectedMessage.category !== "Devolucao" && (
                  <button
                    className="btn-cancelar"
                    onClick={() => {
                      notificationService.delete(selectedMessage.id);
                      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
                      closeModal();
                    }}
                  >
                    Excluir notificacao
                  </button>
                )}

                {(selectedMessage.category === "Aluguel" || selectedMessage.category === "Devolucao") && !isRecusada && (
                  <button 
                    className="btn-enviar"
                    onClick={closeModal}
                    disabled={confirmando || devolvendo || cancelando}
                  >
                    Fechar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
