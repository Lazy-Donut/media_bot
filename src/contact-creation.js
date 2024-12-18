const {ContactModel, UserModel} = require("../model");
const {authorizationCheck} = require('./authorization')
const {passInput, mainKeyboard} = require('./keyboards')

const create = async (ctx, contactData) => {
    Object.keys(contactData).forEach(key => {
        if (contactData[key] === 'Пропустить ввод') {
            contactData[key] = null
        } else if (contactData[key][0] === contactData[key][0].toLowerCase()) {
            contactData[key] = contactData[key].charAt(0).toUpperCase() + contactData[key].slice(1)
        }
    })
    if (await authorizationCheck(ctx) === true) {
        const contact = await ContactModel.create(contactData)
        const user = await UserModel.findOne({where: {telegram_id: ctx.from.id}});
        contact.setUser(user)
        contact.save()
        await ctx.reply('Новая запись создана', {reply_markup: mainKeyboard()})
    }
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
            message = 'Введите ссылку профиль журналиста в соцсетях'
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

    await ctx.reply(message, nextMode === 'first_name' ? {} : {reply_markup: passInput()})
    return nextMode;
}

module.exports = {create, newContactMessage};