const {ModeratorMessage} = require("../model");
require('dotenv').config();
const {Bot} = require("grammy");
const bot = new Bot(process.env.BOT_API_KEY);

const sendMessage = async (ctx) => {
    await ModeratorMessage.create({
        message: ctx.message.text,
    });
    await bot.api.sendMessage(process.env.MODERATOR_TG_ID, `Получено новое сообщение от ${ctx.from.first_name} @${ctx.from.username}: ${ctx.message.text}`);
    await ctx.reply('Сообщение админу отправлено');
}

module.exports = {sendMessage};