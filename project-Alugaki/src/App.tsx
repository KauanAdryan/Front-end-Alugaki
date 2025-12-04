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
import { Mensagens } from "./pages/Mensagens.tsx"
import './styles/Mensagens.css'
import { MyItens } from "./pages/Itens.tsx"
import { ItensLocados } from "./pages/ItensLocados.tsx"
import './styles/Itens.css'
import { EsqueceuSenha } from "./pages/esqueceuSenha.tsx"
import './styles/esqueceuSenha.css'
import { DetalhesEquipamento } from "./pages/DetalhesEquipamento.tsx"
import './styles/DetalhesEquipamento.css'
import { Dashboard } from "./pages/Dashboard.tsx"
import './styles/Dashboard.css'
import { ProtectedRoute } from "./components/ProtectedRoute.tsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path= "/login" element={<LoginPage />} />
        <Route path= "/cadastro" element={<CadastroPage />} />
        <Route path= "/esqueceu-senha" element={<EsqueceuSenha/>} />
        <Route path= "/" element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        <Route path= "/perfil" element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        } />
        <Route path= "/mensagens" element={
          <ProtectedRoute>
            <Mensagens />
          </ProtectedRoute>
        } />
        <Route path= "/itens" element={
          <ProtectedRoute>
            <MyItens/>
          </ProtectedRoute>
        } />
        <Route path= "/locados" element={
          <ProtectedRoute>
            <ItensLocados/>
          </ProtectedRoute>
        } />
        <Route path= "/equipamento/:id" element={
          <ProtectedRoute>
            <DetalhesEquipamento />
          </ProtectedRoute>
        } />
        <Route path= "/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
