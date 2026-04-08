import { useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '../utils/calculations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WHATSAPP_NUMBER } from '../config';

const systems = [
  {
    name: 'Sistema de Confirmação',
    desc: 'Reduza faltas com confirmações automáticas via WhatsApp, lembretes 24h antes, e lista de espera para encaixes.',
    field: 'perdaFaltas',
    recovery: 0.6,
  },
  {
    name: 'Sistema de Follow-up de Orçamentos',
    desc: 'Acompanhamento estruturado de orçamentos pendentes com mensagens personalizadas e gatilhos de urgência.',
    field: 'perdaOrcamentos',
    recovery: 0.4,
  },
  {
    name: 'Sistema de Reativação de Pacientes',
    desc: 'Campanhas automáticas para trazer pacientes inativos de volta com lembretes de check-up e ofertas de retorno.',
    field: 'perdaRetorno',
    recovery: 0.35,
  },
  {
    name: 'Sistema de Captação Inteligente',
    desc: 'Otimize seu investimento em marketing com rastreamento de origem, funil de conversão e métricas claras.',
    field: 'desperdicioMarketing',
    recovery: 0.5,
  },
  {
    name: 'Sistema de Indicações',
    desc: 'Transforme pacientes satisfeitos em promotores da sua clínica com um programa estruturado de indicações.',
    field: 'perdaFaltas',
    recovery: 0.2,
  },
];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1A1A1A',
        color: 'white',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '13px',
      }}>
        <div style={{ marginBottom: 4 }}>{payload[0].name}</div>
        <div style={{ fontWeight: 600 }}>{formatCurrency(payload[0].value)}</div>
      </div>
    );
  }
  return null;
}

export default function ResultsDashboard({ results, leadData }) {
  const dashboardRef = useRef(null);

  const whatsappMessage = encodeURIComponent(
    `Olá! Acabei de fazer o Diagnóstico Financeiro da minha clínica "${leadData.clinica}" e descobri que posso estar perdendo ${formatCurrency(results.perdaAnual)} por ano. Gostaria de saber como vocês podem me ajudar a corrigir isso.`
  );

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#FAFAF8',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPosition = 10;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (imgHeight <= pageHeight - 20) {
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      } else {
        // Multi-page
        let remainingHeight = imgHeight;
        let sourceY = 0;
        while (remainingHeight > 0) {
          const sliceHeight = Math.min(pageHeight - 20, remainingHeight);
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST', 0, -sourceY * (imgWidth / canvas.width));
          remainingHeight -= sliceHeight;
          sourceY += sliceHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      pdf.save(`diagnostico-${leadData.clinica.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch {
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const percentAtual = Math.round(
    (results.receitaAtual / results.receitaPotencial) * 100
  );

  return (
    <div className="results-page">
      <div className="container" ref={dashboardRef}>
        <div className="progress-bar">
          <div className="progress-step active" />
          <div className="progress-step active" />
          <div className="progress-step active" />
        </div>

        <div className="results-header fade-up">
          <h2>Resultado do Diagnóstico</h2>
          <div className="clinic-name">{leadData.clinica} — {leadData.cidade || 'Brasil'}</div>
        </div>

        {/* Big scary number */}
        <div className="big-number-card fade-up fade-up-delay-1">
          <div className="label">Você está perdendo por mês</div>
          <div className="amount">{formatCurrency(results.perdaTotal)}</div>
          <div className="annual">
            Isso equivale a <span>{formatCurrency(results.perdaAnual)}</span> por ano
          </div>
        </div>

        {/* Loss breakdown cards */}
        <div className="loss-cards">
          <div className="loss-card faltas fade-up fade-up-delay-1">
            <div className="loss-title">Perdas com Faltas</div>
            <div className="loss-amount">{formatCurrency(results.perdaFaltas)}</div>
            <div className="loss-detail">
              {results.faltasPorMes} pacientes não comparecem por mês
            </div>
          </div>

          <div className="loss-card orcamentos fade-up fade-up-delay-2">
            <div className="loss-title">Orçamentos Recusados</div>
            <div className="loss-amount">{formatCurrency(results.perdaOrcamentos)}</div>
            <div className="loss-detail">
              {results.orcamentosRecusados} orçamentos rejeitados por mês
            </div>
          </div>

          <div className="loss-card retorno fade-up fade-up-delay-3">
            <div className="loss-title">Pacientes que Não Retornam</div>
            <div className="loss-amount">{formatCurrency(results.perdaRetorno)}</div>
            <div className="loss-detail">
              {results.pacientesQueNaoVoltam} pacientes perdidos por mês
            </div>
          </div>

          <div className="loss-card marketing fade-up fade-up-delay-4">
            <div className="loss-title">Desperdício em Marketing</div>
            <div className="loss-amount">{formatCurrency(results.desperdicioMarketing)}</div>
            <div className="loss-detail">
              Custo por paciente: {formatCurrency(results.custoPorPaciente)}
            </div>
          </div>
        </div>

        {/* Revenue comparison */}
        <div className="revenue-comparison fade-up">
          <h3>Receita Atual vs. Potencial</h3>
          <div className="revenue-bars">
            <div className="revenue-bar-group">
              <div className="revenue-bar-label">
                <span>Receita Atual</span>
                <span>{formatCurrency(results.receitaAtual)}/mês</span>
              </div>
              <div className="revenue-bar-track">
                <div
                  className="revenue-bar-fill atual"
                  style={{ width: `${percentAtual}%` }}
                />
              </div>
            </div>
            <div className="revenue-bar-group">
              <div className="revenue-bar-label">
                <span>Receita Potencial</span>
                <span>{formatCurrency(results.receitaPotencial)}/mês</span>
              </div>
              <div className="revenue-bar-track">
                <div
                  className="revenue-bar-fill potencial"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="chart-section fade-up">
          <h3>Distribuição das Perdas</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={results.breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {results.breakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '8px',
          }}>
            {results.breakdown.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B6B6B' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                {item.name.replace('\n', ' ')}
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="action-plan">
          <h3>Plano de Sistemas</h3>
          <p className="plan-subtitle">
            5 sistemas que sua clínica precisa para fechar cada vazamento de receita
          </p>

          {systems.map((system, index) => {
            const recoveryAmount = results[system.field] * system.recovery;
            return (
              <div className="system-card fade-up" key={index}>
                <div className="system-info">
                  <div className="system-number">Sistema {index + 1}</div>
                  <div className="system-name">{system.name}</div>
                  <div className="system-desc">{system.desc}</div>
                </div>
                <div className="system-recovery">
                  <div className="recovery-label">Recuperação estimada</div>
                  <div className="recovery-amount">
                    +{formatCurrency(recoveryAmount)}/mês
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="cta-section fade-up">
          <h3>Pronto para Parar de Perder Dinheiro?</h3>
          <p>
            Converse com um especialista da LK Digital e descubra como implementar
            esses sistemas na sua clínica — sem complicação.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar com Especialista
          </a>
          <br />
          <button className="btn-secondary" onClick={handleExportPDF}>
            Baixar Diagnóstico em PDF
          </button>
        </div>

        {/* Contact Info */}
        <div className="contact-section fade-up">
          <p>Precisa de ajuda? Fale conosco:</p>
          <div className="contact-links">
            <a href="mailto:contato@lkdigital.org">📧 contato@lkdigital.org</a>
            <a href="tel:+5511946851028">📞 (11) 94685-1028</a>
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
