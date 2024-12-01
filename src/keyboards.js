const {Keyboard} = require("grammy");
const mainKeyboard = () => {
    return new Keyboard()
        .text('Поиск по имени журналиста')
        .text('Поиск по названию СМИ')
        .row()
        .text('Поиск по виду СМИ')
        .text('Добавить новый контакт журналиста')
        .row()
        .text('Отправить сообщение модератору')
        .resized();
}

const passInput = () => {
    return new Keyboard()
        .text('Пропустить ввод')
        .resized();
}

module.exports = {mainKeyboard, passInput};