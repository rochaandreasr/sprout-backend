const TelegramBot = require('node-telegram-bot-api');

// Coloque o token que o BotFather te deu aqui (ou coloque nas variáveis de ambiente .env depois)
const TOKEN = process.env.TELEGRAM_TOKEN || '8755213783';

// Cria o bot usando polling (para receber mensagens e interagir)
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 Bot do Telegram iniciado com sucesso!');

// Função para enviar alerta crítico para o produtor
function enviarAlertaTelegram(chatId, mensagem) {
    if (!chatId) return;
    bot.sendMessage(chatId, `🚨 *ALERTA SPROUT* 🚨\n\n${mensagem}`, { parse_mode: 'Markdown' });
}

// Responde quando alguém mandar /start no chat do bot
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Olá, produtor! 🌱 Seu ID de chat é: \`${chatId}\`. O Sprout está conectado e pronto para enviar alertas de umidade e insumos!`, { parse_mode: 'Markdown' });
});

module.exports = { enviarAlertaTelegram };