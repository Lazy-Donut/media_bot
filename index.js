require('dotenv').config();
const {Bot, GrammyError, HttpError, Keyboard} = require('grammy');
const sequelize = require('./db')
const bot = new Bot(process.env.BOT_API_KEY);
const {processToken, authorizationCheck, create, nameSearch} = require('./src/services')

const chats = {};

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
        if (await authorizationCheck(ctx)) {
            const keyboard = new Keyboard()
                .text('Поиск по имени')
                .text('Поиск по названию СМИ')
                .row()
                .text('Поиск по виду СМИ')
                .text('Добавить новый контакт журналиста')
                .row()
                .text('Отправить сообщение модератору')
                .resized()

            await ctx.reply(`Привет, ${ctx.from.first_name}! Можно приступать к работе.`, {reply_markup: keyboard})
        }
    })//приветственное сообщение при первом контакте с ботом

    bot.command('help', async (ctx) => {
        await ctx.reply('Используйте /start для начала работы с ботом.')
    }) //справочное сообщение при вводе /help

    bot.hears('Поиск по имени', async (ctx) => {
        if (await authorizationCheck(ctx) === true) {
            chats[ctx.chatId] = 'name_search';
            await ctx.reply('Введите имя журналиста для поиска')
        }
    })

    bot.command('create', async (ctx) => {
        chats[ctx.chatId] = 'creating'
        console.log(chats)
        await create(ctx)
    })

    bot.on(":text", async (ctx) => {
            switch (chats[ctx.chatId]) {
                case 'name_search':
                    nameSearch(ctx);
                    break;
                case undefined:
                    processToken(ctx);
                    break;
            }
        }
    );

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