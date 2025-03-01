require('dotenv').config();
const {TokenModel, UserModel, ContactModel} = require('../model')
const sequelize = require('../db')
const {nameSearch, mediaSearch, mediaTypeSearch} = require('./search')
const {create, newContactMessage} = require('./contact-creation')
const {authorizationCheck} = require('./authorization')
const { Parser } = require('@json2csv/plainjs');
const fs = require('node:fs');
const {mainKeyboard} = require("./keyboards");

const processToken = async (ctx) => {
    const token = await TokenModel.findOne({where: {token: ctx.message.text}});
    if (token === null) {
        await ctx.reply('Введен неверный токен');
    } else {
        await ctx.reply('Пользователь авторизован', {reply_markup: mainKeyboard()})
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
const exportToCsv = async (ctx) => {
    if (ctx.from.id == process.env.MODERATOR_TG_ID) {
        const contacts = await ContactModel.findAll();
        const parser = new Parser({
            fields: ['media', 'first_name', 'last_name'],
            header: ['СМИ', 'Имя', 'Фамилия'],
        });
        const csv = parser.parse(contacts);
        fs.writeFile('1.csv', csv, err => {
            if (err) {
                console.error(err);
            } else {
                // file written successfully
            }
        });
        await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

    }
}

module.exports = {
    processToken,
    create,
    authorizationCheck,
    nameSearch,
    mediaSearch,
    mediaTypeSearch,
    newContactMessage,
};