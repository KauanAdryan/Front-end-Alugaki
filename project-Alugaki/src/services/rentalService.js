// Modo Mock: true para usar dados mockados, false para usar BFF
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

import httpClient from './httpClient';
import { BFF_CONFIG } from '../config/bff.config';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const getUsuarioIdLocal = () => {
  try {
    const salvo = localStorage.getItem('usuario');
    if (!salvo) return null;
    const parsed = JSON.parse(salvo);
    const id =
      parsed.id ??
      parsed.usuarioId ??
      parsed.idUsuario ??
      parsed.usuario_id_usuario ??
      null;
    return id != null ? Number(id) : null;
  } catch (error) {
    console.warn('Nao foi possivel ler usuario do localStorage', error);
    return null;
  }
};

const montarPayload = (produtoId, payload = {}) => {
  const produtoIdNum = Number(payload.produtoId ?? produtoId);
  const usuarioIdRaw = payload.usuarioId ?? payload.usuarioIdUsuario ?? getUsuarioIdLocal();
  const usuarioIdParsed = usuarioIdRaw != null ? Number(usuarioIdRaw) : undefined;
  if (!Number.isFinite(usuarioIdParsed)) {
    throw new Error('Usuario da locacao nao identificado. Faca login para alugar.');
  }
  const usuarioId = Number(usuarioIdParsed);

  if (usuarioId == null) {
    throw new Error('Usuário não identificado. Faça login antes de alugar.');
  }
  const statusId =
    payload.statusId ??
    payload.status_aluguel_id_status ??
    payload.statusAluguelId ??
    payload.statusAluguel ??
    1; // default

  // Datas obrigatórias (backend reclama de dataFim null)
  const dias = Number(payload.dias || 3);
  const inicio = payload.dataInicio ? new Date(payload.dataInicio) : new Date();
  const fim = payload.dataFim
    ? new Date(payload.dataFim)
    : new Date(inicio.getTime() + dias * 24 * 60 * 60 * 1000);

  const precoDiaria =
    payload.precoDiaria ??
    payload.preco ??
    payload.valorDiaria ??
    payload.valor ??
    0;
  const valorTotal = Number(precoDiaria) * dias;

  return {
    ...payload,
    produtoId: produtoIdNum,
    produto_id_produto: produtoIdNum,
    produtoIdProduto: produtoIdNum,

    usuarioId: usuarioId,
    usuario_id_usuario: usuarioId,
    usuarioIdUsuario: usuarioId,

    dataInicio: inicio.toISOString(),
    dataFim: fim.toISOString(),
    dataIni: inicio.toISOString(),
    data_ini: inicio.toISOString(),
    data_fim: fim.toISOString(),
    data_fim_aluguel: fim.toISOString(),

    dias,
    quantidadeDias: dias,
    valorTotal,
    valor_total: valorTotal,
    valor_total_aluguel: valorTotal,

    status_aluguel_id_status: statusId,
    statusIdStatus: statusId,
    statusAluguelIdStatus: statusId,
    statusAluguelId: statusId,
  };
};

export const aluguelService = {
  async listarPorStatus(statusId = 2) {
    if (USE_MOCK_DATA) {
      await delay();
      return [];
    }
    const endpoint = `${BFF_CONFIG.ENDPOINTS.ALUGUEL}/status/${statusId}`;
    const response = await httpClient.get(endpoint);
    return Array.isArray(response?.data) ? response.data : [];
  },

  async criarAluguel(produtoId, payload = {}) {
    if (USE_MOCK_DATA) {
      await delay();
      return {
        id: Date.now(),
        status: 'pendente',
        produtoId,
        ...payload,
      };
    }

    const body = montarPayload(produtoId, payload);
    const endpoint = BFF_CONFIG.ENDPOINTS.ALUGUEL;
    const response = await httpClient.post(endpoint, body);
    return response.data;
  },

  async alugarProduto(produtoId, payload = {}) {
    try {
      if (USE_MOCK_DATA) {
        await delay();
        return {
          aluguelId: Date.now(),
          status: 'confirmado',
          produtoId,
          ...payload,
        };
      }

      // 1) cria o aluguel
      const aluguelCriado = await this.criarAluguel(produtoId, payload);
      const aluguelId =
        aluguelCriado?.id ??
        aluguelCriado?.aluguelId ??
        aluguelCriado?.idAluguel ??
        aluguelCriado?.id_aluguel;

      // 2) dispara a acao de alugar usando o ID do aluguel recem-criado
      const endpoint = `${BFF_CONFIG.ENDPOINTS.ALUGUEL}/${aluguelId}/alugar`;
      const usuarioIdRaw = payload.usuarioId ?? payload.usuarioIdUsuario ?? getUsuarioIdLocal();
      if (!Number.isFinite(Number(usuarioIdRaw))) {
        throw new Error('Usuario da locacao nao identificado. Faca login para alugar.');
      }
      const usuarioId = Number(usuarioIdRaw);
      const bodyAlugar = {
        usuarioIdUsuario: Number(usuarioId),
        usuario_id_usuario: Number(usuarioId),
        statusAluguelIdStatus: 2,
        status_aluguel_id_status: 2,
      };
      const response = await httpClient.post(endpoint, bodyAlugar);

      const aluguelIdResposta =
        response?.data?.id ??
        response?.data?.aluguelId ??
        response?.data?.idAluguel ??
        response?.data?.id_aluguel;

      const aluguelIdFinal = aluguelIdResposta ?? aluguelId;

      return {
        aluguelId: aluguelIdFinal,
        aluguelCriado,
        alugarResponse: response.data,
      };
    } catch (error) {
      console.error('Erro ao alugar produto:', error);
      throw error;
    }
  },

  async confirmarAluguel(aluguelId, { produtoId, usuarioId } = {}) {
    if (USE_MOCK_DATA) {
      await delay();
      return { id: aluguelId, status: 'confirmado' };
    }

    try {
      const endpoint = `${BFF_CONFIG.ENDPOINTS.ALUGUEL}/${aluguelId}/confirmar`;
      const body = {
        statusAluguelIdStatus: 3,
        status_aluguel_id_status: 3,
      };
      const response = await httpClient.post(endpoint, body);
      return { usedAluguelId: aluguelId, data: response.data };
    } catch (error) {
      console.error('Erro ao confirmar aluguel:', error);
      // fallback: tentar localizar outro aluguel pendente do mesmo produto/usuario
      if (produtoId && error?.message?.toLowerCase().includes('nao encontrado')) {
        try {
          const pendentes = await this.listarPorStatus(2);
          const candidato = pendentes.find((a) => {
            const prodId = a.produtoIdProduto ?? a.produto_id_produto ?? a.idProduto ?? a.produtoId;
            const userId = a.usuarioIdUsuario ?? a.usuario_id_usuario ?? a.idUsuario ?? a.usuarioId;
            const sameProd = Number(prodId) === Number(produtoId);
            if (usuarioId != null) {
              return sameProd && Number(userId) === Number(usuarioId);
            }
            return sameProd;
          });
          if (candidato) {
            const novoId =
              candidato.idAluguel ??
              candidato.id_aluguel ??
              candidato.id ??
              candidato.aluguelId;
            if (novoId) {
              const endpoint = `${BFF_CONFIG.ENDPOINTS.ALUGUEL}/${novoId}/confirmar`;
              const body = {
                statusAluguelIdStatus: 3,
                status_aluguel_id_status: 3,
              };
              const resp = await httpClient.post(endpoint, body);
              return { usedAluguelId: Number(novoId), data: resp.data };
            }
          }
        } catch (e) {
          console.error('Fallback de confirmação falhou:', e);
        }
      }
      throw error;
    }
  },

  async atualizarStatus(aluguelId, statusId) {
    if (USE_MOCK_DATA) {
      await delay();
      return { id: aluguelId, status: statusId };
    }
    // Backend exige campos não nulos (dataIni, dataFim, produto, valor, usuario)
    const endpoint = `${BFF_CONFIG.ENDPOINTS.ALUGUEL}/${aluguelId}`;
    const atual = await httpClient.get(endpoint).then((r) => r.data);

    const produtoId =
      atual?.produtoIdProduto ??
      atual?.produto_id_produto ??
      atual?.idProduto ??
      atual?.produtoId;
    const usuarioId =
      atual?.usuarioIdUsuario ??
      atual?.usuario_id_usuario ??
      atual?.idUsuario ??
      atual?.usuarioId;
    const dataIni =
      atual?.dataIni ??
      atual?.data_ini ??
      atual?.data_inicio;
    const dataFim =
      atual?.dataFim ??
      atual?.data_fim ??
      atual?.data_fim_aluguel;
    const valorTotal =
      atual?.valorTotal ??
      atual?.valor_total ??
      atual?.valor_total_aluguel;

    const body = {
      produtoIdProduto: produtoId,
      produto_id_produto: produtoId,
      usuarioIdUsuario: usuarioId,
      usuario_id_usuario: usuarioId,
      dataIni: dataIni,
      data_ini: dataIni,
      dataFim: dataFim,
      data_fim: dataFim,
      valorTotal: valorTotal,
      valor_total: valorTotal,
      statusAluguelIdStatus: statusId,
      status_aluguel_id_status: statusId,
    };

    const response = await httpClient.put(endpoint, body);
    return response.data;
  },
};
