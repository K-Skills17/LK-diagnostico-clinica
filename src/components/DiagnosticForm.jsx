import { useState } from 'react';

const defaultValues = {
  pacientesAgendados: '',
  taxaFaltas: '',
  ticketMedio: '',
  taxaAceite: '',
  taxaRetorno: '',
  gastoMarketing: '',
  novosPacientes: '',
};

const VALIDATION = {
  pacientesAgendados: { min: 1, max: 10000 },
  taxaFaltas: { min: 0, max: 100 },
  ticketMedio: { min: 1, max: 100000 },
  taxaAceite: { min: 0, max: 100 },
  taxaRetorno: { min: 0, max: 100 },
  gastoMarketing: { min: 0, max: 1000000 },
  novosPacientes: { min: 0, max: 10000 },
};

function getError(field, value) {
  if (value === '') return null;
  const num = parseFloat(value);
  if (isNaN(num)) return 'Valor invalido';
  const rule = VALIDATION[field];
  if (num < rule.min) return `Minimo: ${rule.min}`;
  if (num > rule.max) return `Maximo: ${rule.max}`;
  return null;
}

export default function DiagnosticForm({ onCalculate }) {
  const [inputs, setInputs] = useState(defaultValues);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const allFilled = Object.values(inputs).every((v) => v !== '');
  const hasErrors = Object.entries(inputs).some(([k, v]) => getError(k, v) !== null);
  const canSubmit = allFilled && !hasErrors && !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    const parsed = {};
    for (const [key, val] of Object.entries(inputs)) {
      parsed[key] = parseFloat(val) || 0;
    }
    onCalculate(parsed);
  };

  return (
    <div className="diagnostic-page">
      <div className="container">
        <div className="progress-bar">
          <div className="progress-step active" />
          <div className="progress-step active" />
          <div className="progress-step" />
        </div>

        <div className="diagnostic-header fade-up">
          <h2>Diagnostico da Sua Clinica</h2>
          <p>
            Preencha com os numeros reais da sua clinica. Nao precisa ser exato
            — uma estimativa ja revela muito.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group fade-up fade-up-delay-1">
              <label>
                Pacientes agendados por mes
                <span className="hint"> (total de agendamentos)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 200"
                value={inputs.pacientesAgendados}
                onChange={(e) => update('pacientesAgendados', e.target.value)}
                min="1"
                max="10000"
              />
              {getError('pacientesAgendados', inputs.pacientesAgendados) && (
                <span className="field-error">{getError('pacientesAgendados', inputs.pacientesAgendados)}</span>
              )}
            </div>

            <div className="form-group fade-up fade-up-delay-1">
              <label>
                Taxa de faltas (%)
                <span className="hint"> (pacientes que nao comparecem)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 20"
                value={inputs.taxaFaltas}
                onChange={(e) => update('taxaFaltas', e.target.value)}
                min="0"
                max="100"
              />
              {getError('taxaFaltas', inputs.taxaFaltas) && (
                <span className="field-error">{getError('taxaFaltas', inputs.taxaFaltas)}</span>
              )}
            </div>

            <div className="form-group fade-up fade-up-delay-2">
              <label>
                Ticket medio (R$)
                <span className="hint"> (valor medio por consulta)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 350"
                value={inputs.ticketMedio}
                onChange={(e) => update('ticketMedio', e.target.value)}
                min="1"
                max="100000"
              />
              {getError('ticketMedio', inputs.ticketMedio) && (
                <span className="field-error">{getError('ticketMedio', inputs.ticketMedio)}</span>
              )}
            </div>

            <div className="form-group fade-up fade-up-delay-2">
              <label>
                Taxa de aceite de orcamento (%)
                <span className="hint"> (% que aceita o tratamento proposto)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 40"
                value={inputs.taxaAceite}
                onChange={(e) => update('taxaAceite', e.target.value)}
                min="0"
                max="100"
              />
              {getError('taxaAceite', inputs.taxaAceite) && (
                <span className="field-error">{getError('taxaAceite', inputs.taxaAceite)}</span>
              )}
            </div>

            <div className="form-group fade-up fade-up-delay-3">
              <label>
                Taxa de retorno (%)
                <span className="hint"> (% que volta para nova consulta)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 30"
                value={inputs.taxaRetorno}
                onChange={(e) => update('taxaRetorno', e.target.value)}
                min="0"
                max="100"
              />
              {getError('taxaRetorno', inputs.taxaRetorno) && (
                <span className="field-error">{getError('taxaRetorno', inputs.taxaRetorno)}</span>
              )}
            </div>

            <div className="form-group fade-up fade-up-delay-3">
              <label>
                Gasto mensal com marketing (R$)
                <span className="hint"> (Google, Instagram, etc.)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 2000"
                value={inputs.gastoMarketing}
                onChange={(e) => update('gastoMarketing', e.target.value)}
                min="0"
                max="1000000"
              />
              {getError('gastoMarketing', inputs.gastoMarketing) && (
                <span className="field-error">{getError('gastoMarketing', inputs.gastoMarketing)}</span>
              )}
            </div>

            <div className="form-group full-width fade-up fade-up-delay-4">
              <label>
                Novos pacientes por mes
                <span className="hint"> (vindos do marketing)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 15"
                value={inputs.novosPacientes}
                onChange={(e) => update('novosPacientes', e.target.value)}
                min="0"
                max="10000"
              />
              {getError('novosPacientes', inputs.novosPacientes) && (
                <span className="field-error">{getError('novosPacientes', inputs.novosPacientes)}</span>
              )}
            </div>
          </div>

          <div className="form-actions fade-up fade-up-delay-4">
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? 'Calculando...' : 'Ver Meu Diagnostico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
