require('dotenv').config();
const {TokenModel, UserModel, ContactModel} = require('../model')
//const {Bot, GrammyError, HttpError, Keyboard} = require('grammy');
const sequelize = require('../db')
const {firstMessage, startMessage} = require('./msgs')
const {Keyboard} = require("grammy");

const authorizationCheck = async (ctx, withMessage = true) => {
    const user = await UserModel.findOne({where: {telegram_id: ctx.from.id}});
    if (user === null && withMessage) {
        await ctx.reply((startMessage), {parse_mode: "HTML"})
    }
    return user !== null;
}

const processToken = async (ctx) => {
    const token = await TokenModel.findOne({where: {token: ctx.message.text}});
    if (token === null) {
        await ctx.reply('Введен неверный токен');
    } else {
        await ctx.reply('Пользователь авторизован')
        token.destroy()
        const user = await UserModel.create({
            first_name: ctx.from.first_name,
            last_name: ctx.from.last_name,
            telegram_id: ctx.from.id,
            username: ctx.from.username,
        });
        await ctx.reply(`Привет, ${user.first_name}! Ваш ID: ${user.telegram_id}`)
    }
}

const create = async (ctx, contactData) => {
    Object.keys(contactData).forEach(key => {
        if (contactData[key] === 'Пропустить ввод') {
            contactData[key] = null
        }
    })
    if (await authorizationCheck(ctx) === true) {
        const contact = await ContactModel.create(contactData)
        const user = await UserModel.findOne({where: {telegram_id: ctx.from.id}});
        contact.setUser(user)
        contact.save()
        await ctx.reply('Новая запись создана', {reply_markup: {remove_keyboard: true}})
    }
}

const searchContacts = async (ctx, query) => {
    const contacts = await sequelize.query(query, {
        model: ContactModel,
        mapToModel: true, // pass true here if you have any mapped fields
    });
    if (contacts.length === 0) {
        await ctx.reply('Ничего не найдено')
        return;
    }
    contacts.forEach((contact) =>
        ctx.reply((
                `<b><i>Имя</i></b>: ${contact.first_name}\nФамилия: ${contact.last_name}\nСМИ: ${contact.media}\nТип СМИ: ${contact.media_type}\nTelegram: ${contact.telegram_username}\nПочта: ${contact.email}\nТелефон: ${contact.phone_number}\nСоцсети: ${contact.social_media_link}`),
            {parse_mode: "HTML"}))
}

const nameSearch = async (ctx) => {
    await searchContacts(ctx, 'SELECT * FROM contacts WHERE CONCAT(first_name, " ", COALESCE(last_name, "")) like "%' + ctx.msg.text + '%"')
}

const mediaSearch = async (ctx) => {
    await searchContacts(ctx, 'SELECT * FROM contacts WHERE media like "%' + ctx.msg.text + '%"')
}

const mediaTypeSearch = async (ctx) => {
    await searchContacts(ctx, 'SELECT * FROM contacts WHERE media_type like "%' + ctx.msg.text + '%"')
}

const newContactMessage = async (ctx, mode = null) => {
    let message = null
    let nextMode = null
    switch (mode) {
        case null:
            message = 'Введите имя журналиста'
            nextMode = 'first_name';
            break;
        case 'first_name':
            message = 'Введите фамилию журналиста'
            nextMode = 'last_name';
            break;
        case 'last_name':
            message = 'Введите название СМИ'
            nextMode = 'media';
            break;
        case 'media':
            message = 'Введите вид СМИ (например, деловые, лайфстайл)'
            nextMode = 'media_type';
            break;
        case 'media_type':
            message = 'Введите ссылку профиль журналиста в соцсетях:
            nextMode = 'social_media_link';
            break;
        case 'social_media_link':
            message = 'Введите email журналиста'
            nextMode = 'email';
            break;
        case 'email':
            message = 'Введите номер телефона журналиста'
            nextMode = 'phone_number';
            break;
        case 'phone_number':
            message = 'Введите контакт журналиста в телеграме'
            nextMode = 'telegram_username'
            break
        case 'telegram_username':
            message = 'Данные введены успешно'
            nextMode = 'done'
            break;
    }
    const keyboard = new Keyboard()
        .text('Пропустить ввод')
        .resized()

    await ctx.reply(message, nextMode === 'first_name' ? {} : {reply_markup: keyboard})
    return nextMode;
}

module.exports = {processToken, create, authorizationCheck, nameSearch, mediaSearch, mediaTypeSearch, newContactMessage};