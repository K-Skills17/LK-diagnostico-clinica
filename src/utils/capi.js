function generateEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function hashSHA256(value) {
  if (!value) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  return crypto.subtle.digest('SHA-256', data).then((buf) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

function getFbc() {
  const match = document.cookie.match(/_fbc=([^;]+)/);
  return match ? match[1] : null;
}

function getFbp() {
  const match = document.cookie.match(/_fbp=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Send event via server-side proxy (/api/capi) + browser pixel for dedup.
 * Token never touches the browser — it lives on the Vercel serverless function.
 */
export async function sendCapiEvent(eventName, { email, phone, nome, cidade, customData } = {}) {
  const eventId = generateEventId();

  // Fire browser pixel event with matching event_id for dedup
  if (window.fbq) {
    window.fbq('track', eventName, customData || {}, { eventID: eventId });
  }

  // Hash user data for privacy
  const [hashedEmail, hashedPhone, hashedFirstName, hashedCity] = await Promise.all([
    hashSHA256(email),
    hashSHA256(phone),
    hashSHA256(nome?.split(' ')[0]),
    hashSHA256(cidade),
  ]);

  const eventData = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: window.location.href,
    action_source: 'website',
    user_data: {
      client_user_agent: navigator.userAgent,
      client_ip_address: null, // filled by the server proxy
      fbc: getFbc(),
      fbp: getFbp(),
      ...(hashedEmail && { em: [hashedEmail] }),
      ...(hashedPhone && { ph: [hashedPhone] }),
      ...(hashedFirstName && { fn: [hashedFirstName] }),
      ...(hashedCity && { ct: [hashedCity] }),
    },
    ...(customData && { custom_data: customData }),
  };

  try {
    await fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventData] }),
    });
  } catch (err) {
    console.error('CAPI proxy request failed:', err);
  }
}
