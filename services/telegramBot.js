const TelegramBot = require('node-telegram-bot-api');

// Token do seu bot gerado pelo BotFather
const TOKEN = process.env.TELEGRAM_TOKEN || '8755213783:AAFUE3SxbLdtn0pCJHZXKZmEdAFQoaV60FE';

// Inicializa o bot corretamente
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 Bot do Telegram iniciado com sucesso!');

// Função que envia a mensagem de alerta para o chat específico
function enviarAlertaTelegram(chatId, mensagem) {
    if (!chatId) return;
    bot.sendMessage(chatId, `🚨 *ALERTA SPROUT* 🚨\n\n${mensagem}`, { parse_mode: 'Markdown' });
}

// Evento que responde ao comando /start no Telegram para descobrir o Chat ID
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Olá, produtor! 🌱 O seu Chat ID é: \`${chatId}\`. Copie este número para configurar os alertas!`, { parse_mode: 'Markdown' });
});

module.exports = { enviarAlertaTelegram };