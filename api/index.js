const fastify = require('fastify')({ logger: true });
require('dotenv').config();

// Configuração do Swagger para documentação
fastify.register(require('@fastify/swagger'), {
  openapi: {
    info: {
      title: 'AutoSendBH API',
      description: 'API para automação de geração e envio de folha de ponto.',
      version: '1.0.0'
    },
    servers: [{
      url: 'http://localhost:3000'
    }],
    components: {}
  }
});

fastify.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});


const { generateTimesheetData } = require('../services/timeCalculator');
const { generatePDF } = require('../services/pdfGenerator');
const { sendTimesheetEmail } = require('../services/emailSender');

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

fastify.register(async (app) => {
  app.get('/api/cron/generate-timesheet', {
  schema: {
    description: 'Gera a folha de ponto do mês anterior e envia por e-mail (usado pelo Vercel Cron)',
    tags: ['Cron'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          message: { type: 'string' },
          messageId: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    // Como roda dia 01, geramos referente ao mês anterior
    const today = new Date();
    
    // Se hoje for dia 01/01/2026, queremos gerar Dezembro/2025
    let targetYear = today.getFullYear();
    let targetMonth = today.getMonth(); // 0 = Jan, 11 = Dez

    if (targetMonth === 0) {
      targetMonth = 12;
      targetYear -= 1;
    }

    const monthName = MONTH_NAMES[targetMonth - 1];

    fastify.log.info(`Iniciando geração da folha de ponto para ${monthName} / ${targetYear}`);

    // 1. Gerar os dados dos dias
    const timesheetData = await generateTimesheetData(targetYear, targetMonth);
    
    // 2. Gerar o PDF
    const pdfBuffer = await generatePDF(timesheetData, targetYear, monthName);

    // 3. Enviar o e-mail
    const emailInfo = await sendTimesheetEmail(pdfBuffer, targetYear, monthName);

    fastify.log.info(`E-mail enviado com sucesso: ${emailInfo.messageId}`);
    
    return {
      status: 'success',
      message: `Folha de ponto de ${monthName}/${targetYear} gerada e enviada com sucesso!`,
      messageId: emailInfo.messageId
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({
      status: 'error',
      message: error.message
    });
  }
});
});

// Apenas necessário se formos rodar localmente via `node api/index.js`
if (require.main === module) {
  fastify.listen({ port: 3000 }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Servidor rodando em http://localhost:3000`);
  });
}

// Exportar para o Vercel Serverless
module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};
