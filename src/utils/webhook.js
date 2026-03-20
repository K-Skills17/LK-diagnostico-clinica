import { WEBHOOK_URL, WEBHOOK_INSTANCE_ID, WEBHOOK_API_KEY } from '../config';
import { formatCurrency } from './calculations';

function normalizeBrazilPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  // Already has country code 55
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  // Add 55 if missing
  return '55' + digits;
}

export async function sendToWebhook({ lead, inputs, results, resultsUrl }) {
  if (!WEBHOOK_URL) {
    console.warn('Webhook URL not configured.');
    return;
  }

  const phone = normalizeBrazilPhone(lead.whatsapp);

  const summary = [
    `Clínica "${lead.clinica}" (${lead.cidade || 'Brasil'}) está perdendo ${formatCurrency(results.perdaTotal)}/mês (${formatCurrency(results.perdaAnual)}/ano).`,
    `Receita atual: ${formatCurrency(results.receitaAtual)}/mês. Potencial: ${formatCurrency(results.receitaPotencial)}/mês.`,
    `Custo por paciente via marketing: ${formatCurrency(results.custoPorPaciente)}.`,
  ].join(' ');

  const findings = [
    {
      area: 'faltas',
      condition: `${results.faltasPorMes} pacientes não comparecem por mês`,
      severity: results.perdaFaltas > 10000 ? 'alta' : 'moderada',
      value: results.perdaFaltas,
    },
    {
      area: 'orcamentos_recusados',
      condition: `${results.orcamentosRecusados} orçamentos rejeitados por mês`,
      severity: results.perdaOrcamentos > 20000 ? 'alta' : 'moderada',
      value: results.perdaOrcamentos,
    },
    {
      area: 'retorno_pacientes',
      condition: `${results.pacientesQueNaoVoltam} pacientes não retornam por mês`,
      severity: results.perdaRetorno > 15000 ? 'alta' : 'moderada',
      value: results.perdaRetorno,
    },
    {
      area: 'marketing',
      condition: `Desperdício de ${formatCurrency(results.desperdicioMarketing)}/mês em marketing`,
      severity: results.desperdicioMarketing > 5000 ? 'alta' : 'moderada',
      value: results.desperdicioMarketing,
    },
  ];

  const recommendedActions = [
    'Sistema de Confirmação — reduzir faltas com confirmações automáticas via WhatsApp',
    'Sistema de Follow-up de Orçamentos — acompanhamento estruturado de orçamentos pendentes',
    'Sistema de Reativação de Pacientes — campanhas automáticas para trazer pacientes inativos',
    'Sistema de Captação Inteligente — otimizar investimento em marketing com rastreamento',
    'Sistema de Indicações — transformar pacientes satisfeitos em promotores da clínica',
  ];

  const urgency = results.perdaTotal > 30000 ? 'urgent' : results.perdaTotal > 15000 ? 'soon' : 'routine';

  const payload = {
    tenantId: WEBHOOK_INSTANCE_ID,
    patientPhone: phone,
    patientName: lead.nome,
    diagnostic: {
      type: 'diagnostico-financeiro',
      summary,
      findings,
      recommendedActions,
      urgency,
      meta: {
        clinica: lead.clinica,
        email: lead.email,
        cidade: lead.cidade,
        inputs,
        results,
        resultsUrl,
      },
    },
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': WEBHOOK_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook response error:', response.status);
    }
  } catch (err) {
    console.error('Failed to send to webhook:', err);
  }
}
