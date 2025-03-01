const {Keyboard} = require("grammy");
const mainKeyboard = () => {
    return new Keyboard()
        .text('Поиск по имени журналиста')
        .text('Поиск по названию СМИ')
        .row()
        .text('Поиск по типу СМИ')
        .text('Поиск по профилю журналиста')
        .row()
        .text('Добавить новый контакт')
        .text('Отправить сообщение админу')
        .resized();
}

const passInput = () => {
    return new Keyboard()
        .text('Пропустить ввод')
        .resized();
}

module.exports = {mainKeyboard, passInput};