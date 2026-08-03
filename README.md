# AutoSendBH - Gerador Automático de Folha de Ponto

Este projeto foi desenvolvido para automatizar a criação e o envio mensal da Folha de Ponto Individual de Trabalho. 

## 🎯 O Problema

O usuário precisava de um sistema que:
1. Rodasse automaticamente todo **dia 01** do mês.
2. Gerasse uma planilha em PDF idêntica a um modelo Excel predefinido.
3. Preenchesse os dias do mês passado automaticamente, excluindo fins de semana e feriados (nacionais, estaduais e municipais de Volta Redonda/RJ).
4. Inserisse horários de trabalho de forma dinâmica (base de 09:00 às 12:00 e 13:00 às 18:00), com variações randômicas de até 10 minutos (ex: 09:04), mas que garantisse rigidamente as **8 horas de trabalho diárias**.
5. Embutisse uma assinatura digital (imagem em base64) em cada dia útil trabalhado.
6. Enviasse o PDF gerado diretamente para o e-mail do usuário.

## 💡 A Solução

Para garantir o funcionamento em ambientes *Serverless* (foco no deploy via Vercel), evitamos bibliotecas tradicionais de conversão de Excel (`exceljs` não exporta PDF, e conversores nativos dependem de binários como LibreOffice). 

A arquitetura foi desenhada da seguinte forma:
- **Fastify:** Framework web incrivelmente rápido e de baixo overhead para Node.js, responsável por expor a rota principal que o Vercel Cron acessa.
- **Vercel Cron Jobs:** Aciona a API todo dia 01 do mês (`0 10 1 * *`).
- **EJS (Templating):** Criação de um HTML visualmente idêntico à planilha do Excel.
- **Puppeteer-Core + Sparticuz/Chromium:** Converte o HTML diretamente em um buffer PDF no ambiente Cloud do Vercel.
- **BrasilAPI & Date-fns:** Calcula os dias do mês anterior, cruza com os finais de semana e consome feriados automaticamente, injetando feriados regionais.
- **Nodemailer:** Utilizando Senhas de Aplicativo do Google para garantir a entrega segura do PDF em anexo.

## 🚀 Como usar (Configuração Local e Deploy)

### Pré-requisitos
- Node.js v18 ou superior.
- Google Chrome instalado no ambiente local para testes.

### 1. Clonar e Instalar
```bash
git clone https://github.com/Leozin2412/AutoSendBH.git
cd AutoSendBH
npm install
```

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto copiando o `.env.example`:
```env
EMAIL_USER=seu_email@gmail.com
EMAIL_APP_PASSWORD=sua_senha_de_app_do_google
TARGET_EMAIL=teste@email.com
# Somente para teste local (Windows):
CHROME_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### 3. Teste Local de Geração (Apenas PDF)
Para visualizar se o PDF está sendo gerado perfeitamente sem precisar mandar o e-mail, rode o script local de testes:
```bash
node testLocal.js
```
Um arquivo `Teste_Folha_De_Ponto.pdf` será gerado na raiz.

### 4. Rodando o Servidor Fastify Local
O [Fastify](https://fastify.dev/) é o motor da nossa aplicação. Ele sobe rapidamente a rota API.
Para iniciar o servidor, execute:
```bash
node api/index.js
```
O servidor será iniciado em `http://localhost:3000`. 
Para testar o fluxo real (geração do PDF + envio de e-mail), acesse a rota do Cron:
`http://localhost:3000/api/cron/generate-timesheet`

> **Documentação Fastify:** Para entender mais sobre a escalabilidade e a estrutura de rotas (Requests e Replys) ou usar middlewares avançados, acesse a documentação oficial: [https://fastify.dev/docs/latest/](https://fastify.dev/docs/latest/). Em nossa aplicação, o Fastify atua delegando o evento `request` no serverless wrapper do Vercel.

### 5. Deploy no Vercel
O repositório está empacotado para o Vercel.
1. Conecte o repositório na plataforma do Vercel.
2. Adicione as variáveis (`EMAIL_USER`, `EMAIL_APP_PASSWORD`, `TARGET_EMAIL`).
3. O deploy será feito.
4. O `vercel.json` cuidará de alocar o servidor Fastify como uma *Serverless Function* e ativar o *Cron Job*.

---
Feito com 💻 e ☕ para automatizar a vida!
