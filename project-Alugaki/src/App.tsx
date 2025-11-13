import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage.tsx"
import './styles/Login.css'
import { CadastroPage } from "./pages/CadastroPage.tsx"
import './styles/Cadastro.css'
import { Homepage } from "./pages/HomePage.tsx"
import './styles/Home.css'
import './styles/Navbar.css'
import './styles/filterBar.css'
import { PerfilPage } from "./pages/PerfilPage.tsx"
import './styles/Perfil.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path= "/" element={<Homepage />} />
        <Route path= "/login" element={<LoginPage />} />
        <Route path= "/cadastro" element={<CadastroPage />} />
        <Route path= "/perfil" element={<PerfilPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
