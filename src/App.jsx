import { useState } from 'react';
import LandingPage from './components/LandingPage';
import DiagnosticForm from './components/DiagnosticForm';
import ResultsDashboard from './components/ResultsDashboard';
import { calculateDiagnostic } from './utils/calculations';
import { sendToSheet } from './utils/sheets';
import './App.css';

function App() {
  const [step, setStep] = useState('landing'); // landing | form | results
  const [leadData, setLeadData] = useState(null);
  const [results, setResults] = useState(null);

  const handleLeadSubmit = (data) => {
    setLeadData(data);
    setStep('form');
    window.scrollTo(0, 0);
  };

  const handleCalculate = (inputs) => {
    const diagnosticResults = calculateDiagnostic(inputs);
    setResults(diagnosticResults);
    setStep('results');
    window.scrollTo(0, 0);

    // Send lead + diagnostic data to Google Sheet
    sendToSheet({
      ...leadData,
      ...inputs,
      perdaTotal: diagnosticResults.perdaTotal,
      perdaAnual: diagnosticResults.perdaAnual,
      perdaFaltas: diagnosticResults.perdaFaltas,
      perdaOrcamentos: diagnosticResults.perdaOrcamentos,
      perdaRetorno: diagnosticResults.perdaRetorno,
      desperdicioMarketing: diagnosticResults.desperdicioMarketing,
      receitaAtual: diagnosticResults.receitaAtual,
      receitaPotencial: diagnosticResults.receitaPotencial,
      custoPorPaciente: diagnosticResults.custoPorPaciente,
    });
  };

  return (
    <>
      {step === 'landing' && <LandingPage onSubmit={handleLeadSubmit} />}
      {step === 'form' && (
        <DiagnosticForm leadData={leadData} onCalculate={handleCalculate} />
      )}
      {step === 'results' && (
        <ResultsDashboard results={results} leadData={leadData} />
      )}
    </>
  );
}

export default App;
