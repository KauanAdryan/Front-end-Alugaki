export function Navbar() {
  return (
    <header className="navbar">
      <div className="logo-container">
        <img src="/logo AlugaKi.png" alt="AlugaKi Logo" className="logo" />
        <a className="title" href="title">AlugaKi</a>
      </div>
      <ul className="nav-options">
        <li className="nav-item">
          <a href="/Home">
            <span className="nav-text">Início</span>
          </a>
        </li>
        <li className="nav-item">
          <a href="/itens">
            <span className="nav-text">Meus Itens</span>
          </a>
        </li>
        <li className="nav-item">
          <a href="/mensagens">
            <span className="nav-text">Mensagens</span>
          </a>
        </li>
      </ul>
    </header>
  )
}