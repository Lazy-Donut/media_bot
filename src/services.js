require('dotenv').config();
const {TokenModel, UserModel, ContactModel} = require('../model')
const sequelize = require('../db')
const {nameSearch, mediaSearch, mediaTypeSearch} = require('./search')
const {create, newContactMessage} = require('./contact-creation')
const {authorizationCheck} = require('./authorization')

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

module.exports = {
    processToken,
    create,
    authorizationCheck,
    nameSearch,
    mediaSearch,
    mediaTypeSearch,
    newContactMessage
};