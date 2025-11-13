import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handlePerfilClick = () => {
    navigate("/perfil")
    setIsDropdownOpen(false)
  }

  const handleLogout = () => {
    // Aqui você pode adicionar lógica de logout (limpar tokens, etc.)
    navigate("/login")
    setIsDropdownOpen(false)
  }

  return (
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo AlugaKi.png" alt="AlugaKi Logo" className="logo" />
          <h2>AlugAki</h2>
        </div>
        <div className="nav-center">
        <ul className="nav-links">
          <li><a href="#">Início</a></li>
          <li><a href="#" className="active">Explorar</a></li>
          <li><a href="#">Meus Itens</a></li>
          <li><a href="#">Mensagens</a></li>
        </ul>
        </div>
        <div className="space">...............................................................................</div>
        <div className="profile" ref={dropdownRef}>
          <div className="avatar" onClick={handleProfileClick} style={{ cursor: "pointer" }}></div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handlePerfilClick}>
                Meu Perfil
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
  )
}

