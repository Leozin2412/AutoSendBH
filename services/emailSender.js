const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTimesheetEmail(pdfBuffer, year, monthName) {
  const { EMAIL_USER, EMAIL_APP_PASSWORD, TARGET_EMAIL } = process.env;

  if (!EMAIL_USER || !EMAIL_APP_PASSWORD || !TARGET_EMAIL) {
    throw new Error('As variáveis de ambiente EMAIL_USER, EMAIL_APP_PASSWORD e TARGET_EMAIL devem estar configuradas.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: TARGET_EMAIL,
    subject: `Folha de Ponto - ${monthName} / ${year}`,
    text: `Olá,\n\nSegue em anexo a folha de ponto referente ao mês de ${monthName} de ${year}.\n\nGerado automaticamente.`,
    attachments: [
      {
        filename: `Folha_de_Ponto_${monthName}_${year}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = {
  sendTimesheetEmail,
};
