require('dotenv').config();
const fs = require('fs');
const { generateTimesheetData } = require('./services/timeCalculator');
const { generatePDF } = require('./services/pdfGenerator');

async function testLocalPDF() {
  console.log('Iniciando teste de geração de PDF local...');
  
  try {
    // Vamos simular a geração para um mês específico, ex: Dezembro de 2025
    const year = 2025;
    const month = 12;
    const monthName = 'Dezembro';

    console.log(`1. Calculando dias úteis e horários para ${monthName}/${year}...`);
    const timesheetData = await generateTimesheetData(year, month);

    console.log('2. Gerando o PDF (isso pode levar alguns segundos)...');
    if (!process.env.CHROME_EXECUTABLE_PATH) {
      console.warn('\n⚠️ AVISO: A variável CHROME_EXECUTABLE_PATH não está definida no seu .env.');
      console.warn('Para rodar o gerador de PDF localmente no Windows, você precisará do caminho do Chrome.');
      console.warn('Exemplo: CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"\n');
    }

    const pdfBuffer = await generatePDF(timesheetData, year, monthName);

    // Salvar o arquivo no disco localmente
    const outputPath = 'Teste_Folha_De_Ponto.pdf';
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`\n✅ SUCESSO! O PDF foi gerado e salvo como: ${outputPath}`);
    console.log('Abra o arquivo para verificar como ficou o resultado visualmente.');

  } catch (error) {
    console.error('\n❌ Ocorreu um erro durante a geração do PDF:', error);
  }
}

testLocalPDF();
