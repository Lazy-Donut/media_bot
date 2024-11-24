require('dotenv').config();
const {TokenModel, UserModel, ContactModel} = require('../model')
//const {Bot, GrammyError, HttpError, Keyboard} = require('grammy');
const sequelize = require('../db')
const {firstMessage, startMessage} = require('./msgs')

const authorizationCheck = async (ctx, withMessage = true) => {
    const user = await UserModel.findOne({where: {telegram_id: ctx.from.id}});
    if (user === null && withMessage) {
        await ctx.reply((startMessage), { parse_mode: "HTML" })
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

const create = async (ctx) => {
    if (await authorizationCheck(ctx) === true) {
        const contact = await ContactModel.create({
            media: 'Test_media123',
            first_name: 'Vasya',
            last_name: 'Pupkin',
            media_type: 'Moscow',
            telegram_username: '@test_user',
            email: 'test@example.com',
            phone_number: '+7 (999) 999-99-99',
            social_media_link: 'https://test_social_media.com',
        })
        const user = await UserModel.findOne({where: {telegram_id: ctx.from.id}});
        contact.setUser(user)
        contact.save()
        await ctx.reply('Новая запись создана')
    }
}

const nameSearch = async (ctx) => {
    const searchString = ctx.msg.text
    const query = 'SELECT * FROM contacts WHERE CONCAT(first_name, " ", last_name) like "%' + searchString + '%"';
    const contacts = await sequelize.query(query, {
        model: ContactModel,
        mapToModel: true, // pass true here if you have any mapped fields
    });

    contacts.forEach((contact) =>
        ctx.reply((
            `<b><i>Имя</i></b>&#128231;: ${contact.first_name}\nФамилия: ${contact.last_name}\nСМИ: ${contact.media}\nТип СМИ: ${contact.media_type}\nTelegram: ${contact.telegram_username}\nПочта: ${contact.email}\nТелефон: ${contact.phone_number}\nСоцсети: ${contact.social_media_link}`),
    { parse_mode: "HTML" }))
}


module.exports = {processToken, create, authorizationCheck, nameSearch};