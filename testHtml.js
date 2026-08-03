const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { generateTimesheetData } = require('./services/timeCalculator');

async function run() {
  const timesheetData = await generateTimesheetData(2025, 12);
  const signaturePath = path.join(__dirname, 'Leonardo Monteiro.png');
  const signatureBase64 = fs.readFileSync(signaturePath, 'base64');
  const signatureDataUrl = `data:image/png;base64,${signatureBase64}`;

  const templatePath = path.join(__dirname, 'templates', 'timesheet.ejs');
  const html = await ejs.renderFile(templatePath, {
    days: timesheetData,
    year: 2025,
    monthName: 'Dezembro',
    signatureImage: signatureDataUrl
  });

  fs.writeFileSync('test.html', html);
  console.log('test.html generated!');
}

run().catch(console.error);
