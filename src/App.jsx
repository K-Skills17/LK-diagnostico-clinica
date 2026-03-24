import { useState, useEffect, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import { calculateDiagnostic } from './utils/calculations';
import { sendCapiEvent } from './utils/capi';
import './App.css';

// Lazy-load non-critical components to reduce initial bundle size
const DiagnosticForm = lazy(() => import('./components/DiagnosticForm'));
const TeaserGate = lazy(() => import('./components/TeaserGate'));
const ResultsDashboard = lazy(() => import('./components/ResultsDashboard'));

/* ── Shareable URL helpers ── */
function encodeResultsToHash(lead, inputs, results) {
  const payload = { l: lead, i: inputs, r: results };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeResultsFromHash(hash) {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!raw) return null;
    const json = decodeURIComponent(escape(atob(raw)));
    const { l, i, r } = JSON.parse(json);
    return { lead: l, inputs: i, results: r };
  } catch {
    return null;
  }
}

function App() {
  const [step, setStep] = useState('landing'); // landing | form | teaser | results
  const [inputs, setInputs] = useState(null);
  const [results, setResults] = useState(null);
  const [leadData, setLeadData] = useState(null);

  // Check for shared results in URL hash on load
  useEffect(() => {
    const saved = decodeResultsFromHash(window.location.hash);
    if (saved && saved.results && saved.lead) {
      // Re-derive breakdown (it has functions/colors that don't serialize well)
      const fullResults = calculateDiagnostic(saved.inputs);
      setLeadData(saved.lead);
      setInputs(saved.inputs);
      setResults(fullResults);
      setStep('results');
      return;
    }
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

    // Dynamically import non-critical utils only when needed
    const [{ sendToSheet }, { sendToWebhook }] = await Promise.all([
      import('./utils/sheets'),
      import('./utils/webhook'),
    ]);

    // Build shareable results URL with encoded data
    const hash = encodeResultsToHash(
      { nome: lead.nome, clinica: lead.clinica, cidade: lead.cidade },
      inputs,
      {
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
    );
    const resultsUrl = `${window.location.origin}${window.location.pathname}#${hash}`;

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

    // Update browser URL so user can also bookmark/share
    window.history.replaceState(null, '', resultsUrl);

    setStep('results');
    window.scrollTo(0, 0);
  };

  return (
    <>
      {step === 'landing' && <LandingPage onStart={handleStart} />}
      <Suspense fallback={null}>
        {step === 'form' && <DiagnosticForm onCalculate={handleCalculate} />}
        {step === 'teaser' && (
          <TeaserGate results={results} onUnlock={handleUnlock} />
        )}
        {step === 'results' && (
          <ResultsDashboard results={results} leadData={leadData} />
        )}
      </Suspense>
    </>
  );
}

export default App;
