import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/calculations';
import { sendCapiEvent } from '../utils/capi';

export default function TeaserGate({ results, onUnlock }) {
  // InitiateCheckout — user sees their loss number (high intent)
  useEffect(() => {
    sendCapiEvent('InitiateCheckout', {
      customData: {
        content_name: 'Diagnóstico Financeiro - Teaser',
        content_category: 'diagnostic',
        value: results.perdaTotal,
        currency: 'BRL',
      },
    });
  }, []);
  const [form, setForm] = useState({
    nome: '',
    clinica: '',
    whatsapp: '',
    email: '',
    cidade: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const isValid = form.nome && form.clinica && form.whatsapp;

  const formatWhatsApp = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleWhatsAppChange = (e) => {
    setForm({ ...form, whatsapp: formatWhatsApp(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    onUnlock(form);
  };

  return (
    <div className="results-page">
      <div className="container">
        <div className="progress-bar">
          <div className="progress-step active" />
          <div className="progress-step active" />
          <div className="progress-step" />
        </div>

        <div className="results-header fade-up">
          <h2>Resultado do Diagnóstico</h2>
        </div>

        {/* The one visible result - the big scary number */}
        <div className="big-number-card fade-up fade-up-delay-1">
          <div className="label">Você está perdendo por mês</div>
          <div className="amount">{formatCurrency(results.perdaTotal)}</div>
          <div className="annual">
            Isso equivale a <span>{formatCurrency(results.perdaAnual)}</span> por ano
          </div>
        </div>

        {/* Blurred preview of what's behind the gate */}
        <div className="teaser-blurred fade-up fade-up-delay-2">
          <div className="blurred-content">
            <div className="loss-cards">
              <div className="loss-card faltas">
                <div className="loss-title">Perdas com Faltas</div>
                <div className="loss-amount">{formatCurrency(results.perdaFaltas)}</div>
              </div>
              <div className="loss-card orcamentos">
                <div className="loss-title">Orçamentos Recusados</div>
                <div className="loss-amount">{formatCurrency(results.perdaOrcamentos)}</div>
              </div>
              <div className="loss-card retorno">
                <div className="loss-title">Pacientes que Não Retornam</div>
                <div className="loss-amount">{formatCurrency(results.perdaRetorno)}</div>
              </div>
              <div className="loss-card marketing">
                <div className="loss-title">Desperdício em Marketing</div>
                <div className="loss-amount">{formatCurrency(results.desperdicioMarketing)}</div>
              </div>
            </div>
          </div>
          <div className="blurred-overlay" />
        </div>

        {/* Lead capture gate */}
        <div className="gate-section fade-up fade-up-delay-3">
          <div className="gate-card">
            <div className="gate-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>Desbloqueie Seu Relatório Completo</h3>
            <p>
              Receba a análise detalhada com o plano de ação personalizado
              direto no seu WhatsApp — em segundos.
            </p>

            <form className="gate-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Nome da clínica"
                value={form.clinica}
                onChange={(e) => setForm({ ...form, clinica: e.target.value })}
                required
              />
              <div className="phone-input-group">
                <span className="phone-prefix">+55</span>
                <input
                  type="tel"
                  placeholder="11 99999-9999"
                  value={form.whatsapp}
                  onChange={handleWhatsAppChange}
                  required
                />
              </div>
              <input
                type="email"
                placeholder="E-mail (opcional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Cidade (opcional)"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              />
              <button
                type="submit"
                className="btn-whatsapp gate-btn"
                disabled={!isValid || submitting}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {submitting ? 'Enviando...' : 'Receber Relatório no WhatsApp'}
              </button>
            </form>

            <div className="gate-trust">
              Seus dados estão seguros. Sem spam.
            </div>

            {/* Contact Info */}
            <div className="contact-section">
              <p>Precisa de ajuda? Fale conosco:</p>
              <div className="contact-links">
                <a href="mailto:contato@lkdigital.org">📧 contato@lkdigital.org</a>
                <a href="tel:+5511946851028">📞 (11) 94685-1028</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          Ferramenta gratuita por{' '}
          <a href="https://lkdigital.odo.br" target="_blank" rel="noopener noreferrer">
            LK Digital
          </a>{' '}
          — Sistemas que funcionam para dentistas
        </div>
      </div>
    </div>
  );
}
