export function calculateDiagnostic(inputs) {
  const {
    pacientesAgendados,
    taxaFaltas,
    ticketMedio,
    taxaAceite,
    taxaRetorno,
    gastoMarketing,
    novosPacientes,
  } = inputs;

  // Monthly losses
  const faltasPorMes = Math.round(pacientesAgendados * (taxaFaltas / 100));
  const perdaFaltas = faltasPorMes * ticketMedio;

  const orcamentosApresentados = pacientesAgendados * 0.7; // ~70% get a treatment plan
  const orcamentosRecusados = Math.round(orcamentosApresentados * (1 - taxaAceite / 100));
  const perdaOrcamentos = orcamentosRecusados * ticketMedio * 1.8; // treatment plans are usually higher value

  const pacientesQueNaoVoltam = Math.round(pacientesAgendados * (1 - taxaRetorno / 100));
  const valorVidaPaciente = ticketMedio * 8; // avg lifetime visits
  const perdaRetorno = pacientesQueNaoVoltam * valorVidaPaciente * 0.15; // monthly amortized

  const custoPorPaciente = novosPacientes > 0 ? gastoMarketing / novosPacientes : 0;
  const custoIdeal = ticketMedio * 0.15; // benchmark: 15% of ticket
  const desperdicioMarketing = novosPacientes > 0
    ? Math.max(0, (custoPorPaciente - custoIdeal) * novosPacientes)
    : gastoMarketing;

  const perdaTotal = perdaFaltas + perdaOrcamentos + perdaRetorno + desperdicioMarketing;
  const perdaAnual = perdaTotal * 12;

  // Potential revenue
  const receitaAtual = (pacientesAgendados - faltasPorMes) * ticketMedio;
  const receitaPotencial = receitaAtual + perdaTotal;

  return {
    // Per category
    perdaFaltas,
    perdaOrcamentos,
    perdaRetorno,
    desperdicioMarketing,
    perdaTotal,
    perdaAnual,

    // Details
    faltasPorMes,
    orcamentosRecusados,
    pacientesQueNaoVoltam,
    custoPorPaciente,

    // Revenue comparison
    receitaAtual,
    receitaPotencial,

    // For charts
    breakdown: [
      { name: 'Faltas', value: perdaFaltas, color: '#E74C3C' },
      { name: 'Orçamentos\nRecusados', value: perdaOrcamentos, color: '#E67E22' },
      { name: 'Pacientes que\nnão Retornam', value: perdaRetorno, color: '#F39C12' },
      { name: 'Desperdício\nem Marketing', value: desperdicioMarketing, color: '#9B59B6' },
    ],
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
