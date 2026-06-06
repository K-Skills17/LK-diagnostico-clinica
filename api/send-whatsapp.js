// Vercel Serverless Function — formats diagnostic report and sends via chatbot webhook
// Mirrors the pattern from Fb-lead-audit-tool's /api/send-whatsapp

import Anthropic from '@anthropic-ai/sdk';

const LK_CHATBOT_URL = process.env.LK_CHATBOT_URL;
const LK_CHATBOT_API_KEY = process.env.LK_CHATBOT_API_KEY;
const LK_CHATBOT_TENANT_ID = process.env.LK_CHATBOT_TENANT_ID;

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 11) return '55' + digits;
  if (digits.length === 10) return '55' + digits;
  return digits;
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// --- Claude AI analysis ---

async function generateActionPlan(lead, inputs, results) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not configured — skipping AI analysis');
    return null;
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Voce e um consultor financeiro especializado em clinicas odontologicas no Brasil. Analise o diagnostico financeiro desta clinica e crie um plano de acao personalizado com 3-4 recomendacoes especificas.

DADOS DA CLINICA:
- Clinica: ${lead.clinica}
- Cidade: ${lead.cidade || 'Nao informada'}

DIAGNOSTICO FINANCEIRO:
- Receita atual: ${formatBRL(results.receitaAtual)}/mes
- Receita potencial: ${formatBRL(results.receitaPotencial)}/mes
- Perda total: ${formatBRL(results.perdaTotal)}/mes (${formatBRL(results.perdaAnual)}/ano)

DETALHAMENTO DAS PERDAS:
- Faltas: ${formatBRL(results.perdaFaltas)}/mes (${results.faltasPorMes} pacientes/mes)
- Orcamentos recusados: ${formatBRL(results.perdaOrcamentos)}/mes (${results.orcamentosRecusados} recusas/mes)
- Pacientes que nao retornam: ${formatBRL(results.perdaRetorno)}/mes (${results.pacientesQueNaoVoltam} pacientes)
- Desperdicio em marketing: ${formatBRL(results.desperdicioMarketing)}/mes (custo por paciente: ${formatBRL(results.custoPorPaciente)})

DADOS DE ENTRADA:
- Cadeiras: ${inputs.cadeiras || 'N/A'}
- Ticket medio: ${formatBRL(inputs.ticketMedio || 0)}
- Pacientes/mes: ${inputs.pacientesMes || 'N/A'}
- Taxa de faltas: ${inputs.taxaFaltas || 'N/A'}%
- Investimento em marketing: ${formatBRL(inputs.investimentoMarketing || 0)}/mes

INSTRUCOES:
- Escreva em portugues brasileiro, tom profissional mas amigavel
- De exatamente 3-4 acoes prioritarias, cada uma com 1-2 frases curtas
- Foque nas acoes que trariam mais receita imediata baseado nos dados acima
- Seja especifico — use os numeros do diagnostico para justificar cada acao
- Priorize pela maior perda financeira primeiro
- NAO use markdown. Use formatacao WhatsApp: *negrito* para destaques
- Mantenha CURTO — maximo 500 caracteres no total do plano
- Retorne APENAS o plano de acao numerado (1. 2. 3. 4.), sem introducao ou conclusao`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text : null;
}

// --- Message builder ---

function buildMessage(lead, inputs, results, resultsUrl, actionPlan) {
  const lines = [
    `Ola ${lead.nome}! 👋`,
    ``,
    `Acabamos de analisar os numeros da *${lead.clinica}* e o resultado e importante.`,
    ``,
    `💰 *Sua clinica esta perdendo ${formatBRL(results.perdaTotal)} por mes*`,
    `Isso equivale a *${formatBRL(results.perdaAnual)} por ano*.`,
    ``,
    `📊 *Detalhamento das perdas:*`,
    ``,
    `❌ *Faltas:* ${formatBRL(results.perdaFaltas)}/mes`,
    `   ${results.faltasPorMes} pacientes nao comparecem`,
    ``,
    `❌ *Orcamentos recusados:* ${formatBRL(results.perdaOrcamentos)}/mes`,
    `   ${results.orcamentosRecusados} orcamentos rejeitados`,
    ``,
    `❌ *Pacientes que nao retornam:* ${formatBRL(results.perdaRetorno)}/mes`,
    `   ${results.pacientesQueNaoVoltam} pacientes perdidos`,
    ``,
    `❌ *Desperdicio em marketing:* ${formatBRL(results.desperdicioMarketing)}/mes`,
    `   Custo por paciente: ${formatBRL(results.custoPorPaciente)}`,
    ``,
    `📈 *Receita atual:* ${formatBRL(results.receitaAtual)}/mes`,
    `📈 *Receita potencial:* ${formatBRL(results.receitaPotencial)}/mes`,
  ];

  if (actionPlan) {
    lines.push(
      ``,
      `---`,
      ``,
      `🎯 *Seu plano de acao personalizado (IA):*`,
      ``,
      actionPlan,
    );
  } else {
    // Fallback: generic 5-system recommendations if AI is unavailable
    lines.push(
      ``,
      `---`,
      ``,
      `🔧 *5 sistemas para corrigir essas perdas:*`,
      ``,
      `1. *Sistema de Confirmacao* — confirmacoes automaticas via WhatsApp para reduzir faltas`,
      `2. *Sistema de Follow-up* — acompanhamento de orcamentos pendentes com mensagens personalizadas`,
      `3. *Sistema de Reativacao* — campanhas automaticas para trazer pacientes inativos de volta`,
      `4. *Sistema de Captacao Inteligente* — otimizar marketing com rastreamento e metricas claras`,
      `5. *Sistema de Indicacoes* — transformar pacientes satisfeitos em promotores da clinica`,
    );
  }

  lines.push(
    ``,
    `📊 *Seu relatorio completo:*`,
    resultsUrl || 'https://lkdigital.odo.br',
    ``,
    `---`,
    ``,
    `Quer descobrir como implementar essas acoes na *${lead.clinica}* e parar de perder dinheiro?`,
    ``,
    `Qual dessas perdas voce sente que mais impacta a ${lead.clinica} hoje? 😊`,
  );

  return lines.join('\n');
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { lead, inputs, results, resultsUrl } = req.body;

    if (!lead?.nome || !lead?.whatsapp || !lead?.clinica) {
      return res.status(400).json({ error: 'Nome, telefone e nome da clinica sao obrigatorios' });
    }

    const formattedPhone = formatPhone(lead.whatsapp);
    if (formattedPhone.length < 10) {
      return res.status(400).json({ error: 'Numero de telefone invalido' });
    }

    // Run AI analysis in parallel with other async work (CAPI is handled client-side)
    const actionPlan = await generateActionPlan(lead, inputs, results).catch((err) => {
      console.error('Claude AI error:', err);
      return null;
    });

    const message = buildMessage(lead, inputs, results, resultsUrl, actionPlan);

    let messageSent = false;
    let whatsappError = '';

    // Primary: LK Chatbot webhook
    if (LK_CHATBOT_URL && LK_CHATBOT_API_KEY && LK_CHATBOT_TENANT_ID) {
      try {
        const webhookUrl = `${LK_CHATBOT_URL}/webhook/audit-lead`;
        console.log('Chatbot webhook request:', { url: webhookUrl, phone: formattedPhone });

        const chatbotRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': LK_CHATBOT_API_KEY,
          },
          body: JSON.stringify({
            phone: formattedPhone,
            name: lead.nome,
            reportMessage: message,
            tenantId: LK_CHATBOT_TENANT_ID,
            diagnosticData: {
              clinica: lead.clinica,
              email: lead.email,
              cidade: lead.cidade,
              inputs,
              results,
              resultsUrl,
            },
          }),
        });

        const responseText = await chatbotRes.text();
        console.log('Chatbot webhook response:', chatbotRes.status, responseText);

        if (chatbotRes.ok) {
          messageSent = true;
        } else {
          whatsappError = `Chatbot webhook ${chatbotRes.status}: ${responseText}`;
          console.error('Chatbot webhook error:', whatsappError);
        }
      } catch (err) {
        whatsappError = `Chatbot webhook fetch error: ${err.message || String(err)}`;
        console.error('Chatbot webhook error:', err);
      }
    }

    if (!messageSent && !whatsappError) {
      whatsappError = 'Chatbot webhook not configured';
    }

    return res.status(200).json({
      success: true,
      messageSent,
      aiPlanGenerated: !!actionPlan,
      whatsappError: messageSent ? undefined : whatsappError,
    });
  } catch (err) {
    console.error('Error in send-whatsapp:', err);
    return res.status(200).json({ success: true, messageSent: false });
  }
}
