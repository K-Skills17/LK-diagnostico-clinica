// =============================================================
// INSTRUÇÕES DE INSTALAÇÃO:
// =============================================================
// 1. Crie uma nova Google Sheet
// 2. Vá em Extensões > Apps Script
// 3. Apague o código existente e cole este script inteiro
// 4. Clique em "Implantar" > "Nova implantação"
// 5. Tipo: "App da Web"
// 6. Executar como: "Eu" (sua conta)
// 7. Quem tem acesso: "Qualquer pessoa"
// 8. Clique em "Implantar" e copie a URL gerada
// 9. Cole a URL no arquivo src/config.js do app
// =============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Data/Hora',
        'Nome',
        'Clínica',
        'Email',
        'Cidade',
        'Pacientes/Mês',
        'Taxa Faltas %',
        'Ticket Médio R$',
        'Taxa Aceite %',
        'Taxa Retorno %',
        'Gasto Marketing R$',
        'Novos Pacientes',
        'Perda Total/Mês R$',
        'Perda Anual R$',
        'Perda Faltas R$',
        'Perda Orçamentos R$',
        'Perda Retorno R$',
        'Desperdício Marketing R$',
        'Receita Atual R$',
        'Receita Potencial R$',
        'Custo por Paciente R$'
      ]);

      // Bold headers
      sheet.getRange(1, 1, 1, 21).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date().toLocaleString('pt-BR'),
      data.nome || '',
      data.clinica || '',
      data.email || '',
      data.cidade || '',
      data.pacientesAgendados || '',
      data.taxaFaltas || '',
      data.ticketMedio || '',
      data.taxaAceite || '',
      data.taxaRetorno || '',
      data.gastoMarketing || '',
      data.novosPacientes || '',
      data.perdaTotal || '',
      data.perdaAnual || '',
      data.perdaFaltas || '',
      data.perdaOrcamentos || '',
      data.perdaRetorno || '',
      data.desperdicioMarketing || '',
      data.receitaAtual || '',
      data.receitaPotencial || '',
      data.custoPorPaciente || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Diagnóstico API ativa' }))
    .setMimeType(ContentService.MimeType.JSON);
}
