const STORAGE_KEY = "notificacoesExtra";
import { getUsuarioSalvo } from "../utils/userStorage";

const getUsuarioIdLocal = () => {
  try {
    const parsed = getUsuarioSalvo();
    if (!parsed) return null;
    const id =
      parsed.id ??
      parsed.idUsuario ??
      parsed.usuarioId ??
      parsed.usuario_id_usuario ??
      null;
    return id != null ? Number(id) : null;
  } catch (error) {
    return null;
  }
};

const loadExtras = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Nao foi possivel ler notificacoes extras", error);
    return [];
  }
};

const saveExtras = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    try {
      window.dispatchEvent(new CustomEvent("notificacoes:changed"));
    } catch (_) {
      // ignore
    }
  } catch (error) {
    console.warn("Nao foi possivel salvar notificacoes extras", error);
  }
};

export const notificationService = {
  getAll(usuarioId) {
    const extras = loadExtras();
    const merged = extras.map((msg) => ({
      ...msg,
      timestamp:
        msg.timestamp instanceof Date
          ? msg.timestamp
          : new Date(msg.timestamp),
    }));

    if (usuarioId != null) {
      return merged.filter(
        (msg) => Number(msg.recipientId) === Number(usuarioId)
      );
    }

    return merged;
  },

  add({ title, content, category = "Aluguel", recipientId, aluguelId, produtoId }) {
    const extras = loadExtras();
    const parsedAluguelId = Number.isFinite(Number(aluguelId)) ? Number(aluguelId) : null;
    const novo = {
      id: `ntf-${Date.now()}`,
      title,
      content,
      sender: "Sistema",
      timestamp: new Date().toISOString(),
      isRead: false,
      category,
      recipientId,
      aluguelId: parsedAluguelId,
      produtoId,
    };
    extras.push(novo);
    saveExtras(extras);
    return novo;
  },

  update(id, partial) {
    const extras = loadExtras().map((msg) =>
      msg.id === id ? { ...msg, ...partial } : msg
    );
    saveExtras(extras);
  },

  markAsRead(id) {
    const extras = loadExtras().map((msg) =>
      msg.id === id ? { ...msg, isRead: true } : msg
    );
    saveExtras(extras);
  },

  delete(id) {
    const extras = loadExtras().filter((msg) => msg.id !== id);
    saveExtras(extras);
  },

  markAllAsRead() {
    const extras = loadExtras().map((msg) => ({ ...msg, isRead: true }));
    saveExtras(extras);
  },

  deleteAllRead() {
    const extras = loadExtras().filter((msg) => !msg.isRead);
    saveExtras(extras);
  },

  countUnread(usuarioId) {
    const all = this.getAll(usuarioId ?? getUsuarioIdLocal());
    return all.filter((msg) => !msg.isRead).length;
  },

  getUsuarioIdLocal,
};
