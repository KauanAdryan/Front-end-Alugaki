import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { notificationService } from "../services/notificationService";
import { getUsuarioSalvo, limparUsuario } from "../utils/userStorage";

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Contar notificações não lidas e reagir a mudanças
  useEffect(() => {
    const usuarioId = notificationService.getUsuarioIdLocal();
    const updateCount = () => {
      const naoLidas = notificationService.countUnread(usuarioId);
      setNotificacoesNaoLidas(naoLidas);
    };
    updateCount();
    const handler = () => updateCount();
    window.addEventListener("storage", handler);
    window.addEventListener("notificacoes:changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("notificacoes:changed", handler);
    };
  }, []);

  // Buscar usuário logado do storage
  useEffect(() => {
    const usuario = getUsuarioSalvo();
    if (usuario) {
      setUsuarioLogado(usuario);
    }
  }, []);

  // Fechar menu ao redimensionar (evita estado aberto ao voltar para desktop)
  useEffect(() => {
    const handleResize = () => setMenuAberto(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    limparUsuario();
    navigate("/login");
  };

  const handleMeuPerfil = () => {
    setDropdownOpen(false);
    navigate("/perfil");
  };

  const handleNavLinkClick = (path: string) => {
    navigate(path);
    setMenuAberto(false);
  };

  return (
    <nav className="navbar">
      <div className="logo-container" onClick={() => handleNavLinkClick("/")}>
        <img src="/logo AlugaKi.png" alt="AlugaKi Logo" className="logo" />
        <h2>AlugAki</h2>
      </div>

      <button
        type="button"
        className={`nav-toggle ${menuAberto ? "open" : ""}`}
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuAberto}
        onClick={() => setMenuAberto(prev => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-center ${menuAberto ? "open" : ""}`}>
        <ul className="nav-links"> 
          <li>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => handleNavLinkClick("/")}
            >
              Explorar
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => handleNavLinkClick("/itens")}
            >
              Meus Itens
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => handleNavLinkClick("/locados")}
            >
              Itens Alugados
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => handleNavLinkClick("/dashboard")}
            >
              Dashboard
            </button>
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <div 
          className="notifications-icon" 
          onClick={() => navigate("/mensagens")}
          style={{ cursor: "pointer", position: "relative" }}
        >
          <Bell size={24} />
          {notificacoesNaoLidas > 0 && (
            <span className="notification-badge">{notificacoesNaoLidas}</span>
          )}
        </div>
        <div className="profile" ref={dropdownRef}>
          <div 
            className="avatar" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: "pointer" }}
          >
            {usuarioLogado?.avatar || usuarioLogado?.foto ? (
              <img 
                src={usuarioLogado.avatar || usuarioLogado.foto} 
                alt={usuarioLogado.nome || "Perfil"} 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button 
                className="dropdown-item"
                onClick={handleMeuPerfil}
              >
                Meu Perfil
              </button>
              <button 
                className="dropdown-item"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
