require('dotenv').config();
const {Bot, GrammyError, HttpError, Keyboard} = require('grammy');
const sequelize = require('./db')
const bot = new Bot(process.env.BOT_API_KEY);
const {
    processToken,
    create,
    nameSearch,
    authorizationCheck,
    mediaSearch,
    mediaTypeSearch,
    newContactMessage
} = require('./src/services')
const {startMessage, helpMessage} = require('./src/msgs')

const chats = {};

const contactModes = {};

const newContacts = {};

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Сбой подключения к ДБ', e)
    }

    bot.api.setMyCommands([
        {command: 'start', description: 'Запуск бота'},
        {command: 'help', description: 'Получить справку'},

    ])

    bot.command('start', async (ctx) => {
        if (await authorizationCheck(ctx)) {
            chats[ctx.chatId] = undefined;
            const keyboard = new Keyboard()
                .text('Поиск по имени журналиста')
                .text('Поиск по названию СМИ')
                .row()
                .text('Поиск по виду СМИ')
                .text('Добавить новый контакт журналиста')
                .row()
                .text('Отправить сообщение модератору')
                .resized()

            await ctx.reply(`Привет, ${ctx.from.first_name}!`, {reply_markup: {remove_keyboard: true}})
            await ctx.reply(`Можно приступать к работе.`, {reply_markup: keyboard})
        }
    })//приветственное сообщение при первом контакте с ботом после авторизации

    bot.command('help', async (ctx) => {
        if (await authorizationCheck(ctx)) {
            await ctx.reply((helpMessage), {parse_mode: "HTML"})
        }
    }) //справочное сообщение при вводе /help

    bot.hears('Поиск по имени журналиста', async (ctx) => {
        if (await authorizationCheck(ctx) === true) {
            chats[ctx.chatId] = 'name_search';
            await ctx.reply('Введите имя журналиста для поиска')
        }
    })

    bot.hears('Поиск по названию СМИ', async (ctx) => {
        if (await authorizationCheck(ctx) === true) {
            chats[ctx.chatId] = 'media_search';
            await ctx.reply('Введите название СМИ для поиска')
        }
    })

    bot.hears('Поиск по виду СМИ', async (ctx) => {
        if (await authorizationCheck(ctx) === true) {
            chats[ctx.chatId] = 'media_type_search';
            await ctx.reply('Введите вид СМИ для поиска')
        }
    })

    bot.hears('Добавить новый контакт журналиста', async (ctx) => {
        if (await authorizationCheck(ctx) === true) {
            await ctx.reply(`Создание нового контакта`, {reply_markup: {remove_keyboard: true}})
            chats[ctx.chatId] = 'new_contact';
            contactModes[ctx.chatId] = await newContactMessage(ctx)
            newContacts[ctx.chatId] = {};
        }
    })


    bot.command('create', async (ctx) => {
        chats[ctx.chatId] = 'creating'
        await create(ctx)
    })

    bot.on(":text", async (ctx) => {
            switch (chats[ctx.chatId]) {
                case 'name_search':
                    nameSearch(ctx);
                    break;
                case 'media_search':
                    mediaSearch(ctx);
                    break;
                case'media_type_search':
                    mediaTypeSearch(ctx);
                    break;
                case 'new_contact':
                    const mode = contactModes[ctx.chatId]
                    newContacts[ctx.chatId][mode] = ctx.msg.text;
                    contactModes[ctx.chatId] = await newContactMessage(ctx, mode)
                    if (mode === 'telegram_username') {
                        await create(ctx, newContacts[ctx.chatId])
                        chats[ctx.chatId] = undefined;
                        contactModes[ctx.chatId] = undefined;
                        newContacts[ctx.chatId] = undefined;
                    }
                    break;
                case undefined:
                    await authorizationCheck(ctx, false) === true ? await ctx.reply('Выберите пункт меню для дальнейшей работы') : processToken(ctx);
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