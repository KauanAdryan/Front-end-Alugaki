const STORAGE_KEY = "usuario";

export const getUsuarioSalvo = () => {
  try {
    const session = sessionStorage.getItem(STORAGE_KEY);
    const source = session ?? localStorage.getItem(STORAGE_KEY);
    return source ? JSON.parse(source) : null;
  } catch (error) {
    console.warn("Nao foi possivel ler usuario salvo", error);
    return null;
  }
};

export const salvarUsuario = (usuario) => {
  const serialized = JSON.stringify(usuario);
  try {
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn("Nao foi possivel salvar usuario na session", error);
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn("Nao foi possivel salvar usuario no localStorage", error);
  }
};

export const limparUsuario = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
};
