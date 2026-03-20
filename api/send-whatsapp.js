// Vercel Serverless Function — formats diagnostic report and sends via chatbot webhook
// Mirrors the pattern from Fb-lead-audit-tool's /api/send-whatsapp

const LK_CHATBOT_URL = process.env.LK_CHATBOT_URL;
const LK_CHATBOT_API_KEY = process.env.LK_CHATBOT_API_KEY;
const LK_CHATBOT_TENANT_ID = process.env.LK_CHATBOT_TENANT_ID;

// Evolution API fallback
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_INSTANCE = process.env.EVOLUTION_API_INSTANCE;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

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

function buildMessage(lead, inputs, results, resultsUrl) {
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
    ``,
    `📊 *Seu relatorio completo:*`,
    resultsUrl || 'https://lkdigital.odo.br',
    ``,
    `---`,
    ``,
    `Quer descobrir como implementar esses sistemas na *${lead.clinica}* e parar de perder dinheiro?`,
    ``,
    `Qual dessas perdas voce sente que mais impacta a ${lead.clinica} hoje? 😊`,
  ];

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

    const message = buildMessage(lead, inputs, results, resultsUrl);

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

    // Fallback: Evolution API direct send
    if (!messageSent && EVOLUTION_API_URL && EVOLUTION_API_INSTANCE && EVOLUTION_API_KEY) {
      try {
        const evoUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_API_INSTANCE}`;
        console.log('Evolution API fallback:', { url: evoUrl, phone: formattedPhone });

        const evolutionRes = await fetch(evoUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: message,
          }),
        });

        const responseText = await evolutionRes.text();
        console.log('Evolution API response:', evolutionRes.status, responseText);

        if (evolutionRes.ok) {
          messageSent = true;
          whatsappError = '';
        } else {
          whatsappError = `Evolution API ${evolutionRes.status}: ${responseText}`;
        }
      } catch (err) {
        whatsappError = `Evolution fetch error: ${err.message || String(err)}`;
        console.error('Evolution API error:', err);
      }
    } else if (!messageSent && !whatsappError) {
      whatsappError = 'No messaging service configured';
      console.error('Neither chatbot webhook nor Evolution API configured');
    }

    return res.status(200).json({
      success: true,
      messageSent,
      whatsappError: messageSent ? undefined : whatsappError,
    });
  } catch (err) {
    console.error('Error in send-whatsapp:', err);
    return res.status(200).json({ success: true, messageSent: false });
  }
}
