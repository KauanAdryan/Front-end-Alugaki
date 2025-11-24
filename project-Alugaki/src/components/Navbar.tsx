export function Navbar() {
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
        <div className="profile">
          <div className="avatar"></div>
        </div>
      </nav>
  )
}

