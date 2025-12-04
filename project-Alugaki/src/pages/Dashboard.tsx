import { Navbar } from "../components/Navbar";
import { useProdutos } from "../hooks/useProducts";

export function Dashboard() {
  const { produtos, loading } = useProdutos();

  const total = produtos.length;
  const alugados = produtos.filter((p: any) => Number(p.statusAluguelIdStatus) === 3).length;
  const reservados = produtos.filter((p: any) => Number(p.statusAluguelIdStatus) === 2).length;
  const disponiveis = produtos.filter((p: any) => !p.statusAluguelIdStatus && p.disponivel !== false).length;
  const segurancaTotal = total === 0 ? 1 : total; // evita divisao por zero para o grafico

  const cards = [
    { label: "Total de itens", value: total, color: "#111" },
    { label: "Disponíveis", value: disponiveis, color: "#2ecc71" },
    { label: "Reservados", value: reservados, color: "#f39c12" },
    { label: "Alugados", value: alugados, color: "#e74c3c" },
  ];

  const pctDisp = (disponiveis / segurancaTotal) * 100;
  const pctRes = (reservados / segurancaTotal) * 100;
  const pctAlu = (alugados / segurancaTotal) * 100;
  const gradiente =
    total === 0
      ? "conic-gradient(#ccc 0% 100%)"
      : `conic-gradient(#2ecc71 0% ${pctDisp}%, #f39c12 ${pctDisp}% ${pctDisp + pctRes}%, #e74c3c ${pctDisp + pctRes}% 100%)`;

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard de Itens</h1>
          <p>Visão geral de disponibilidade, reservas e alugueis.</p>
        </header>

        {loading ? (
          <div className="dashboard-loader">Carregando itens...</div>
        ) : (
          <>
            <section className="dashboard-cards">
              {cards.map((card) => (
                <div key={card.label} className="dashboard-card" style={{ borderColor: card.color }}>
                  <span className="card-label">{card.label}</span>
                  <span className="card-value" style={{ color: card.color }}>{card.value}</span>
                </div>
              ))}
            </section>

            <section className="dashboard-donut">
              <div className="donut-chart" style={{ background: gradiente }}>
                <div className="donut-center">
                  <strong>{total}</strong>
                  <span>itens</span>
                </div>
              </div>
              <div className="donut-legend donut-legend-inline">
                <div className="legend-item badge-pill">
                  <span className="legend-dot" style={{ background: "#2ecc71" }} />
                  <span>Disponíveis</span>
                  <strong>{disponiveis}</strong>
                </div>
                <div className="legend-item badge-pill">
                  <span className="legend-dot" style={{ background: "#f39c12" }} />
                  <span>Reservados</span>
                  <strong>{reservados}</strong>
                </div>
                <div className="legend-item badge-pill">
                  <span className="legend-dot" style={{ background: "#e74c3c" }} />
                  <span>Alugados</span>
                  <strong>{alugados}</strong>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
