import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import DiagnosticForm from './components/DiagnosticForm';
import TeaserGate from './components/TeaserGate';
import ResultsDashboard from './components/ResultsDashboard';
import { calculateDiagnostic } from './utils/calculations';
import { sendToSheet } from './utils/sheets';
import { sendToWebhook } from './utils/webhook';
import { sendCapiEvent } from './utils/capi';
import './App.css';

function App() {
  const [step, setStep] = useState('landing'); // landing | form | teaser | results
  const [inputs, setInputs] = useState(null);
  const [results, setResults] = useState(null);
  const [leadData, setLeadData] = useState(null);

  // PageView on landing
  useEffect(() => {
    sendCapiEvent('PageView');
  }, []);

  const handleStart = () => {
    setStep('form');
    window.scrollTo(0, 0);
  };

  const handleCalculate = (formInputs) => {
    const diagnosticResults = calculateDiagnostic(formInputs);
    setInputs(formInputs);
    setResults(diagnosticResults);
    setStep('teaser');
    window.scrollTo(0, 0);

    // ViewContent — user submitted diagnostic data
    sendCapiEvent('ViewContent', {
      customData: {
        content_name: 'Diagnóstico Financeiro',
        content_category: 'diagnostic',
        value: diagnosticResults.perdaTotal,
        currency: 'BRL',
      },
    });
  };

  const handleUnlock = async (lead) => {
    setLeadData(lead);

    const resultsUrl = `${window.location.origin}${window.location.pathname}`;

    // Send to Google Sheet
    sendToSheet({
      ...lead,
      ...inputs,
      perdaTotal: results.perdaTotal,
      perdaAnual: results.perdaAnual,
      perdaFaltas: results.perdaFaltas,
      perdaOrcamentos: results.perdaOrcamentos,
      perdaRetorno: results.perdaRetorno,
      desperdicioMarketing: results.desperdicioMarketing,
      receitaAtual: results.receitaAtual,
      receitaPotencial: results.receitaPotencial,
      custoPorPaciente: results.custoPorPaciente,
    });

    // Send to chatbot webhook
    await sendToWebhook({
      lead: {
        nome: lead.nome,
        clinica: lead.clinica,
        whatsapp: lead.whatsapp.replace(/\D/g, ''),
        email: lead.email,
        cidade: lead.cidade,
      },
      inputs: {
        pacientesAgendados: inputs.pacientesAgendados,
        taxaFaltas: inputs.taxaFaltas,
        ticketMedio: inputs.ticketMedio,
        taxaAceite: inputs.taxaAceite,
        taxaRetorno: inputs.taxaRetorno,
        gastoMarketing: inputs.gastoMarketing,
        novosPacientes: inputs.novosPacientes,
      },
      results: {
        perdaTotal: results.perdaTotal,
        perdaAnual: results.perdaAnual,
        perdaFaltas: results.perdaFaltas,
        perdaOrcamentos: results.perdaOrcamentos,
        perdaRetorno: results.perdaRetorno,
        desperdicioMarketing: results.desperdicioMarketing,
        receitaAtual: results.receitaAtual,
        receitaPotencial: results.receitaPotencial,
        custoPorPaciente: results.custoPorPaciente,
        faltasPorMes: results.faltasPorMes,
        orcamentosRecusados: results.orcamentosRecusados,
        pacientesQueNaoVoltam: results.pacientesQueNaoVoltam,
      },
      resultsUrl,
    });

    // Lead — user submitted contact info to unlock report
    sendCapiEvent('Lead', {
      email: lead.email,
      phone: lead.whatsapp.replace(/\D/g, ''),
      nome: lead.nome,
      cidade: lead.cidade,
      customData: {
        content_name: 'Diagnóstico Financeiro - Lead',
        content_category: 'diagnostic',
        value: results.perdaTotal,
        currency: 'BRL',
      },
    });

    setStep('results');
    window.scrollTo(0, 0);
  };

  return (
    <>
      {step === 'landing' && <LandingPage onStart={handleStart} />}
      {step === 'form' && <DiagnosticForm onCalculate={handleCalculate} />}
      {step === 'teaser' && (
        <TeaserGate results={results} onUnlock={handleUnlock} />
      )}
      {step === 'results' && (
        <ResultsDashboard results={results} leadData={leadData} />
      )}
    </>
  );
}

export default App;
