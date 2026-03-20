function normalizeBrazilPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return '55' + digits;
}

/**
 * Send diagnostic data to the server-side API route,
 * which formats the WhatsApp message and sends it via chatbot webhook.
 */
export async function sendToWebhook({ lead, inputs, results, resultsUrl }) {
  const phone = normalizeBrazilPhone(lead.whatsapp);

  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: {
          ...lead,
          whatsapp: phone,
        },
        inputs,
        results,
        resultsUrl,
      }),
    });

    const data = await response.json();

    if (!data.messageSent) {
      console.error('WhatsApp message not sent:', data.whatsappError);
    }
  } catch (err) {
    console.error('Failed to send diagnostic:', err);
  }
}
