const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// Os pacotes ESM (puppeteer-core e @sparticuz/chromium) serão importados dinamicamente na função

async function generatePDF(timesheetData, year, monthName) {
  const puppeteer = (await import('puppeteer-core')).default || await import('puppeteer-core');
  const chromium = (await import('@sparticuz/chromium')).default || await import('@sparticuz/chromium');
  
  // Ler a imagem da assinatura e converter para base64
  const signaturePath = path.join(__dirname, '..', 'Leonardo Monteiro.png');
  const signatureBase64 = fs.readFileSync(signaturePath, 'base64');
  const signatureDataUrl = `data:image/png;base64,${signatureBase64}`;

  // Renderizar o template EJS para HTML
  const templatePath = path.join(__dirname, '..', 'templates', 'timesheet.ejs');
  const html = await ejs.renderFile(templatePath, {
    days: timesheetData,
    year: year,
    monthName: monthName,
    signatureImage: signatureDataUrl
  });

  // Configurar o Puppeteer para rodar no Vercel / Local
  const executablePath = process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath();
  
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  
  // Setar o conteúdo HTML
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Gerar o PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm'
    }
  });

  await browser.close();

  return pdfBuffer;
}

module.exports = {
  generatePDF,
};
