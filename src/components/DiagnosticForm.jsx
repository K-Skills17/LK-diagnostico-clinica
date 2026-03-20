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

export default function DiagnosticForm({ onCalculate }) {
  const [inputs, setInputs] = useState(defaultValues);

  const update = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const allFilled = Object.values(inputs).every((v) => v !== '');

  const handleSubmit = (e) => {
    e.preventDefault();
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
          <h2>Diagnóstico da Sua Clínica</h2>
          <p>
            Preencha com os números reais da sua clínica. Não precisa ser exato
            — uma estimativa já revela muito.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group fade-up fade-up-delay-1">
              <label>
                Pacientes agendados por mês
                <span className="hint"> (total de agendamentos)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 200"
                value={inputs.pacientesAgendados}
                onChange={(e) => update('pacientesAgendados', e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group fade-up fade-up-delay-1">
              <label>
                Taxa de faltas (%)
                <span className="hint"> (pacientes que não comparecem)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 20"
                value={inputs.taxaFaltas}
                onChange={(e) => update('taxaFaltas', e.target.value)}
                min="0"
                max="100"
              />
            </div>

            <div className="form-group fade-up fade-up-delay-2">
              <label>
                Ticket médio (R$)
                <span className="hint"> (valor médio por consulta)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 350"
                value={inputs.ticketMedio}
                onChange={(e) => update('ticketMedio', e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group fade-up fade-up-delay-2">
              <label>
                Taxa de aceite de orçamento (%)
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
              />
            </div>

            <div className="form-group full-width fade-up fade-up-delay-4">
              <label>
                Novos pacientes por mês
                <span className="hint"> (vindos do marketing)</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 15"
                value={inputs.novosPacientes}
                onChange={(e) => update('novosPacientes', e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="form-actions fade-up fade-up-delay-4">
            <button type="submit" className="btn-primary" disabled={!allFilled}>
              Ver Meu Diagnóstico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
