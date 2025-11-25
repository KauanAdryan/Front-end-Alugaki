import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { mensagensData } from "../mocks/mensagensData";

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Contar notificações não lidas
  useEffect(() => {
    const naoLidas = mensagensData.filter(msg => !msg.isRead).length;
    setNotificacoesNaoLidas(naoLidas);
  }, []);

  // Buscar usuário logado do localStorage
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      try {
        setUsuarioLogado(JSON.parse(usuario));
      } catch (error) {
        console.error("Erro ao parsear usuário:", error);
      }
    }
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
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleMeuPerfil = () => {
    setDropdownOpen(false);
    navigate("/perfil");
  };

  return (
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo AlugaKi.png" alt="AlugaKi Logo" className="logo" />
          <h2>AlugAki</h2>
        </div>
        <div className="nav-center">
        <ul className="nav-links"> 
          <li><a href="/">Explorar</a></li>
          <li><a href="/itens">Meus Itens</a></li>
        </ul>
        </div>
        <div className="space">..........................................................................................................................................................................................</div>
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
            {usuarioLogado?.avatar ? (
              <img 
                src={usuarioLogado.avatar} 
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
  )
}

