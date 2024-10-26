require('dotenv').config();
const {Bot, GrammyError, HttpError} = require('grammy');
const sequelize = require('./db')
const bot = new Bot(process.env.BOT_API_KEY);
const TokenModel = require('./model')

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Сбой подключения к ДБ', e)
    }

    bot.api.setMyCommands([
        {command: 'start', description: 'Запуск бота'},
        {command: 'help', description: 'Получить справку'}
    ])

    bot.command('start', async (ctx) => {
        await ctx.reply('Привет, новый пользователь! Введи токен для дальнейшей работы со мной.')
    }) //приветственное сообщение при первом контакте с ботом

    bot.command('help', async (ctx) => {
        await ctx.reply('Используйте /start для начала работы с ботом.')
    }) //справочное сообщение при вводе /help

    bot.on(":text", async (ctx) => {
        const token = await TokenModel.findOne({where: {token: ctx.message.text}});
        if (token === null) {
            await ctx.reply('Введен неверный токен');
        } else {
            await ctx.reply('Пользователь авторизован')
            token.destroy  ()
        }
    });

    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);
        const e = err.error;

        if (e instanceof GrammyError) {
            console.error('Error in request:', e.description);
        } else if (e instanceof HttpError) {
            console.error('Could not contact Telegram:', e);
        } else {
            console.error('Unknown error:', e);
        }
    });
    bot.start();
}
start()